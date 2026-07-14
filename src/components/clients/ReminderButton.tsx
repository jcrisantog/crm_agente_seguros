"use client";

import { Bell, Send } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { insforge } from "@/lib/insforge";
import { formatLocalDate, resolveEffectiveMsi } from "@/lib/msi";

interface ReminderButtonProps {
    policyNumber: string;
    clientName: string;
    policyId: string;
    clientId: string;
}

type PaymentCard = {
    is_main?: boolean;
    no_tarjeta?: string;
    banco?: string;
};

type ChannelStatus = "success" | "failed" | "unknown" | "skipped";

type ChannelResult = {
    status: ChannelStatus;
    message?: string;
    technical?: unknown;
};

const UNKNOWN_SEND_STATUS_MESSAGE = "No se pudo confirmar el estado del envio. Es posible que el recordatorio se haya enviado.";

function formatMxnAmount(amount: unknown) {
    const value = Number(amount ?? 0);
    const safeValue = Number.isFinite(value) ? value : 0;
    return `$${safeValue.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function resolvePrimaMnxAmount(policy: Record<string, unknown>) {
    return policy.prima_mnx ?? policy.prima_por_periodo ?? policy.net_premium ?? 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

function getStringField(value: unknown, key: string) {
    if (!isRecord(value)) return null;
    const field = value[key];
    return typeof field === "string" && field.trim() ? field : null;
}

function getSafeErrorMessage(error: unknown, fallback = UNKNOWN_SEND_STATUS_MESSAGE): string {
    if (error instanceof Error && error.message.trim()) {
        return error.message;
    }

    if (typeof error === "string" && error.trim()) {
        return error;
    }

    const directMessage = getStringField(error, "message")
        || getStringField(error, "error")
        || getStringField(error, "details")
        || getStringField(error, "data");

    if (directMessage) return directMessage;

    if (isRecord(error)) {
        const nestedMessage = getStringField(error.error, "message")
            || getStringField(error.error, "error")
            || getStringField(error.error, "details");

        if (nestedMessage) return nestedMessage;
    }

    return fallback;
}

export function ReminderButton({ policyNumber, clientName, policyId, clientId }: ReminderButtonProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleSendReminder = async () => {
        setIsLoading(true);

        let emailResult: ChannelResult = { status: "unknown", message: UNKNOWN_SEND_STATUS_MESSAGE };
        let whatsappResult: ChannelResult = {
            status: "skipped",
            message: "WhatsApp no se intento porque el correo fallo antes de continuar.",
        };

        try {
            const { data, error } = await insforge.functions.invoke("send-reminder-email", {
                body: { client_id: clientId, policy_id: policyId },
            });

            if (error) {
                emailResult = {
                    status: "unknown",
                    message: getSafeErrorMessage(error, UNKNOWN_SEND_STATUS_MESSAGE),
                    technical: error,
                };
                console.warn("No se pudo confirmar el correo de recordatorio:", error);
            } else if (data?.success === false) {
                emailResult = {
                    status: "failed",
                    message: getSafeErrorMessage(data, "El correo no pudo enviarse."),
                    technical: data,
                };
                console.error("La funcion de correo reporto fallo:", data);
            } else {
                emailResult = { status: "success" };
            }
        } catch (emailErr) {
            emailResult = {
                status: "unknown",
                message: getSafeErrorMessage(emailErr, UNKNOWN_SEND_STATUS_MESSAGE),
                technical: emailErr,
            };
            console.warn("Error al invocar la funcion de correo:", emailErr);
        }

        if (emailResult.status !== "failed") {
            try {
                const [policyResponse, settingsResponse, clientResponse] = await Promise.all([
                    insforge.database
                        .from("client_products")
                        .select("*")
                        .eq("id", policyId)
                        .single(),
                    insforge.database
                        .from("reminder_settings")
                        .select("*")
                        .limit(1)
                        .maybeSingle(),
                    insforge.database
                        .from("clients")
                        .select("full_name, phone")
                        .eq("id", clientId)
                        .single(),
                ]);

                const policyData = policyResponse.data;
                const settings = settingsResponse.data;
                const clientData = clientResponse.data;

                if (!policyData || !settings) {
                    const details = [
                        !policyData ? "poliza no encontrada" : null,
                        !settings ? "configuracion de recordatorios no encontrada" : null,
                    ].filter(Boolean).join("; ");

                    whatsappResult = {
                        status: "failed",
                        message: `No se encontraron datos suficientes para enviar WhatsApp: ${details}.`,
                        technical: {
                            policyError: policyResponse.error,
                            settingsError: settingsResponse.error,
                            clientError: clientResponse.error,
                        },
                    };
                    console.warn("Datos insuficientes para WhatsApp:", {
                        policyResponse,
                        settingsResponse,
                        clientResponse,
                    });
                } else {
                    const tarjetasArray = Array.isArray(policyData.tarjetas)
                        ? policyData.tarjetas as PaymentCard[]
                        : [];
                    const mainCard = tarjetasArray.find((t) => t.is_main) || tarjetasArray[0] || {};
                    const bancoFinal = mainCard.banco || "Pendiente";
                    const terminacionFinal = mainCard.no_tarjeta || "S/N";

                    const effectiveMsi = resolveEffectiveMsi({
                        settings,
                        policy: policyData,
                        paymentLimit: policyData.payment_limit,
                    });

                    const primaMnxFormatted = formatMxnAmount(resolvePrimaMnxAmount(policyData));

                    const payload = {
                        promocion: effectiveMsi.applies ? "si" : "no",
                        nombre: clientData?.full_name || clientName,
                        telefono: clientData?.phone || "",
                        fecha_corte: formatLocalDate(policyData.payment_limit),
                        monto: primaMnxFormatted,
                        prima_mnx: primaMnxFormatted,
                        cuantosmsi: effectiveMsi.applies ? effectiveMsi.formattedOptions : "N/A",
                        fecha_max_pago: effectiveMsi.applies ? effectiveMsi.promoDateToShow : formatLocalDate(policyData.payment_limit),
                        banco: bancoFinal,
                        terminacion: terminacionFinal,
                        policy_number: policyData.policy_number,
                        msi_source: effectiveMsi.source || "none",
                        source: "manual_button",
                    };

                    const webhookResponse = await fetch("/api/webhook-proxy", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(payload),
                    });

                    const webhookResult = await webhookResponse.json().catch(() => null);
                    if (!webhookResponse.ok || webhookResult?.success === false) {
                        whatsappResult = {
                            status: "failed",
                            message: getSafeErrorMessage(webhookResult, "WhatsApp no se pudo enviar o confirmar."),
                            technical: webhookResult,
                        };
                        console.warn("El proxy de WhatsApp reporto fallo:", webhookResult);
                    } else {
                        whatsappResult = { status: "success" };
                    }
                }
            } catch (webhookErr) {
                whatsappResult = {
                    status: "unknown",
                    message: getSafeErrorMessage(webhookErr, "WhatsApp no se pudo enviar o confirmar."),
                    technical: webhookErr,
                };
                console.warn("Webhook fallo, pero el correo fue confirmado:", webhookErr);
            }
        }

        if (emailResult.status === "success" && whatsappResult.status === "success") {
            toast.success(`Recordatorio enviado a ${clientName}`, {
                description: `Se envio por correo y WhatsApp para la poliza ${policyNumber}.`,
                duration: 5000,
            });
        } else if (emailResult.status === "success") {
            toast.warning("Correo enviado, WhatsApp no se pudo confirmar", {
                description: whatsappResult.message || "El correo fue enviado, pero WhatsApp no pudo confirmarse.",
                duration: 7000,
            });
        } else if (emailResult.status === "unknown" && whatsappResult.status === "success") {
            toast.warning("WhatsApp enviado, correo no se pudo confirmar", {
                description: emailResult.message || UNKNOWN_SEND_STATUS_MESSAGE,
                duration: 7000,
            });
        } else if (emailResult.status === "unknown") {
            toast.warning("No se pudo confirmar el envio del correo", {
                description: `${emailResult.message || UNKNOWN_SEND_STATUS_MESSAGE} ${whatsappResult.message || "WhatsApp tampoco pudo confirmarse."}`,
                duration: 7000,
            });
        } else {
            toast.error("Error al enviar recordatorio", {
                description: `${emailResult.message || "El correo no pudo enviarse."} WhatsApp no fue ejecutado.`,
                duration: 7000,
            });
        }

        setIsLoading(false);
    };

    return (
        <button
            onClick={handleSendReminder}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors border border-amber-200 disabled:opacity-50"
        >
            {isLoading ? <Bell size={14} className="animate-bounce" /> : <Send size={14} />}
            {isLoading ? "Enviando..." : "Enviar Recordatorio"}
        </button>
    );
}
