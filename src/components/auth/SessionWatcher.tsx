"use client";

import { useEffect } from "react";
import { useAuth } from "@insforge/nextjs";
import { insforge } from "@/lib/insforge";

export function SessionWatcher() {
    const { isSignedIn } = useAuth();

    useEffect(() => {
        if (!isSignedIn) return;

        const refreshToken = async () => {
            try {
                // Calling getCurrentSession triggers a token refresh if needed
                await insforge.auth.getCurrentSession();
            } catch (error) {
                console.error("Background session refresh failed:", error);
            }
        };

        // Check session every 5 minutes
        const intervalId = setInterval(refreshToken, 1000 * 60 * 5);

        // Refresh on user activity (throttled to 1 minute)
        let interactionTimeout: NodeJS.Timeout | null = null;
        
        const handleInteraction = () => {
            if (!interactionTimeout) {
                interactionTimeout = setTimeout(() => {
                    refreshToken();
                    interactionTimeout = null;
                }, 60000);
            }
        };

        window.addEventListener("mousemove", handleInteraction);
        window.addEventListener("keydown", handleInteraction);
        window.addEventListener("scroll", handleInteraction);

        return () => {
            clearInterval(intervalId);
            if (interactionTimeout) clearTimeout(interactionTimeout);
            window.removeEventListener("mousemove", handleInteraction);
            window.removeEventListener("keydown", handleInteraction);
            window.removeEventListener("scroll", handleInteraction);
        };
    }, [isSignedIn]);

    return null;
}
