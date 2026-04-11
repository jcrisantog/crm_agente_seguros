import { createClient } from "npm:@insforge/sdk";
import { Resend } from "npm:resend";

export default async function (req) {
    const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    if (req.method === "OPTIONS") {
        return new Response(null, { status: 204, headers: corsHeaders });
    }

    const log = [];

    try {
        const client = createClient({
            baseUrl: "https://fbmf8gg8.us-west.insforge.app",
            anonKey: "ik_5863262628f9d1dc6db41c29ffd7c8ef"
        });

        // 1. Obtener ajustes
        const { data: settings, error: settingsError } = await client.database
            .from("reminder_settings")
            .select("*")
            .limit(1)
            .maybeSingle();

        if (settingsError || !settings) {
            return new Response(JSON.stringify({ message: "No se encontraron ajustes de recordatorios" }), { status: 200 });
        }

        // 2. Verificar hora
        const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
        const force = req.url.includes("force=true") || body.force === true;

        const mexicoTime = new Intl.DateTimeFormat("en-US", {
            timeZone: "America/Mexico_City",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false
        }).formatToParts(new Date());

        const hh = mexicoTime.find(p => p.type === "hour").value;
        const mm = mexicoTime.find(p => p.type === "minute").value;
        const currentTime = `${hh}:${mm}`;
        const targetTime = settings.delivery_hour.substring(0, 5);

        log.push(`Hora actual (MX): ${currentTime}, Hora programada: ${targetTime}`);

        if (!force && currentTime !== targetTime) {
            return new Response(JSON.stringify({
                message: "No es la hora de envío",
                currentTime,
                targetTime,
                log
            }), { status: 200, headers: corsHeaders });
        }

        log.push(`Iniciando procesamiento a las ${new Date().toISOString()}`);

        // 3. Obtener fechas objetivo
        const thresholds = [settings.threshold_1, settings.threshold_2, settings.threshold_3].filter(t => t !== null);
        const targetDates = thresholds.map(t => {
            const todayMX = new Intl.DateTimeFormat("en-US", {
                timeZone: "America/Mexico_City",
                year: "numeric",
                month: "2-digit",
                day: "2-digit"
            }).formatToParts(new Date());

            const Y = todayMX.find(p => p.type === "year").value;
            const M = todayMX.find(p => p.type === "month").value;
            const D = todayMX.find(p => p.type === "day").value;

            const localDate = new Date(`${Y}-${M}-${D}T12:00:00`);
            localDate.setDate(localDate.getDate() + t);
            return localDate.toISOString().split('T')[0];
        });

        log.push(`Fechas objetivo de vencimiento: ${targetDates.join(", ")}`);

        // 4. Buscar pólizas (primero todas para depurar)
        const { data: allPolicies } = await client.database.from("client_products").select("id, payment_limit, status");
        log.push(`Total de pólizas en DB: ${allPolicies?.length || 0}`);
        log.push(`Ejemplo de fecha en DB: ${allPolicies?.[0]?.payment_limit}`);

        const { data: policies, error: policiesError } = await client.database
            .from("client_products")
            .select("*, client:clients(full_name, email, phone)")
            .in("payment_limit", targetDates)
            .or('status.eq.Activa,status.eq.ACTIVA');

        if (policiesError) {
            log.push(`Error en consulta: ${policiesError.message}`);
            throw policiesError;
        }
        if (!policies || policies.length === 0) {
            return new Response(JSON.stringify({ message: "No hay pólizas para recordar hoy", targetDates, log }), { status: 200 });
        }

        log.push(`Se encontraron ${policies.length} pólizas que vencen en estas fechas`);

        // 5. Enviar correos
        const resend = new Resend('re_hzWZVnEV_44fh2fey5yGVug74FFfJppvN');
        const results = [];

        for (const policy of policies) {
            if (!policy.client?.email) {
                results.push({ policy_id: policy.id, success: false, error: "Cliente sin email" });
                continue;
            }

            // Calcular dias restantes
            const paymentLimit = new Date(policy.payment_limit + "T12:00:00");
            const today = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Mexico_City" }));
            today.setHours(12, 0, 0, 0); // Normalizar
            paymentLimit.setHours(12, 0, 0, 0);

            const diffTime = paymentLimit - today;
            const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

            // Doble validación: solo procesar si coincide exactamente con un threshold
            const isTarget = thresholds.includes(diffDays);
            log.push(`Póliza ${policy.policy_number}: diffDays=${diffDays}, isTarget=${isTarget}, thresholds=[${thresholds.join(",")}]`);
            
            if (!isTarget && !force) {
                results.push({ 
                    policy_id: policy.id, 
                    success: false, 
                    error: `Omitida: ${diffDays} días no coincide con thresholds (${thresholds.join(",")})` 
                });
                continue;
            }

            // Determine card info BEFORE html replacement so we can use it
            const tArray = Array.isArray(policy.tarjetas) ? policy.tarjetas : [];
            const mC = tArray.find(t => t.is_main) || tArray[0] || {};
            const bF = mC.banco || "Pendiente";
            const tF = mC.no_tarjeta || "S/N";

            const formatL = (ds) => {
                if (!ds) return "";
                const d = new Date(ds + "T12:00:00");
                return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
            };

            const paymentLimitMinus10 = new Date(policy.payment_limit + "T12:00:00");
            paymentLimitMinus10.setDate(paymentLimitMinus10.getDate() - 10);
            const paymentLimitMinus10StrFormat = paymentLimitMinus10.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });

            // MSI logic
            const msiActive = settings.msi_active === true;
            let msiApplies = false;
            let promoDateToShowStr = paymentLimitMinus10StrFormat;
            
            if (msiActive && settings.msi_start_date && settings.msi_end_date) {
                const promoStartDate = new Date(settings.msi_start_date + "T00:00:00");
                const promoEndDate = new Date(settings.msi_end_date + "T23:59:59");
                const now = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Mexico_City" }));
                
                // Set hours to 0 to compare dates easily
                const nowNoTime = new Date(now);
                nowNoTime.setHours(0, 0, 0, 0);

                const promoStartNoTime = new Date(promoStartDate);
                promoStartNoTime.setHours(0, 0, 0, 0);
                const promoEndNoTime = new Date(promoEndDate);
                promoEndNoTime.setHours(0, 0, 0, 0);
                const paymentLimitMinus10NoTime = new Date(paymentLimitMinus10);
                paymentLimitMinus10NoTime.setHours(0, 0, 0, 0);

                if (nowNoTime >= promoStartNoTime && nowNoTime <= promoEndNoTime) {
                    if (promoEndNoTime <= paymentLimitMinus10NoTime) {
                        msiApplies = true;
                        promoDateToShowStr = formatL(settings.msi_end_date);
                    } else {
                        if (nowNoTime > paymentLimitMinus10NoTime) {
                            msiApplies = false;
                        } else {
                            msiApplies = true;
                            promoDateToShowStr = paymentLimitMinus10StrFormat;
                        }
                    }
                }
            }

            let html = "";
            let subject = "";
            let promocionWebhook = "no";
            let cuantosmsiWebhook = "N/A";
            let fechaMaxPagoWebhook = formatL(policy.payment_limit);

            const msiOptions = settings.msi_options || [];
            let formattedMsi = "";
            if (msiOptions.length > 0) {
                if (msiOptions.length === 1) formattedMsi = msiOptions[0];
                else formattedMsi = msiOptions.slice(0, -1).join(", ") + " y " + msiOptions[msiOptions.length - 1];
            }

            if (msiApplies) {
                html = (settings.msi_email_template || settings.email_template)
                    .replaceAll("{{nombre}}", policy.client.full_name)
                    .replaceAll("{{poliza}}", policy.policy_number || "Pendiente")
                    .replaceAll("{{msi_opciones}}", formattedMsi)
                    .replaceAll("{{fecha_pago}}", formatL(policy.payment_limit))
                    .replaceAll("{{dias_restantes}}", diffDays.toString())
                    .replaceAll("{{monto}}", `$${Number(policy.net_premium || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`)
                    .replaceAll("{{fecha_pago_menos_10}}", promoDateToShowStr)
                    .replaceAll("{{tarjeta_principal}}", tF)
                    .replaceAll("{{banco}}", bF)
                    .replaceAll("{{terminacion}}", tF);

                subject = (settings.msi_email_subject || settings.email_subject)
                    .replaceAll("{{nombre}}", policy.client.full_name)
                    .replaceAll("{{poliza}}", policy.policy_number || "");
                
                promocionWebhook = "si";
                cuantosmsiWebhook = formattedMsi;
                fechaMaxPagoWebhook = promoDateToShowStr;
            } else {
                html = settings.email_template
                    .replaceAll("{{nombre}}", policy.client.full_name)
                    .replaceAll("{{fecha_pago}}", formatL(policy.payment_limit))
                    .replaceAll("{{dias_restantes}}", diffDays.toString())
                    .replaceAll("{{monto}}", `$${Number(policy.net_premium || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`)
                    .replaceAll("{{banco}}", bF)
                    .replaceAll("{{terminacion}}", tF);
                
                subject = settings.email_subject
                    .replaceAll("{{nombre}}", policy.client.full_name);
            }

            const { data: emailData, error: emailError } = await resend.emails.send({
                from: 'Diego MN Seguros <onboarding@resend.dev>',
                to: policy.client.email,
                subject: subject,
                html: html,
            });

            // individual webhook call to n8n
            try {
                const webhookResponse = await fetch("https://n8n.minegocio-digital.com/webhook/3fb72394-de4b-410d-ab28-8ca0dfbc6547", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'api_token': '12345678'
                    },
                    body: JSON.stringify({
                        promocion: promocionWebhook,
                        nombre: policy.client.full_name,
                        telefono: policy.client?.phone || "",
                        fecha_corte: formatL(policy.payment_limit),
                        monto: `$${Number(policy.net_premium || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`,
                        cuantosmsi: cuantosmsiWebhook,
                        fecha_max_pago: fechaMaxPagoWebhook,
                        banco: bF,
                        terminacion: tF,
                        policy_number: policy.policy_number,
                        source: 'automated_batch_server'
                    })
                });
                
                if (!webhookResponse.ok) {
                    const errText = await webhookResponse.text();
                    console.error(`Webhook N8N respondió con error ${webhookResponse.status}: ${errText}`);
                }
            } catch (wErr) {
                console.error("Webhook processing error:", wErr.message);
            }

            results.push({
                policy_id: policy.id,
                client: policy.client.full_name,
                success: !emailError,
                error: emailError?.message,
                sent_at: new Date().toISOString()
            });
        }

        const finalResponse = { success: true, log, results };

        // 6. Guardar log en DB para historial
        await client.database.from("reminder_logs").insert({
            status: results.every(r => r.success) ? 'success' : (results.some(r => r.success) ? 'partial' : 'error'),
            message: `Ejecución finalizada con ${results.filter(r => r.success).length} envíos exitosos.`,
            policies_count: policies.length,
            sent_count: results.filter(r => r.success).length,
            details: finalResponse
        });

        return new Response(JSON.stringify(finalResponse), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

    } catch (err) {
        console.error("Fatal error:", err);

        // Intentar guardar log de error si es posible
        try {
            const clientErr = createClient({
                baseUrl: "https://fbmf8gg8.us-west.insforge.app",
                anonKey: "ik_5863262628f9d1dc6db41c29ffd7c8ef"
            });
            await clientErr.database.from("reminder_logs").insert({
                status: 'error',
                message: 'Error fatal en la ejecución',
                error_details: err.message,
                details: { log }
            });
        } catch (dbErr) {
            console.error("Could not save error log to DB:", dbErr);
        }

        return new Response(JSON.stringify({ success: false, error: err.message, log }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
}
