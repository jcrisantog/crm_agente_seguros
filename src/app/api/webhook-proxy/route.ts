import { NextResponse } from "next/server";

// URL CORRECTA MND
const N8N_WEBHOOK_URL = "https://n8n.minegocio-digital.com/webhook/3fb72394-de4b-410d-ab28-8ca0dfbc6547";
// TOKEN CORRECTO según Postman
const N8N_API_TOKEN = "12345678"; 

export async function POST(req: Request) {
    try {
        const body = await req.json();

        console.log("Enviando webhook a n8n (MND) con header api_token:", N8N_WEBHOOK_URL);

        const response = await fetch(N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Usamos EXACCTAMENTE lo que tienes en Postman: api_token: 12345678
                'api_token': N8N_API_TOKEN
            },
            body: JSON.stringify(body),
            signal: AbortSignal.timeout(10000) 
        });

        const data = await response.text();
        console.log("Respuesta de n8n MND recibida, status:", response.status);

        return NextResponse.json({ 
            success: response.ok, 
            status: response.status,
            data: data 
        });
    } catch (error: any) {
        console.error("Error en proxy de webhook (MND):", error);
        
        return NextResponse.json({ 
            success: false, 
            error: error.message
        }, { status: 500 });
    }
}
