import { NextResponse } from "next/server";

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;
const N8N_API_TOKEN = process.env.N8N_API_TOKEN;

function getProxyErrorMessage(error: unknown) {
    if (error instanceof DOMException && error.name === "TimeoutError") {
        return "Timeout al enviar WhatsApp por n8n. El mensaje no pudo confirmarse a tiempo.";
    }

    if (error instanceof Error && error.message.trim()) {
        return error.message;
    }

    if (typeof error === "string" && error.trim()) {
        return error;
    }

    return "Error desconocido al enviar WhatsApp por n8n.";
}

export async function POST(req: Request) {
    try {
        if (!N8N_WEBHOOK_URL || !N8N_API_TOKEN) {
            return NextResponse.json({
                success: false,
                status: 500,
                error: "Falta configurar N8N_WEBHOOK_URL o N8N_API_TOKEN para enviar WhatsApp."
            }, { status: 500 });
        }

        const body = await req.json();

        const response = await fetch(N8N_WEBHOOK_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                api_token: N8N_API_TOKEN,
            },
            body: JSON.stringify(body),
            signal: AbortSignal.timeout(10000),
        });

        const data = await response.text();
        const error = response.ok
            ? undefined
            : `n8n respondio con estado ${response.status}. WhatsApp no se pudo confirmar.`;

        return NextResponse.json({
            success: response.ok,
            status: response.status,
            error,
            data,
        }, { status: response.ok ? 200 : 502 });
    } catch (error: unknown) {
        const message = getProxyErrorMessage(error);
        console.error("Error en proxy de webhook (MND):", error);

        return NextResponse.json({
            success: false,
            status: 500,
            error: message,
        }, { status: 500 });
    }
}
