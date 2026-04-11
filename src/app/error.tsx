"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 animate-in fade-in duration-500">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-6">
                <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>

            <h1 className="text-3xl font-bold tracking-tight mb-2">Algo salió mal</h1>
            <p className="text-muted-foreground max-w-md mb-8">
                Lo sentimos, hubo un error al procesar tu solicitud. Puede ser un problema temporal de conexión con la base de datos.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
                <Button onClick={() => reset()} variant="primary" className="gap-2">
                    <RefreshCw className="w-4 h-4" /> Reintentar
                </Button>
                <Link href="/">
                    <Button variant="outline" className="gap-2 w-full sm:w-auto">
                        <Home className="w-4 h-4" /> Volver al Inicio
                    </Button>
                </Link>
            </div>

            {process.env.NODE_ENV === "development" && (
                <div className="mt-12 p-4 bg-muted rounded-lg text-left max-w-2xl overflow-auto border border-border">
                    <p className="text-xs font-mono text-red-600 dark:text-red-400">{error.message}</p>
                    <pre className="text-[10px] mt-2 opacity-50">{error.stack}</pre>
                </div>
            )}
        </div>
    );
}
