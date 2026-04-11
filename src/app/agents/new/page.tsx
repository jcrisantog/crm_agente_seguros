"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { insforge, ensureValidSession } from "@/lib/insforge";
import { toast } from "sonner";
import { ArrowLeft, Save, UserCog } from "lucide-react";

export default function NewAgentPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        nombre: "",
        apellidos: "",
        email: "",
        celular: "",
        tel_oficina: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const session = await ensureValidSession();
            if (!session) {
                toast.error("Tu sesión ha expirado. Recarga e inicia sesión.", { duration: 7000 });
                setIsSubmitting(false);
                return;
            }

            const { error } = await insforge.database.from("agents").insert({
                nombre: formData.nombre.trim(),
                apellidos: formData.apellidos.trim(),
                email: formData.email.trim() || null,
                celular: formData.celular.trim() || null,
                tel_oficina: formData.tel_oficina.trim() || null,
            });

            if (error) throw error;

            toast.success("Agente registrado exitosamente.");
            router.push("/agents");
            router.refresh();
        } catch (error: any) {
            console.error("Error creating agent:", error);
            if (error.message?.includes("unique") || error.message?.includes("duplicate")) {
                toast.error("Ya existe un agente registrado con ese email.");
            } else {
                toast.error("Error al registrar: " + (error.message || "Intenta de nuevo"));
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/agents">
                    <button className="p-2 rounded-md hover:bg-muted/50 transition-colors">
                        <ArrowLeft size={20} className="text-muted-foreground" />
                    </button>
                </Link>
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                        <UserCog size={18} className="text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Nuevo Agente</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            Registra los datos del agente de seguros.
                        </p>
                    </div>
                </div>
            </div>

            {/* Form */}
            <div className="bg-card border border-border shadow-sm rounded-xl p-6 md:p-8">
                <form onSubmit={handleSubmit} className="space-y-8">

                    {/* Datos personales */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold border-b border-border pb-2 text-primary">
                            Datos Personales
                        </h3>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Nombre(s) *</label>
                                <input
                                    required
                                    name="nombre"
                                    value={formData.nombre}
                                    onChange={handleChange}
                                    placeholder="Ej. Juan Carlos"
                                    className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Apellidos *</label>
                                <input
                                    required
                                    name="apellidos"
                                    value={formData.apellidos}
                                    onChange={handleChange}
                                    placeholder="Ej. García López"
                                    className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Datos de contacto */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold border-b border-border pb-2 text-primary">
                            Información de Contacto
                        </h3>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2 sm:col-span-2">
                                <label className="text-sm font-medium">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="agente@correo.com"
                                    className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Celular</label>
                                <input
                                    name="celular"
                                    value={formData.celular}
                                    onChange={handleChange}
                                    placeholder="+52 (55) 1234-5678"
                                    className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Teléfono Oficina</label>
                                <input
                                    name="tel_oficina"
                                    value={formData.tel_oficina}
                                    onChange={handleChange}
                                    placeholder="(55) 8765-4321"
                                    className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-4 pt-6 border-t border-border">
                        <Link href="/agents">
                            <button type="button" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                                Cancelar
                            </button>
                        </Link>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex items-center gap-2 rounded-md bg-primary px-8 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                        >
                            {isSubmitting ? "Guardando..." : <><Save size={15} /> Guardar Agente</>}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
