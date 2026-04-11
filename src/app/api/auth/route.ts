/*import { createAuthRouteHandlers } from '@insforge/nextjs/api';

const handlers = createAuthRouteHandlers({
    baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL!,
});

export const POST = handlers.POST;
export const GET = handlers.GET;
export const DELETE = handlers.DELETE;*/

import { createAuthRouteHandlers } from "@insforge/nextjs/api";
import { NextRequest, NextResponse } from "next/server";

const handlers = createAuthRouteHandlers({
    baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL!, // upstream insforge.app
});

// Split para múltiples cookies
function splitSetCookie(header: string) {
    return header.split(/,(?=\s*[^;=\s]+=[^;]+)/g);
}

// Quita Domain=... para que la cookie se guarde en el dominio actual (localhost / app.tudominio.com)
function rewriteCookie(c: string) {
    return c.replace(/;\s*Domain=[^;]+/i, "");
}

async function withCookieRewrite(
    handler: (req: NextRequest) => Promise<Response>,
    req: NextRequest
): Promise<Response> {
    const upstreamRes = await handler(req);

    const headers = new Headers(upstreamRes.headers);
    const setCookie = headers.get("set-cookie");

    if (setCookie) {
        headers.delete("set-cookie");
        for (const c of splitSetCookie(setCookie)) {
            headers.append("set-cookie", rewriteCookie(c));
        }
    }

    return new NextResponse(upstreamRes.body, {
        status: upstreamRes.status,
        headers,
    });
}

export const GET = (req: NextRequest) => withCookieRewrite(handlers.GET, req);
export const POST = (req: NextRequest) => withCookieRewrite(handlers.POST, req);
export const DELETE = (req: NextRequest) => withCookieRewrite(handlers.DELETE, req);
