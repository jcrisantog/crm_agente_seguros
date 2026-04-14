import { InsforgeMiddleware } from '@insforge/nextjs/middleware';

const insforgeUrl = process.env.NEXT_PUBLIC_INSFORGE_URL!;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export default InsforgeMiddleware({
    baseUrl: insforgeUrl,
    //siteUrl: siteUrl,
    useBuiltInAuth: false,
    signInUrl: "/login",
    publicRoutes: [
        "/login",
        "/register",
        "/forgot-password",
        "/logged-out",
        "/api/auth",
        "/api/auth/logout"
    ],
});

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
