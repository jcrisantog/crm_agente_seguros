import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { insforge } from "@/lib/insforge";

/**
 * Server-side logout endpoint.
 * Clears all Insforge httpOnly cookies that JavaScript cannot access.
 * This is the ONLY way to properly terminate a session.
 */
export async function POST() {
    try {
        // Siempre regresa Set-Cookie aunque falle Insforge
        const res = NextResponse.json({ success: true });
        // 1. Try to invalidate the session server-side with Insforge
        try {
            await insforge.auth.signOut();
        } catch (e) {
            // Continue even if server-side signout fails - we still need to clear cookies
            console.warn("Insforge signOut failed (may already be expired):", e);
        }

        const isProd = process.env.NODE_ENV === "production";

        // Helper para expirar
        const expire = (
            name: string,
            path: string,
            opts?: { httpOnly?: boolean; secure?: boolean; sameSite?: "lax" | "strict" | "none"; domain?: string }
        ) => {
            res.cookies.set(name, "", {
                path,
                expires: new Date(0),
                maxAge: 0,
                httpOnly: opts?.httpOnly ?? false,
                secure: opts?.secure ?? isProd,
                sameSite: opts?.sameSite ?? "lax",
                ...(opts?.domain ? { domain: opts.domain } : {}),
            });
        };

        // 2) HttpOnly cookies (si existen)
        expire("insforge-session", "/", { httpOnly: true });
        expire("insforge-user", "/", { httpOnly: true });

        // refresh token suele ser HttpOnly y con path /api/auth (según tu screenshot)
        expire("insforge_refresh_token", "/api/auth", { httpOnly: true });
        // por si existe otra con path /
        expire("insforge_refresh_token", "/", { httpOnly: true });

        // 3) NO HttpOnly cookies (csrf en tu screenshot NO es HttpOnly)
        expire("insforge_csrf_token", "/", { httpOnly: false });

        return res;
        /*
                // 2. Build response with Set-Cookie headers to expire ALL insforge cookies
                const response = NextResponse.json({ success: true });
        
                // List of all known insforge cookies to clear
                const cookiesToClear = [
                    { name: "insforge-session", path: "/" },
                    { name: "insforge-user", path: "/" },
                    { name: "insforge_csrf_token", path: "/" },
                    { name: "insforge_refresh_token", path: "/api/auth" },
                    { name: "insforge_refresh_token", path: "/" },
                ];
        
                for (const cookie of cookiesToClear) {
                    // Expire the cookie by setting maxAge to 0 and date in the past
                    response.cookies.set(cookie.name, "", {
                        path: cookie.path,
                        expires: new Date(0),
                        maxAge: 0,
                        httpOnly: true,
                        secure: process.env.NODE_ENV === "production",
                        sameSite: "lax",
                    });
                }
        
                return response;*/
    } catch (error) {
        console.error("Logout error:", error);

        // Even on error, try to clear cookies
        const response = NextResponse.json({ success: false }, { status: 500 });

        const cookiesToClear = [
            "insforge-session",
            "insforge-user",
            "insforge_csrf_token",
            "insforge_refresh_token",
        ];

        for (const name of cookiesToClear) {
            response.cookies.set(name, "", {
                path: "/",
                expires: new Date(0),
                maxAge: 0,
            });
        }

        return response;
    }
}
