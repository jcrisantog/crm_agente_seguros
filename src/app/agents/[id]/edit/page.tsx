"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { insforge, ensureValidSession } from "@/lib/insforge";
import { toast } from "sonner";
import { ArrowLeft, Save, Trash2, UserCog } from "lucide-react";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

export default function EditAgentPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [showConfirm, setShowConfirm] = useState(false);

    const [formData, setFormData] = useState({
        nombre: "",
        apellidos: "",
        email: "",
        celular: "",
        tel_oficina: "",
    });

    useEffect(() => {
        async function load() {
            const { data, error } = await insforge.database
                .from("agents")
                .select("*")
                .eq("id", id)
                .single();

            if (data) {
                setFormData({
                    nombre: data.nombre || "",
                    apellidos: data.apellidos || "",
                    email: data.email || "",
                    celular: data.celular || "",
                    tel_oficina: data.tel_oficina || "",
                });
            } else {
                console.error("Error loading agent:", error);
                toast.error("No se encontró el agente.");
            }
            setIsLoading(false);
        }
        load();
    }, [id]);

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

            const { error } = await insforge.database
                .from("agents")
                .update({
                    nombre: formData.nombre.trim(),
                    apellidos: formData.apellidos.trim(),
                    email: formData.email.trim() || null,
                    celular: formData.celular.trim() || null,
                    tel_oficina: formData.tel_oficina.trim() || null,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", id);

            if (error) throw error;

            toast.success("Agente actualizado.");
            router.push("/agents");
            router.refresh();
        } catch (error: any) {
            console.error("Error updating agent:", error);
            if (error.message?.includes("unique") || error.message?.includes("duplicate")) {
                toast.error("Ya existe un agente registrado con ese email.");
            } else {
                toast.error("Error al actualizar: " + (error.message || "Intenta de nuevo"));
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const session = await ensureValidSession();
            if (!session) {
                toast.error("Tu sesión ha expirado.");
                setIsDeleting(false);
                return;
            }

            const { error } = await insforge.database
                .from("agents")
                .delete()
                .eq("id", id);

            if (error) throw error;

            toast.success("Agente eliminado.");
            router.push("/agents");
            router.refresh();
        } catch (error: any) {
            toast.error("Error al eliminar: " + (error.message || "Intenta de nuevo"));
        } finally {
            setIsDeleting(false);
        }
    };

    if (isLoading) {
        return <div className="p-12 text-center text-muted-foreground">Cargando agente...</div>;
    }

    const agentFullName = `${formData.nombre} ${formData.apellidos}`.trim();

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
            <ConfirmModal
                isOpen={showConfirm}
                onClose={() => setShowConfirm(false)}
                onConfirm={handleDelete}
                title="Eliminar Agente"
                description={`¿Estás seguro de que deseas eliminar a ${agentFullName}? Los clientes que tenga asignados quedarán sin agente.`}
                confirmLabel="Sí, eliminar"
                cancelLabel="Cancelar"
                variant="danger"
            />
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
                        <h1 className="text-2xl font-bold tracking-tight">Editar Agente</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            {formData.nombre} {formData.apellidos}
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
                    <div className="flex items-center justify-between pt-6 border-t border-border">
                        <button
                            type="button"
                            onClick={() => setShowConfirm(true)}
                            disabled={isDeleting || isSubmitting}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-rose-500 hover:bg-rose-500/10 transition-colors disabled:opacity-40"
                        >
                            <Trash2 size={15} />
                            {isDeleting ? "Eliminando..." : "Eliminar Agente"}
                        </button>

                        <div className="flex items-center gap-4">
                            <Link href="/agents">
                                <button type="button" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                                    Cancelar
                                </button>
                            </Link>
                            <button
                                type="submit"
                                disabled={isSubmitting || isDeleting}
                                className="inline-flex items-center gap-2 rounded-md bg-primary px-8 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                            >
                                {isSubmitting ? "Guardando..." : <><Save size={15} /> Guardar Cambios</>}
                            </button>
                        </div>
                    </div>

                </form>
            </div>
        </div>
    );
}
