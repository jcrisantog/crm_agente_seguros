import { createClient } from "npm:@insforge/sdk";
import { Resend } from "npm:resend";

const BATCH_VERSION = "policy-msi-resolution-2026-07-14";

const getEnv = (name) => globalThis.Deno?.env?.get(name) || "";

const formatMxnAmount = (amount) => {
    const value = Number(amount ?? 0);
    const safeValue = Number.isFinite(value) ? value : 0;
    return `$${safeValue.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const MSI_OPTIONS = ["3", "6", "9", "12"];

const normalizeMsiOptions = (options) => {
    const rawOptions = Array.isArray(options)
        ? options
        : typeof options === "string"
            ? options.split(",")
            : [];

    return rawOptions
        .map((option) => String(option).trim())
        .filter((option) => MSI_OPTIONS.includes(option));
};

const formatMsiOptions = (options) => {
    if (options.length === 0) return "";
    if (options.length === 1) return options[0];
    return `${options.slice(0, -1).join(", ")} y ${options[options.length - 1]}`;
};

const normalizeDateValue = (dateValue) => {
    if (!dateValue) return "";
    if (dateValue instanceof Date && !Number.isNaN(dateValue.getTime())) {
        return dateValue.toISOString().slice(0, 10);
    }

    const rawValue = String(dateValue).trim();
    const isoDateMatch = rawValue.match(/^(\d{4}-\d{2}-\d{2})/);
    if (isoDateMatch) return isoDateMatch[1];

    const parsedDate = new Date(rawValue);
    if (Number.isNaN(parsedDate.getTime())) return "";
    return parsedDate.toISOString().slice(0, 10);
};

const getLocalNoonDate = (dateValue) => {
    const normalizedDate = normalizeDateValue(dateValue);
    if (!normalizedDate) return null;
    const date = new Date(`${normalizedDate}T12:00:00`);
    return Number.isNaN(date.getTime()) ? null : date;
};

const getMexicoDateNoTime = () => {
    const mexicoDate = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Mexico_City" }));
    mexicoDate.setHours(0, 0, 0, 0);
    return mexicoDate;
};

const getDateNoTime = (dateStr) => {
    const normalizedDate = normalizeDateValue(dateStr);
    const date = new Date(`${normalizedDate}T00:00:00`);
    if (Number.isNaN(date.getTime())) return null;
    date.setHours(0, 0, 0, 0);
    return date;
};

const resolveMsiCandidate = (config, source, paymentLimit, formatL) => {
    const emptyResult = {
        applies: false,
        source: null,
        formattedOptions: "",
        promoDateToShow: formatL(paymentLimit),
    };

    const options = normalizeMsiOptions(config?.msi_options);
    if (options.length === 0 || !config?.msi_start_date || !config?.msi_end_date || !paymentLimit) {
        return emptyResult;
    }

    const paymentLimitMinus10 = getLocalNoonDate(paymentLimit);
    if (!paymentLimitMinus10) return emptyResult;
    paymentLimitMinus10.setDate(paymentLimitMinus10.getDate() - 10);

    const nowNoTime = getMexicoDateNoTime();
    const promoStartNoTime = getDateNoTime(config.msi_start_date);
    const promoEndNoTime = getDateNoTime(config.msi_end_date);
    if (!promoStartNoTime || !promoEndNoTime) return emptyResult;

    const paymentLimitMinus10NoTime = new Date(paymentLimitMinus10);
    paymentLimitMinus10NoTime.setHours(0, 0, 0, 0);

    if (nowNoTime < promoStartNoTime || nowNoTime > promoEndNoTime) {
        return emptyResult;
    }

    let promoDateToShow = "";
    if (promoEndNoTime <= paymentLimitMinus10NoTime) {
        promoDateToShow = formatL(config.msi_end_date);
    } else if (nowNoTime <= paymentLimitMinus10NoTime) {
        promoDateToShow = paymentLimitMinus10.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
    } else {
        return emptyResult;
    }

    return {
        applies: true,
        source,
        formattedOptions: formatMsiOptions(options),
        promoDateToShow,
    };
};

const resolveEffectiveMsi = ({ settings, policy, paymentLimit, formatL }) => {
    if (policy?.msi_promo_active === true) {
        return resolveMsiCandidate(policy, "policy", paymentLimit, formatL);
    }

    if (settings?.msi_active === true) {
        return resolveMsiCandidate(settings, "global", paymentLimit, formatL);
    }

    return {
        applies: false,
        source: null,
        formattedOptions: "",
        promoDateToShow: formatL(paymentLimit),
    };
};

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
        const insforgeBaseUrl = getEnv("INSFORGE_BASE_URL");
        const insforgeAnonKey = getEnv("ANON_KEY") || getEnv("INSFORGE_ANON_KEY");
        const n8nWebhookUrl = getEnv("N8N_WEBHOOK_URL");
        const n8nApiToken = getEnv("N8N_API_TOKEN");

        if (!insforgeBaseUrl || !insforgeAnonKey) {
            return new Response(JSON.stringify({
                success: false,
                error: "Falta configurar INSFORGE_BASE_URL o ANON_KEY para automated-reminders-batch.",
            }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }

        const client = createClient({
            baseUrl: insforgeBaseUrl,
            anonKey: insforgeAnonKey
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

        log.push(`Version batch: ${BATCH_VERSION}`);
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

        const runDateParts = new Intl.DateTimeFormat("en-US", {
            timeZone: "America/Mexico_City",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        }).formatToParts(new Date());
        const runY = runDateParts.find(p => p.type === "year").value;
        const runM = runDateParts.find(p => p.type === "month").value;
        const runD = runDateParts.find(p => p.type === "day").value;
        const runKey = `automated-reminders-batch:${runY}-${runM}-${runD}:${currentTime}:force=${force}`;
        const { error: lockError } = await client.database
            .from("reminder_run_locks")
            .insert([{ run_key: runKey }]);

        if (lockError) {
            log.push(`Ejecución duplicada bloqueada por lock: ${runKey}`);
            return new Response(JSON.stringify({
                success: true,
                duplicate: true,
                message: "Esta ejecución ya estaba en proceso o ya se ejecutó en este minuto.",
                log,
            }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }

        // 4. Buscar pólizas (primero todas para depurar)
        const { data: allPolicies } = await client.database.from("client_products").select("id, payment_limit, status");
        log.push(`Total de pólizas en DB: ${allPolicies?.length || 0}`);
        log.push(`Ejemplo de fecha en DB: ${allPolicies?.[0]?.payment_limit}`);

        const { data: policies, error: policiesError } = await client.database
            .from("client_products")
            .select("*, client:clients(full_name, alias, email, phone)")
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
        const resendApiKey = getEnv("RESEND_API_KEY");
        if (!resendApiKey) {
            throw new Error("Falta configurar RESEND_API_KEY en el entorno de la funcion.");
        }

        const resend = new Resend(resendApiKey);
        const results = [];

        for (const policy of policies) {
            if (!policy.client?.email) {
                results.push({ policy_id: policy.id, success: false, error: "Cliente sin email" });
                continue;
            }

            const clientName = policy.client.alias?.trim() || policy.client.full_name;

            // Calcular dias restantes
            const normalizedPaymentLimit = normalizeDateValue(policy.payment_limit);
            const paymentLimit = getLocalNoonDate(policy.payment_limit);
            if (!paymentLimit) {
                results.push({
                    policy_id: policy.id,
                    success: false,
                    error: `Fecha de vencimiento invalida: ${policy.payment_limit}`,
                });
                continue;
            }

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

            const sendKey = `reminder:${policy.id}:${normalizedPaymentLimit}:diff=${diffDays}`;
            const { error: sendLockError } = await client.database
                .from("reminder_send_locks")
                .insert([{
                    send_key: sendKey,
                    policy_id: String(policy.id),
                    payment_limit: normalizedPaymentLimit,
                    source: "automated-reminders-batch",
                }]);

            if (sendLockError) {
                log.push(`Envio duplicado omitido por lock de poliza ${policy.policy_number}: ${sendKey}`);
                results.push({
                    policy_id: policy.id,
                    success: false,
                    skipped: true,
                    duplicate: true,
                    error: "Omitida por lock de envio duplicado",
                });
                continue;
            }

            // Determine card info BEFORE html replacement so we can use it
            const tArray = Array.isArray(policy.tarjetas) ? policy.tarjetas : [];
            const mC = tArray.find(t => t.is_main) || tArray[0] || {};
            const bF = mC.banco || "Pendiente";
            const tF = mC.no_tarjeta || "S/N";

            const formatL = (ds) => {
                const d = getLocalNoonDate(ds);
                if (!d) return "";
                return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
            };

            const effectiveMsi = resolveEffectiveMsi({
                settings,
                policy,
                paymentLimit: normalizedPaymentLimit,
                formatL,
            });
            log.push(`MSI ${policy.policy_number}: source=${effectiveMsi.source || "none"}, applies=${effectiveMsi.applies}, options=${effectiveMsi.formattedOptions || "N/A"}, policyActive=${policy.msi_promo_active === true}, policyOptions=${formatMsiOptions(normalizeMsiOptions(policy.msi_options)) || "N/A"}, globalActive=${settings.msi_active === true}, globalOptions=${formatMsiOptions(normalizeMsiOptions(settings.msi_options)) || "N/A"}`);

            let html = "";
            let subject = "";
            let promocionWebhook = "no";
            let cuantosmsiWebhook = "N/A";
            let fechaMaxPagoWebhook = formatL(normalizedPaymentLimit);

            const primaMnxFormatted = formatMxnAmount(policy.prima_mnx);

            if (effectiveMsi.applies) {
                html = (settings.msi_email_template || settings.email_template)
                    .replaceAll("{{nombre}}", clientName)
                    .replaceAll("{{poliza}}", policy.policy_number || "Pendiente")
                    .replaceAll("{{msi_opciones}}", effectiveMsi.formattedOptions)
                    .replaceAll("{{fecha_pago}}", formatL(normalizedPaymentLimit))
                    .replaceAll("{{dias_restantes}}", diffDays.toString())
                    .replaceAll("{{monto}}", primaMnxFormatted)
                    .replaceAll("{{prima_mnx}}", primaMnxFormatted)
                    .replaceAll("{{fecha_pago_menos_10}}", effectiveMsi.promoDateToShow)
                    .replaceAll("{{tarjeta_principal}}", tF)
                    .replaceAll("{{banco}}", bF)
                    .replaceAll("{{terminacion}}", tF);

                subject = (settings.msi_email_subject || settings.email_subject)
                    .replaceAll("{{nombre}}", clientName)
                    .replaceAll("{{poliza}}", policy.policy_number || "");

                promocionWebhook = "si";
                cuantosmsiWebhook = effectiveMsi.formattedOptions;
                fechaMaxPagoWebhook = effectiveMsi.promoDateToShow;
            } else {
                html = settings.email_template
                    .replaceAll("{{nombre}}", clientName)
                    .replaceAll("{{fecha_pago}}", formatL(normalizedPaymentLimit))
                    .replaceAll("{{dias_restantes}}", diffDays.toString())
                    .replaceAll("{{monto}}", primaMnxFormatted)
                    .replaceAll("{{prima_mnx}}", primaMnxFormatted)
                    .replaceAll("{{banco}}", bF)
                    .replaceAll("{{terminacion}}", tF);

                subject = settings.email_subject
                    .replaceAll("{{nombre}}", clientName);
            }

            const { error: emailError } = await resend.emails.send({
                from: 'Diego MN Seguros <no-reply@carteraprime.minegocio-digital.com>',
                to: policy.client.email,
                subject: subject,
                html: html,
            });

            // individual webhook call to n8n
            try {
                if (!n8nWebhookUrl || !n8nApiToken) {
                    log.push("WhatsApp omitido: falta configurar N8N_WEBHOOK_URL o N8N_API_TOKEN.");
                } else {
                    const webhookResponse = await fetch(n8nWebhookUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'api_token': n8nApiToken
                        },
                        body: JSON.stringify({
                            promocion: promocionWebhook,
                            nombre: clientName,
                            telefono: policy.client?.phone || "",
                            fecha_corte: formatL(normalizedPaymentLimit),
                            monto: primaMnxFormatted,
                            cuantosmsi: cuantosmsiWebhook,
                            fecha_max_pago: fechaMaxPagoWebhook,
                            banco: bF,
                            terminacion: tF,
                            policy_number: policy.policy_number,
                            msi_source: effectiveMsi.source || "none",
                            source: 'automated_batch_server'
                        }),
                        signal: AbortSignal.timeout(10000)
                    });

                    if (!webhookResponse.ok) {
                        const errText = await webhookResponse.text();
                        console.error(`Webhook N8N respondió con error ${webhookResponse.status}: ${errText}`);
                    }
                }
            } catch (wErr) {
                console.error("Webhook processing error:", wErr.message);
            }

            results.push({
                policy_id: policy.id,
                client: clientName,
                success: !emailError,
                error: emailError?.message,
                msi_source: effectiveMsi.source || "none",
                msi_options: effectiveMsi.formattedOptions || "",
                sent_at: new Date().toISOString()
            });
        }

        const sentCount = results.filter(r => r.success).length;
        const skippedCount = results.filter(r => r.skipped).length;
        const failureCount = results.filter(r => !r.success && !r.skipped).length;
        const logStatus = failureCount > 0
            ? (sentCount > 0 || skippedCount > 0 ? 'partial' : 'error')
            : 'success';
        const logMessage = sentCount > 0
            ? `Ejecución finalizada con ${sentCount} envíos exitosos${skippedCount > 0 ? ` y ${skippedCount} omitidos por duplicado` : ""}.`
            : skippedCount > 0
                ? `Ejecución omitida: ${skippedCount} recordatorio(s) ya habían sido enviados para este vencimiento.`
                : `Ejecución finalizada con 0 envíos exitosos.`;

        const finalResponse = { success: true, log, results };

        // 6. Guardar log en DB para historial
        await client.database.from("reminder_logs").insert({
            status: logStatus,
            message: logMessage,
            policies_count: policies.length,
            sent_count: sentCount,
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
            const insforgeBaseUrl = getEnv("INSFORGE_BASE_URL");
            const insforgeAnonKey = getEnv("ANON_KEY") || getEnv("INSFORGE_ANON_KEY");
            if (!insforgeBaseUrl || !insforgeAnonKey) throw new Error("No hay variables InsForge para guardar el error fatal.");

            const clientErr = createClient({
                baseUrl: insforgeBaseUrl,
                anonKey: insforgeAnonKey
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
