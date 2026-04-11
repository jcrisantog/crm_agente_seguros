"use client";

import { Bell, Send } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { insforge } from "@/lib/insforge";

interface ReminderButtonProps {
    policyNumber: string;
    clientName: string;
    policyId: string;
    clientId: string;
}

export function ReminderButton({ policyNumber, clientName, policyId, clientId }: ReminderButtonProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleSendReminder = async () => {
        setIsLoading(true);

        try {
            // 1. Mandar correo (Inforisge Function)
            const { data, error } = await insforge.functions.invoke('send-reminder-email', {
                body: { client_id: clientId, policy_id: policyId }
            });

            // 2. Mandar llamada a webhook directamente desde el front vía proxy
            try {
                // Obtenemos los datos frescos de la póliza para el webhook
                const { data: policyData } = await insforge.database
                    .from("client_products")
                    .select("*, clients(*)")
                    .eq("id", policyId)
                    .single();

                const { data: settings } = await insforge.database
                    .from("reminder_settings")
                    .select("*")
                    .limit(1)
                    .single();

                if (policyData && settings) {
                    // Lógica para extraer tarjeta principal del array 'tarjetas'
                    const tarjetasArray = Array.isArray(policyData.tarjetas) ? policyData.tarjetas : [];
                    const mainCard = tarjetasArray.find((t: any) => t.is_main) || tarjetasArray[0] || {};
                    
                    const bancoFinal = mainCard.banco || "Pendiente";
                    const terminacionFinal = mainCard.no_tarjeta || "S/N";

                    // Corrección de desfase de fecha (UTC a Local)
                    const formatLocalDate = (dateStr: string) => {
                        if (!dateStr) return "";
                        const date = new Date(dateStr + "T12:00:00"); 
                        return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
                    };

                    const msiActive = settings.msi_active === true;
                    let msiApplies = false;
                    
                    const paymentLimitMinus10 = new Date(policyData.payment_limit + "T12:00:00");
                    paymentLimitMinus10.setDate(paymentLimitMinus10.getDate() - 10);
                    const paymentLimitMinus10StrFormat = paymentLimitMinus10.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
                    
                    let promoDateToShowStr = paymentLimitMinus10StrFormat;

                    if (msiActive && settings.msi_start_date && settings.msi_end_date) {
                        const promoStartDate = new Date(settings.msi_start_date + "T00:00:00");
                        const promoEndDate = new Date(settings.msi_end_date + "T23:59:59");
                        const now = new Date();
                        
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
                                promoDateToShowStr = formatLocalDate(settings.msi_end_date);
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

                    const payload = {
                        promocion: msiApplies ? "si" : "no",
                        nombre: policyData.clients?.full_name || clientName,
                        telefono: policyData.clients?.phone || "",
                        fecha_corte: formatLocalDate(policyData.payment_limit),
                        monto: `$${Number(policyData.net_premium || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`,
                        cuantosmsi: msiApplies ? formattedMsi : "N/A",
                        fecha_max_pago: msiApplies ? promoDateToShowStr : formatLocalDate(policyData.payment_limit),
                        banco: bancoFinal,
                        terminacion: terminacionFinal,
                        policy_number: policyData.policy_number,
                        source: 'manual_button'
                    };

                    await fetch('/api/webhook-proxy', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(payload)
                    });
                }
            } catch (webhookErr) {
                console.warn("Webhook falló, pero el correo se intentó enviar:", webhookErr);
            }

            if (error) throw error;
            if (data?.success === false) throw new Error(data.error);

            toast.success(`Recordatorio enviado a ${clientName}`, {
                description: `Se ha enviado el correo para la póliza ${policyNumber}.`,
                duration: 5000,
            });
        } catch (error: any) {
            console.error("Error sending reminder:", error);
            toast.error("Error al enviar recordatorio", {
                description: error.message || "Ocurrió un error inesperado.",
            });
        } finally {
            setIsLoading(false);
        }
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
