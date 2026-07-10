import { NextResponse } from "next/server";

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;
const N8N_API_TOKEN = process.env.N8N_API_TOKEN;

export async function POST(req: Request) {
    try {
        if (!N8N_WEBHOOK_URL || !N8N_API_TOKEN) {
            return NextResponse.json({
                success: false,
                error: "Falta configurar N8N_WEBHOOK_URL o N8N_API_TOKEN"
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

        return NextResponse.json({
            success: response.ok,
            status: response.status,
            data,
        }, { status: response.ok ? 200 : 502 });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Error desconocido";
        console.error("Error en proxy de webhook (MND):", error);

        return NextResponse.json({
            success: false,
            error: message,
        }, { status: 500 });
    }
}
