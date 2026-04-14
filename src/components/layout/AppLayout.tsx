"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { Menu, X } from "lucide-react";
import { Toaster } from "sonner";
import { useAuth, SignedIn, SignedOut, SignInButton } from "@insforge/nextjs";
import { ThemeToggle } from "@/components/ThemeToggle";
import { insforge } from "@/lib/insforge";

export function AppLayout({ children, fontClasses }: { children: React.ReactNode, fontClasses?: string }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { isSignedIn, isLoaded, user } = useAuth();

    useEffect(() => {
        // Lógica de Hidratación Manual: Puente de sincronización vía LocalStorage
        const hydrateSession = async () => {
            if (isLoaded && !isSignedIn) {
                // Intentar recuperar del puente de LocalStorage (creado en LoginPage)
                const bridgeToken = localStorage.getItem('insforge_session_bridge');
                const bridgeUser = localStorage.getItem('insforge_user_bridge');

                if (bridgeToken) {
                    try {
                        let userObj = {};
                        if (bridgeUser) {
                            userObj = JSON.parse(bridgeUser);
                        }

                        // @ts-ignore - Acceso al TokenManager
                        insforge.tokenManager.saveSession({
                            accessToken: bridgeToken,
                            user: userObj
                        });

                        // Forzar refresco del estado local del SDK
                        await insforge.auth.getCurrentUser();
                        
                        // Limpiar el puente después de usarlo para seguridad
                        localStorage.removeItem('insforge_session_bridge');
                        localStorage.removeItem('insforge_user_bridge');
                    } catch (err) {
                        console.error("Fallo durante la hidratación de sesión:", err);
                    }
                }
            }
        };

        hydrateSession();
    }, [isLoaded, isSignedIn]);


    return (
        <div className={`${fontClasses} antialiased bg-background text-foreground flex h-screen overflow-hidden font-sans`}>
            <Toaster position="top-right" expand={false} richColors closeButton />

            <SignedIn>
                <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            </SignedIn>

            <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                {/* Mobile Top Header - only when signed in */}
                <SignedIn>
                    <header className="md:hidden sticky top-0 z-30 flex items-center justify-between h-14 px-4 bg-card border border-border shadow-sm border-b border-border shrink-0">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                className="p-2 -ml-2 rounded-md hover:bg-muted/50 transition-colors text-foreground active:scale-95"
                                aria-label="Menu"
                            >
                                {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                            </button>
                            <div className="font-bold text-base tracking-tight flex items-center gap-2">
                                <span className="w-6 h-6 rounded bg-primary text-primary-foreground flex items-center justify-center text-[10px] shadow-sm">A</span>
                                CRM Seguros
                            </div>
                        </div>
                    </header>
                </SignedIn>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-muted/20">
                    {children}
                </div>

                {/* Floating Theme Toggle */}
                <div className="fixed bottom-6 right-6 z-50">
                    <ThemeToggle className="rounded-full shadow-lg border-primary/20 bg-background/80 backdrop-blur-md" />
                </div>
            </main>
        </div>
    );
}
