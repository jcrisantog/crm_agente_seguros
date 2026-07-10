import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json().catch(() => ({}));
        const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL;
        const anonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY;

        if (!baseUrl || !anonKey) {
            return NextResponse.json(
                { error: "Faltan variables de entorno de InsForge." },
                { status: 500 }
            );
        }

        const response = await fetch(`${baseUrl}/functions/automated-reminders-batch`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json;charset=UTF-8",
                Authorization: `Bearer ${anonKey}`,
            },
            body: JSON.stringify({ force: body.force === true }),
        });

        const contentType = response.headers.get("content-type") || "";
        const data = contentType.includes("json")
            ? await response.json()
            : { message: await response.text() };

        return NextResponse.json(data, { status: response.status });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Error desconocido";
        return NextResponse.json(
            { error: "No se pudo ejecutar el proceso automatizado.", details: message },
            { status: 500 }
        );
    }
}

export const dynamic = "force-dynamic";
export const maxDuration = 120;
