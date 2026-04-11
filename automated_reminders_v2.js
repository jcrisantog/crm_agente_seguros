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

        const mexicoTimeParts = new Intl.DateTimeFormat("en-US", {
            timeZone: "America/Mexico_City",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false
        }).formatToParts(new Date());

        const hh = mexicoTimeParts.find(p => p.type === "hour").value;
        const mm = mexicoTimeParts.find(p => p.type === "minute").value;
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

        const todayMX = new Intl.DateTimeFormat("en-US", {
            timeZone: "America/Mexico_City",
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
        }).formatToParts(new Date());

        const Y = todayMX.find(p => p.type === "year").value;
        const M = todayMX.find(p => p.type === "month").value;
        const D = todayMX.find(p => p.type === "day").value;

        const todayDate = new Date(`${Y}-${M}-${D}T12:00:00`);
        const todayStr = todayDate.toISOString().split('T')[0];

        // 3. Obtener fecha máxima (HOY + máximo threshold)
        const thresholds = [
            parseInt(settings.threshold_1) || 0,
            parseInt(settings.threshold_2) || 0,
            parseInt(settings.threshold_3) || 0
        ];
        const maxThreshold = Math.max(...thresholds);

        const maxDate = new Date(todayDate);
        maxDate.setDate(maxDate.getDate() + maxThreshold);
        const maxDateStr = maxDate.toISOString().split('T')[0];

        log.push(`Umbrales configurados: ${thresholds.join(", ")} días`);
        log.push(`Buscando pólizas con payment_limit entre hoy (${todayStr}) y ${maxDateStr}`);

        // 4. Buscar pólizas que estén por vencer (o vencidas)
        // NOTA: Eliminamos el filtro de status en la consulta para manejarlo en el loop con mejor log
        const { data: policies, error: policiesError } = await client.database
            .from("client_products")
            .select("*, client:clients(full_name, email)")
            .lte("payment_limit", maxDateStr);

        if (policiesError) {
            log.push(`Error en consulta: ${policiesError.message}`);
            throw policiesError;
        }

        if (!policies || policies.length === 0) {
            return new Response(JSON.stringify({ message: "No hay pólizas dentro del rango de búsqueda", maxDateStr, log }), { status: 200, headers: corsHeaders });
        }

        log.push(`Se encontraron ${policies.length} pólizas dentro del rango de fecha.`);

        // 5. Enviar correos
        const resend = new Resend('re_hzWZVnEV_44fh2fey5yGVug74FFfJppvN');
        const results = [];

        for (const policy of policies) {
            const statusUpper = policy.status?.toUpperCase() || "";
            const clientEmail = policy.client?.email;

            // Calcular dias restantes
            const paymentLimit = new Date(policy.payment_limit + "T12:00:00");
            const diffTime = paymentLimit.getTime() - todayDate.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            const policyLog = {
                id: policy.id,
                client: policy.client?.full_name || "Desconocido",
                diffDays: diffDays,
                status: statusUpper
            };

            // Validaciones
            if (!clientEmail) {
                results.push({ ...policyLog, success: false, error: "Cliente sin email" });
                continue;
            }

            if (statusUpper !== "ACTIVA" && statusUpper !== "ACTIVA" && statusUpper !== "PENDIENTE") {
                results.push({ ...policyLog, success: false, error: `Estado omitido: ${policy.status}` });
                continue;
            }

            // Solo enviar si coincide con alguno de los umbrales EXACTAMENTE, o si es vencido (negativo)
            const isAtThreshold = thresholds.includes(diffDays);
            const isOverdue = diffDays <= 0;

            if (!isAtThreshold && !isOverdue) {
                results.push({ ...policyLog, success: false, error: `Días restantes (${diffDays}) no coinciden con umbrales (${thresholds.join(",")}) ni está vencida.` });
                continue;
            }

            // Proceder con envío
            try {
                let msgDías = diffDays > 0 ? `faltan ${diffDays} días` : (diffDays === 0 ? "vence hoy" : `está vencida por ${Math.abs(diffDays)} días`);

                let html = settings.email_template
                    .replaceAll("{{nombre}}", policy.client.full_name)
                    .replaceAll("{{fecha_pago}}", policy.payment_limit)
                    .replaceAll("{{dias_restantes}}", diffDays.toString())
                    .replaceAll("{{monto}}", `$${policy.total_premium || '0.00'}`);

                let subject = settings.email_subject
                    .replaceAll("{{nombre}}", policy.client.full_name);

                const { data, error: mailError } = await resend.emails.send({
                    from: 'Diego MN Seguros <onboarding@resend.dev>',
                    to: clientEmail,
                    subject: `${subject} (${msgDías})`,
                    html: html,
                });

                if (mailError) {
                    results.push({ ...policyLog, success: false, error: mailError.message });
                } else {
                    results.push({ ...policyLog, success: true, sent_at: new Date().toISOString() });
                }
            } catch (mailErr) {
                results.push({ ...policyLog, success: false, error: mailErr.message });
            }
        }

        const sentCount = results.filter(r => r.success).length;
        const analyzedCount = results.length;

        const finalResponse = { success: true, log, results };

        // 6. Guardar log en DB para historial
        await client.database.from("reminder_logs").insert({
            status: sentCount > 0 ? (sentCount === analyzedCount ? 'success' : 'partial') : 'success',
            message: `Proceso completado. ${sentCount} correos enviados de ${analyzedCount} pólizas analizadas.`,
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
        return new Response(JSON.stringify({ success: false, error: err.message, log }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
}
