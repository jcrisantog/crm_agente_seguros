"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Users,
    Briefcase,
    TrendingUp,
    Settings,
    X,
    LogOut,
    UserCircle,
    UserCog,
    Activity
} from "lucide-react";
import { UserButton, useAuth, SignedIn, SignedOut, SignInButton } from "@insforge/nextjs";

const navGroups = [
    {
        title: "Principal",
        items: [
            { href: "/", label: "Dashboard", icon: LayoutDashboard },
            // { href: "/reports", label: "Reportes", icon: TrendingUp },
        ]
    },
    {
        title: "Gestión",
        items: [
            { href: "/clients", label: "Clientes", icon: Users },
            { href: "/agents", label: "Agentes", icon: UserCog },
            { href: "/products", label: "Productos", icon: Briefcase },
        ]
    }
];

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
    const pathname = usePathname();
    const { signOut, isSignedIn } = useAuth();

    const handleLogout = async () => {
        try {
            localStorage.clear();
            sessionStorage.clear();
            await signOut();
            window.location.href = "/";
        } catch (e) {
            console.error("Logout failed:", e);
            document.cookie = "insforge_csrf_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            window.location.href = "/";
        }
    };

    return (
        <>
            {/* Sidebar background overlay */}
            {isOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/40 z-40 backdrop-blur-sm transition-opacity"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <aside className={cn(
                "fixed md:sticky top-0 left-0 z-50 h-screen w-72 flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0",
                "bg-[var(--color-sidebar-bg)] border-r border-[var(--color-sidebar-border)] text-[var(--color-sidebar-fg)]",
                isOpen ? 'translate-x-0' : '-translate-x-full'
            )}>
                <div className="p-6 border-b border-[var(--color-sidebar-border)] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30">
                            <Activity size={24} strokeWidth={2.5} />
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-xl font-bold tracking-tight leading-none text-white">Diego MN</h1>
                            <span className="text-[10px] text-indigo-300 uppercase tracking-widest font-semibold mt-1">CRM Seguros</span>
                        </div>
                    </div>
                    <button
                        className="md:hidden p-2 text-indigo-200 hover:bg-white/10 rounded-md transition-colors"
                        onClick={() => setIsOpen(false)}
                    >
                        <X size={20} />
                    </button>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-8 overflow-y-auto">
                    {navGroups.map((group, idx) => (
                        <div key={idx} className="space-y-2">
                            <h3 className="px-4 text-xs font-semibold text-indigo-300/60 uppercase tracking-wider">
                                {group.title}
                            </h3>
                            <div className="space-y-1">
                                {group.items.map((item) => {
                                    const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/");
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setIsOpen(false)}
                                            className={cn(
                                                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group",
                                                isActive
                                                    ? "bg-[var(--color-sidebar-accent)] text-[var(--color-sidebar-accent-fg)]"
                                                    : "text-indigo-200/70 hover:bg-white/5 hover:text-white"
                                            )}
                                        >
                                            <item.icon size={20} className={cn(
                                                "transition-colors",
                                                isActive ? "text-indigo-400" : "text-indigo-300/50 group-hover:text-indigo-300"
                                            )} />
                                            {item.label}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    <div className="space-y-2">
                        <h3 className="px-4 text-xs font-semibold text-indigo-300/60 uppercase tracking-wider">
                            Sistema
                        </h3>
                        <Link
                            href="/settings"
                            onClick={() => setIsOpen(false)}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group",
                                pathname.startsWith("/settings")
                                    ? "bg-[var(--color-sidebar-accent)] text-[var(--color-sidebar-accent-fg)]"
                                    : "text-indigo-200/70 hover:bg-white/5 hover:text-white"
                            )}
                        >
                            <Settings size={20} className={cn(
                                "transition-colors",
                                pathname.startsWith("/settings") ? "text-indigo-400" : "text-indigo-300/50 group-hover:text-indigo-300"
                            )} />
                            Ajustes
                        </Link>
                    </div>
                </nav>

                <div className="p-4 border-t border-[var(--color-sidebar-border)] space-y-3">
                    <SignedIn>
                        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/5">
                            <div className="shrink-0 rounded-full ring-2 ring-indigo-500/30 overflow-hidden">
                                <UserButton />
                            </div>
                            <div className="flex flex-col min-w-0 flex-1">
                                <span className="text-sm font-bold truncate text-white leading-tight">Agente Profesional</span>
                                <span className="text-[10px] text-indigo-300/80 uppercase tracking-widest font-semibold mt-0.5">Online</span>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 w-full text-indigo-200/70 hover:bg-rose-500/10 hover:text-rose-400 group"
                        >
                            <LogOut size={18} className="text-indigo-300/50 group-hover:text-rose-400 group-hover:rotate-12 transition-all" />
                            Cerrar Sesión
                        </button>
                    </SignedIn>

                    <SignedOut>
                        <SignInButton>
                            <button className="w-full h-11 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition-all flex items-center justify-center gap-2">
                                <UserCircle size={18} />
                                Iniciar Sesión
                            </button>
                        </SignInButton>
                    </SignedOut>
                </div>
            </aside>
        </>
    );
}
