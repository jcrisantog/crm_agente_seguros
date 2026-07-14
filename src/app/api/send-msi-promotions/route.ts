import { createClient } from "@insforge/sdk";
import { Resend } from "resend";
import { NextResponse } from "next/server";

// Using the same credentials as in other endpoints or scripts (automated_reminders_v2.js)
const insforgeUrl = process.env.NEXT_PUBLIC_INSFORGE_URL || "https://fbmf8gg8.us-west.insforge.app";
const insforgeAnonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY || "ik_5863262628f9d1dc6db41c29ffd7c8ef";
const resendApiKey = process.env.RESEND_API_KEY || 're_3aUNW81V_Gt64hQw11qn46gAGjbz4AY4m';

const client = createClient({
    baseUrl: insforgeUrl,
    anonKey: insforgeAnonKey
});
const resend = new Resend(resendApiKey);

type PaymentCard = {
    is_main?: boolean;
    no_tarjeta?: string;
    banco?: string;
};

function formatMxnAmount(amount: unknown) {
    const value = Number(amount ?? 0);
    const safeValue = Number.isFinite(value) ? value : 0;
    return `$${safeValue.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export async function POST() {
    try {
        // 1. Obtener la configuracion de MSI
        const { data: settings, error: settingsError } = await client.database
            .from("reminder_settings")
            .select("*")
            .limit(1)
            .maybeSingle();

        if (settingsError || !settings) {
            return NextResponse.json({ error: "No se encontraron ajustes" }, { status: 400 });
        }

        const msiMaxDate = settings.msi_end_date;
        const msiOptions = settings.msi_options || [];

        if (!msiMaxDate) {
            return NextResponse.json({ error: "No hay fecha de fin configurada para las promociones." }, { status: 400 });
        }
        if (!msiOptions || msiOptions.length === 0) {
            return NextResponse.json({ error: "No se han seleccionado opciones de meses sin intereses." }, { status: 400 });
        }

        const todayDate = new Date();
        const todayPlus10 = new Date(todayDate);
        todayPlus10.setDate(todayPlus10.getDate() + 10);
        const todayPlus10Str = todayPlus10.toISOString().split('T')[0];

        const maxDatePlux10 = new Date(msiMaxDate);
        maxDatePlux10.setDate(maxDatePlux10.getDate() + 10);
        const maxDatePlux10Str = maxDatePlux10.toISOString().split('T')[0];

        // 2. Buscar todas las pólizas cuyo payment_limit esté entre hoy+10 y la fecha maxima+10
        const { data: policies, error: policiesError } = await client.database
            .from("client_products")
            .select("*, client:clients(full_name, email)")
            .gte("payment_limit", todayPlus10Str)
            .lte("payment_limit", maxDatePlux10Str);

        if (policiesError) {
            return NextResponse.json({ error: "Error consultando pólizas", details: policiesError.message }, { status: 500 });
        }

        if (!policies || policies.length === 0) {
            return NextResponse.json({ message: "No se encontraron pólizas en el rango configurado para enviar promociones." });
        }

        const results = [];
        const errors = [];

        for (const policy of policies) {
            const statusUpper = (policy.status || "").trim().toUpperCase();
            const clientEmail = (policy.client?.email || "").trim();
            const clientName = policy.client?.full_name || "Desconocido";

            if (!clientEmail) {
                errors.push({ p: policy.policy_number, r: "Sin email" });
                continue;
            }

            if (statusUpper !== "ACTIVA" && statusUpper !== "PENDIENTE") {
                errors.push({ p: policy.policy_number, r: `Estado: ${statusUpper}` });
                continue;
            }

            try {
                const formattedMsi = msiOptions.join(", ");
                const primaMnxFormatted = formatMxnAmount(policy.prima_mnx);

                const paymentLimitStr = policy.payment_limit ? String(policy.payment_limit).split('T')[0] : "";
                const paymentLimitDate = new Date(paymentLimitStr);
                const paymentLimitMinus10 = new Date(paymentLimitDate);
                paymentLimitMinus10.setDate(paymentLimitMinus10.getDate() - 10);
                const paymentLimitMinus10Str = isNaN(paymentLimitMinus10.getTime()) ? "" : paymentLimitMinus10.toISOString().split('T')[0];

                const tarjetas = Array.isArray(policy.tarjetas) ? policy.tarjetas as PaymentCard[] : [];
                const mainCardObj = tarjetas.length > 0
                    ? (tarjetas.find((t) => t.is_main) || tarjetas[0])
                    : null;

                const mainCardNo = mainCardObj?.no_tarjeta || "N/A";
                const mainCardBanco = mainCardObj?.banco || "N/A";

                const html = settings.msi_email_template
                    .replaceAll("{{nombre}}", clientName)
                    .replaceAll("{{poliza}}", policy.policy_number || "Pendience")
                    .replaceAll("{{msi_opciones}}", formattedMsi)
                    .replaceAll("{{fecha_pago}}", paymentLimitStr)
                    .replaceAll("{{monto}}", primaMnxFormatted)
                    .replaceAll("{{prima_mnx}}", primaMnxFormatted)
                    .replaceAll("{{fecha_pago_menos_10}}", paymentLimitMinus10Str)
                    .replaceAll("{{tarjeta_principal}}", mainCardNo)
                    .replaceAll("{{banco}}", mainCardBanco);

                const subject = settings.msi_email_subject
                    .replaceAll("{{nombre}}", clientName)
                    .replaceAll("{{poliza}}", policy.policy_number || "");

                const { error: mailError } = await resend.emails.send({
                    from: 'Diego MN Seguros <onboarding@resend.dev>',
                    to: clientEmail,
                    subject: subject,
                    html: html,
                });

                if (mailError) {
                    errors.push({ p: policy.policy_number, r: `Mail: ${mailError.message}` });
                    continue;
                }

                // Add small delay to avoid Resend rate limit (2 req/sec)
                await new Promise(resolve => setTimeout(resolve, 2000));

                results.push({
                    client_name: clientName,
                    client_email: clientEmail,
                    policy_number: policy.policy_number,
                    type: 'MSI_PROMOTION',
                    payment_limit: paymentLimitStr,
                    message_subject: subject,
                    status: 'success'
                });

            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : String(err);
                errors.push({ p: policy.policy_number, r: `Error: ${message}` });
            }
        }

        if (results.length > 0) {
            await client.database.from("sent_messages").insert(results);
        }

        return NextResponse.json({
            success: true,
            count: results.length,
            message: `Proceso finalizado. Se enviaron ${results.length} correos.`,
            diagnostics: {
                sentCount: results.length,
                foundPolicies: policies.length,
                errors: errors,
                errorReport: errors.map(e => `${e.p || "s/n"}: ${e.r}`).join(" | ")
            }
        });

    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : String(e);
        return NextResponse.json({ error: "Error interno del servidor", details: message }, { status: 500 });
    }
}

export const dynamic = 'force-dynamic';
