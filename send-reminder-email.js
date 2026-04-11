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

    try {
        const { client_id, policy_id } = await req.json();

        const client = createClient({
            baseUrl: Deno.env.get("INSFORGE_BASE_URL"),
            anonKey: Deno.env.get("ANON_KEY"),
        });

        // 1. Obtener datos
        const { data: userData } = await client.database
            .from("clients")
            .select("full_name, email")
            .eq("id", client_id)
            .single();

        const { data: policyData } = await client.database
            .from("client_products")
            .select("policy_number, total_premium, net_premium, payment_limit, tarjetas")
            .eq("id", policy_id)
            .single();

        const { data: settings } = await client.database
            .from("reminder_settings")
            .select("*")
            .limit(1)
            .maybeSingle();

        if (!userData || !policyData || !settings) {
            throw new Error("Datos insuficientes para enviar el correo (Cliente, Póliza o Ajustes faltantes)");
        }

        // 2. Cálculos
        const paymentLimit = new Date(policyData.payment_limit);
        const now = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Mexico_City" }));

        const diffTime = paymentLimit - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Determinar tarjeta
        const tArray = Array.isArray(policyData.tarjetas) ? policyData.tarjetas : [];
        const mC = tArray.find(t => t.is_main) || tArray[0] || {};
        const bF = mC.banco || "Pendiente";
        const tF = mC.no_tarjeta || "S/N";

        const formatL = (ds) => {
            if (!ds) return "";
            const d = new Date(ds + "T12:00:00");
            return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
        };

        const paymentLimitMinus10 = new Date(policyData.payment_limit + "T12:00:00");
        paymentLimitMinus10.setDate(paymentLimitMinus10.getDate() - 10);
        const paymentLimitMinus10StrFormat = paymentLimitMinus10.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });

        // MSI logic
        const msiActive = settings.msi_active === true;
        let msiApplies = false;
        let promoDateToShowStr = paymentLimitMinus10StrFormat;
        
        if (msiActive && settings.msi_start_date && settings.msi_end_date) {
            const promoStartDate = new Date(settings.msi_start_date + "T00:00:00");
            const promoEndDate = new Date(settings.msi_end_date + "T23:59:59");
            
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

        const msiOptions = settings.msi_options || [];
        let formattedMsi = "";
        if (msiOptions.length > 0) {
            if (msiOptions.length === 1) formattedMsi = msiOptions[0];
            else formattedMsi = msiOptions.slice(0, -1).join(", ") + " y " + msiOptions[msiOptions.length - 1];
        }

        let html = "";
        let subject = "";

        if (msiApplies) {
            html = (settings.msi_email_template || settings.email_template)
                .replaceAll("{{nombre}}", userData.full_name)
                .replaceAll("{{poliza}}", policyData.policy_number || "Pendiente")
                .replaceAll("{{msi_opciones}}", formattedMsi)
                .replaceAll("{{fecha_pago}}", formatL(policyData.payment_limit))
                .replaceAll("{{dias_restantes}}", diffDays.toString())
                .replaceAll("{{monto}}", `$${Number(policyData.net_premium || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`)
                .replaceAll("{{fecha_pago_menos_10}}", promoDateToShowStr)
                .replaceAll("{{tarjeta_principal}}", tF)
                .replaceAll("{{banco}}", bF)
                .replaceAll("{{terminacion}}", tF);

            subject = (settings.msi_email_subject || settings.email_subject)
                .replaceAll("{{nombre}}", userData.full_name)
                .replaceAll("{{poliza}}", policyData.policy_number || "");
        } else {
            html = settings.email_template
                .replaceAll("{{nombre}}", userData.full_name)
                .replaceAll("{{fecha_pago}}", formatL(policyData.payment_limit))
                .replaceAll("{{dias_restantes}}", diffDays.toString())
                .replaceAll("{{monto}}", `$${Number(policyData.net_premium || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`)
                .replaceAll("{{banco}}", bF)
                .replaceAll("{{terminacion}}", tF);

            subject = settings.email_subject
                .replaceAll("{{nombre}}", userData.full_name);
        }

        // 4. Enviar con Resend
        // API KEY enviada por el usuario
        const resend = new Resend('re_hzWZVnEV_44fh2fey5yGVug74FFfJppvN');
        const { data, error } = await resend.emails.send({
            from: 'Diego MN Seguros <onboarding@resend.dev>',
            to: userData.email || 'jcrisantog@gmail.com', // Fallback al correo del usuario si el cliente no tiene
            subject: subject,
            html: html,
        });

        if (error) {
            console.error("Resend Error:", error);
            throw error;
        }

        return new Response(JSON.stringify({ success: true, data }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    } catch (err) {
        console.error("Function Error:", err.message);
        return new Response(JSON.stringify({ success: false, error: err.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
}
