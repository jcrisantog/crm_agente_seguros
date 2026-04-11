"use client";

import { ThemeProvider } from "next-themes";
import { InsforgeBrowserProvider } from '@insforge/nextjs';
import { insforge } from '@/lib/insforge';
import { SessionWatcher } from '@/components/auth/SessionWatcher';

export function InsforgeProvider({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <InsforgeBrowserProvider client={insforge} afterSignInUrl="/">
                <SessionWatcher />
                {children}
            </InsforgeBrowserProvider>
        </ThemeProvider>
    );
}
