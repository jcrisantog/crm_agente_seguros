import { InsforgeMiddleware } from '@insforge/nextjs/middleware';

const insforgeUrl = process.env.NEXT_PUBLIC_INSFORGE_URL!;

export default InsforgeMiddleware({
    baseUrl: insforgeUrl,
    publicRoutes: [
        "/api/auth",
        "/api/auth/logout",
        "/logged-out"
    ],
});

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
