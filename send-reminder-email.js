import { createClient } from "npm:@insforge/sdk";
import { Resend } from "npm:resend";

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

const getErrorMessage = (error, fallback = "No se pudo enviar el correo de recordatorio.") => {
    if (error instanceof Error && error.message) return error.message;
    if (typeof error === "string" && error.trim()) return error;
    if (error && typeof error === "object") {
        return error.message || error.error || error.details || fallback;
    }
    return fallback;
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
            .select("policy_number, prima_mnx, payment_limit, tarjetas, msi_promo_active, msi_options, msi_start_date, msi_end_date")
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
        const normalizedPaymentLimit = normalizeDateValue(policyData.payment_limit);
        const paymentLimit = getLocalNoonDate(policyData.payment_limit);
        if (!paymentLimit) {
            return new Response(JSON.stringify({
                success: false,
                error: "La poliza no tiene una fecha de vencimiento valida para enviar el recordatorio.",
            }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }

        const now = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Mexico_City" }));

        const diffTime = paymentLimit - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Determinar tarjeta
        const tArray = Array.isArray(policyData.tarjetas) ? policyData.tarjetas : [];
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
            policy: policyData,
            paymentLimit: normalizedPaymentLimit,
            formatL,
        });

        let html = "";
        let subject = "";
        const primaMnxFormatted = formatMxnAmount(policyData.prima_mnx);

        if (effectiveMsi.applies) {
            html = (settings.msi_email_template || settings.email_template)
                .replaceAll("{{nombre}}", userData.full_name)
                .replaceAll("{{poliza}}", policyData.policy_number || "Pendiente")
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
                .replaceAll("{{nombre}}", userData.full_name)
                .replaceAll("{{poliza}}", policyData.policy_number || "");
        } else {
            html = settings.email_template
                .replaceAll("{{nombre}}", userData.full_name)
                .replaceAll("{{fecha_pago}}", formatL(normalizedPaymentLimit))
                .replaceAll("{{dias_restantes}}", diffDays.toString())
                .replaceAll("{{monto}}", primaMnxFormatted)
                .replaceAll("{{prima_mnx}}", primaMnxFormatted)
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

        return new Response(JSON.stringify({ success: true, channel: "email", data }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    } catch (err) {
        const message = getErrorMessage(err);
        console.error("Function Error:", message, err);
        return new Response(JSON.stringify({ success: false, channel: "email", error: message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
}
