"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Evita el error de hidratación renderizando solo en el cliente
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <button
                className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center bg-card border border-border text-muted-foreground shadow-sm",
                    className
                )}
                disabled
            >
                <div className="w-5 h-5 opacity-0" />
            </button>
        );
    }

    return (
        <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center bg-card border border-border text-muted-foreground shadow-sm hover:bg-muted hover:text-foreground transition-all duration-200 group relative overflow-hidden",
                className
            )}
            aria-label="Toggle theme"
        >
            <div className="relative w-5 h-5 flex items-center justify-center">
                <Sun 
                    className={cn(
                        "absolute transition-all duration-300", 
                        theme === "dark" ? "opacity-0 scale-50 rotate-90" : "opacity-100 scale-100 rotate-0"
                    )} 
                    size={20} 
                />
                <Moon 
                    className={cn(
                        "absolute transition-all duration-300", 
                        theme === "dark" ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-50 -rotate-90"
                    )} 
                    size={20} 
                />
            </div>
            
            {/* Efecto hover suave */}
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
    );
}
