"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Menu, X } from "lucide-react";
import { Toaster } from "sonner";
import { SignedIn, SignedOut, SignInButton } from "@insforge/nextjs";
import { ThemeToggle } from "@/components/ThemeToggle";

export function AppLayout({ children, fontClasses }: { children: React.ReactNode, fontClasses?: string }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
                    <SignedIn>
                        {children}
                    </SignedIn>
                    <SignedOut>
                        <div className="h-full w-full flex flex-col items-center justify-center gap-6 text-center animate-in fade-in duration-700">
                             <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                                <Menu size={40} className="animate-pulse" />
                            </div>
                            <div className="max-w-xs">
                                <h2 className="text-2xl font-bold tracking-tight">Acceso Restringido</h2>
                                <p className="text-muted-foreground mt-2 text-sm">
                                    Tu sesión ha finalizado o no has iniciado sesión aún. Por favor, utiliza el botón de abajo para entrar.
                                </p>
                            </div>
                            <SignInButton>
                                <button className="px-8 py-3 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform active:scale-95">
                                    Iniciar Sesión
                                </button>
                            </SignInButton>
                        </div>
                    </SignedOut>
                </div>

                {/* Floating Theme Toggle */}
                <div className="fixed bottom-6 right-6 z-50">
                    <ThemeToggle className="rounded-full shadow-lg border-primary/20 bg-background/80 backdrop-blur-md" />
                </div>
            </main>
        </div>
    );
}
