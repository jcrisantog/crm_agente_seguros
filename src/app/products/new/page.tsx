"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, FilePlus, Trash2 } from "lucide-react";
import Link from "next/link";
import { insforge } from "@/lib/insforge";
import { toast } from "sonner";

export default function NewProductPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
    });

    // Local state for the JSON schema of required documents
    const [requiredDocs, setRequiredDocs] = useState<string[]>([
        "Identificación Oficial (INE/Pasaporte)",
        "Comprobante de Domicilio",
    ]);
    const [newDoc, setNewDoc] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleAddDoc = () => {
        if (newDoc.trim() && !requiredDocs.includes(newDoc.trim())) {
            setRequiredDocs([...requiredDocs, newDoc.trim()]);
            setNewDoc("");
        }
    };

    const handleRemoveDoc = (docToRemove: string) => {
        setRequiredDocs(requiredDocs.filter(d => d !== docToRemove));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const { error } = await insforge.database.from("products").insert({
                name: formData.name,
                description: formData.description,
                required_docs_schema: requiredDocs,
            });

            if (error) throw error;

            toast.success("Producto registrado");
            router.push("/products");
            router.refresh();

        } catch (error: any) {
            console.error("Error creating product:", error);
            toast.error("Error al registrar producto: " + (error.message || "Intenta de nuevo"));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            <div className="flex items-center gap-4">
                <Link href="/products">
                    <button className="p-2 rounded-md hover:bg-muted/50 transition-colors">
                        <ArrowLeft size={20} className="text-muted-foreground" />
                    </button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Nuevo Tipo de Seguro</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Configura un nuevo producto y los requisitos documentales base.
                    </p>
                </div>
            </div>

            <div className="bg-card border border-border shadow-sm rounded-xl overflow-hidden p-6 md:p-8">
                <form onSubmit={handleSubmit} className="space-y-8">

                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold border-b border-border pb-2">Información del Producto</h3>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">
                                    Nombre del Seguro *
                                </label>
                                <input
                                    required
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Ej. Seguro de Auto Amplio"
                                    className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">
                                    Descripción Corta
                                </label>
                                <textarea
                                    name="description"
                                    rows={3}
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Describe brevemente de qué trata este seguro..."
                                    className="flex w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary resize-y"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-border pb-2 mt-8">
                            <h3 className="text-lg font-semibold">Esquema de Documentos</h3>
                            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">Requerimientos Base</span>
                        </div>

                        <p className="text-sm text-muted-foreground">
                            Define qué documentos son obligatorios cuando un cliente contrata este tipo de póliza. Nuestro sistema solicitará automáticamente estos archivos.
                        </p>

                        <div className="flex gap-2 items-center mt-4">
                            <input
                                value={newDoc}
                                onChange={(e) => setNewDoc(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddDoc(); } }}
                                placeholder="Ej. Tarjeta de Circulación"
                                className="flex h-10 flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm"
                            />
                            <button
                                type="button"
                                onClick={handleAddDoc}
                                className="h-10 inline-flex items-center justify-center rounded-md bg-secondary px-4 text-sm font-medium text-secondary-foreground hover:bg-secondary/80 border border-border"
                            >
                                <FilePlus className="h-4 w-4 mr-2" /> Añadir
                            </button>
                        </div>

                        <div className="mt-4 p-4 border border-border rounded-lg bg-background/50 space-y-2">
                            {requiredDocs.length > 0 ? (
                                requiredDocs.map((doc, idx) => (
                                    <div key={idx} className="flex justify-between items-center p-3 rounded-md bg-background border border-border/50 shadow-sm">
                                        <span className="text-sm font-medium">{doc}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveDoc(doc)}
                                            className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 p-1.5 rounded-md transition-colors"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-4">No hay documentos requeridos base configurados.</p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-4 pt-6 mt-6 border-t border-border">
                        <Link href="/products">
                            <button type="button" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                                Cancelar
                            </button>
                        </Link>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                            {isSubmitting ? "Guardando..." : <><Save className="mr-2 h-4 w-4" /> Registrar Producto</>}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
