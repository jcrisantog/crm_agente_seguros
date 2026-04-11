"use client";

import { AlertCircle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function ClientsError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <div className="space-y-6">
            <div className="flex flex-col items-center justify-center py-20 bg-muted/20 border-2 border-dashed border-border rounded-xl">
                <AlertCircle className="w-12 h-12 text-red-500/50 mb-4" />
                <h2 className="text-xl font-semibold">Error al cargar clientes</h2>
                <p className="text-muted-foreground mt-2 max-w-sm text-center">
                    No pudimos recuperar la lista de asegurados. Por favor verifica tu conexión.
                </p>
                <Button onClick={() => reset()} className="mt-6 gap-2" variant="outline">
                    <RefreshCcw className="w-4 h-4" /> Intentar de nuevo
                </Button>
            </div>
        </div>
    );
}
