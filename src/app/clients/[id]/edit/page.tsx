"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { insforge, ensureValidSession } from "@/lib/insforge";
import { toast } from "sonner";

interface Agent {
    id: string;
    nombre: string;
    apellidos: string;
}

export default function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        phone: "",
        additional_info: "",
        rfc: "",
        fecha_nacimiento: "",
        sexo: "",
        direccion: "",
        telefono_casa: "",
        telefono_oficina: "",
        edad_emision: "",
        agent_id: "",
    });

    const [agents, setAgents] = useState<Agent[]>([]);

    useEffect(() => {
        insforge.database
            .from("agents")
            .select("id, nombre, apellidos")
            .order("apellidos", { ascending: true })
            .then(({ data }) => setAgents(data || []));
    }, []);

    useEffect(() => {
        async function loadClient() {
            const { data, error } = await insforge.database
                .from("clients")
                .select("*")
                .eq("id", resolvedParams.id)
                .single();

            if (data) {
                setFormData({
                    full_name: data.full_name || "",
                    email: data.email || "",
                    phone: data.phone || "",
                    additional_info: data.additional_info || "",
                    rfc: data.rfc || "",
                    fecha_nacimiento: data.fecha_nacimiento || "",
                    sexo: data.sexo || "",
                    direccion: data.direccion || "",
                    telefono_casa: data.telefono_casa || "",
                    telefono_oficina: data.telefono_oficina || "",
                    edad_emision: data.edad_emision?.toString() || "",
                    agent_id: data.agent_id || "",
                });
            } else {
                console.error("Error loading client:", error);
            }
            setIsLoading(false);
        }
        loadClient();
    }, [resolvedParams.id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const session = await ensureValidSession();
            if (!session) {
                toast.error("Tu sesión ha expirado. Por seguridad copia tus datos, recarga la página e inicia sesión.", { duration: 8000 });
                setIsSubmitting(false);
                return;
            }

            const { error } = await insforge.database
                .from("clients")
                .update({
                    full_name: formData.full_name,
                    email: formData.email,
                    phone: formData.phone,
                    additional_info: formData.additional_info,
                    rfc: formData.rfc,
                    fecha_nacimiento: formData.fecha_nacimiento || null,
                    sexo: formData.sexo,
                    direccion: formData.direccion,
                    telefono_casa: formData.telefono_casa,
                    telefono_oficina: formData.telefono_oficina,
                    edad_emision: formData.edad_emision ? parseInt(formData.edad_emision) : null,
                    agent_id: formData.agent_id || null,
                })
                .eq("id", resolvedParams.id);

            if (error) throw error;

            toast.success("Perfil actualizado");
            router.push(`/clients/${resolvedParams.id}`);
            router.refresh();

        } catch (error: any) {
            console.error("Error updating client:", error);
            if (error.message && error.message.includes("JWT expired")) {
                toast.error("Tu sesión ha expirado. Por favor, recarga e inicia sesión de nuevo.", { duration: 6000 });
            } else {
                toast.error("Error al actualizar perfil: " + (error.message || "Revisa la consola"));
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <div className="p-12 text-center text-muted-foreground">Cargando perfil...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">

            <div className="flex items-center gap-4">
                <Link href={`/clients/${resolvedParams.id}`}>
                    <button className="p-2 rounded-md hover:bg-muted/50 transition-colors">
                        <ArrowLeft size={20} className="text-muted-foreground" />
                    </button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Editar Perfil Completo</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Actualiza la información personal y de contacto del asegurado.
                    </p>
                </div>
            </div>

            <div className="bg-card border border-border shadow-sm rounded-xl overflow-hidden p-6 md:p-8">
                <form onSubmit={handleSubmit} className="space-y-8">

                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold border-b border-border pb-2 text-primary">Datos Principales</h3>

                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <div className="space-y-2 sm:col-span-2">
                                <label className="text-sm font-medium leading-none">Nombre Completo *</label>
                                <input required name="full_name" value={formData.full_name} onChange={handleChange} className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-[ring]" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">RFC / ID Fiscal</label>
                                <input name="rfc" value={formData.rfc} onChange={handleChange} placeholder="XAXX010101000" className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-[ring]" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">Fecha de Nacimiento</label>
                                <input type="date" name="fecha_nacimiento" value={formData.fecha_nacimiento} onChange={handleChange} className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-[ring]" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">Sexo</label>
                                <select name="sexo" value={formData.sexo} onChange={handleChange} className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-[ring]">
                                    <option value="">Seleccionar</option>
                                    <option value="MASCULINO">Masculino</option>
                                    <option value="FEMENINO">Femenino</option>
                                    <option value="OTRO">Otro</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">Edad de Emisión</label>
                                <input type="number" name="edad_emision" value={formData.edad_emision} onChange={handleChange} className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-[ring]" />
                            </div>

                            <div className="space-y-2 sm:col-span-2 lg:col-span-3">
                                <label className="text-sm font-medium leading-none">
                                    Agente a Cargo <span className="text-muted-foreground font-normal">(opcional)</span>
                                </label>
                                <select name="agent_id" value={formData.agent_id} onChange={handleChange} className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                                    <option value="">Sin agente asignado</option>
                                    {agents.map((a) => (
                                        <option key={a.id} value={a.id}>{a.apellidos}, {a.nombre}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold border-b border-border pb-2 text-primary">Información de Contacto</h3>

                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">Correo Electrónico</label>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-[ring]" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">Celular (WhatsApp)</label>
                                <input name="phone" value={formData.phone} onChange={handleChange} className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-[ring]" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">Teléfono Casa</label>
                                <input name="telefono_casa" value={formData.telefono_casa} onChange={handleChange} className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-[ring]" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">Teléfono Oficina</label>
                                <input name="telefono_oficina" value={formData.telefono_oficina} onChange={handleChange} className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-[ring]" />
                            </div>

                            <div className="space-y-2 sm:col-span-2">
                                <label className="text-sm font-medium leading-none">Dirección Completa</label>
                                <input name="direccion" value={formData.direccion} onChange={handleChange} className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-[ring]" />
                            </div>
                        </div>
                    </div>


                    <div className="flex items-center justify-end gap-4 pt-6 mt-6 border-t border-border">
                        <Link href={`/clients/${resolvedParams.id}`}>
                            <button type="button" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                                Cancelar
                            </button>
                        </Link>
                        <button type="submit" disabled={isSubmitting} className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all shadow-lg active:scale-95 disabled:opacity-50">
                            {isSubmitting ? "Guardando..." : <><Save className="mr-2 h-4 w-4" /> Guardar Todos los Cambios</>}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
