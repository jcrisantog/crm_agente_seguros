"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { insforge } from "@/lib/insforge";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface Agent {
    id: string;
    nombre: string;
    apellidos: string;
}

export default function NewClientPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [agents, setAgents] = useState<Agent[]>([]);
    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        phone: "",
        additional_info: "",
        agent_id: "",
    });

    useEffect(() => {
        insforge.database
            .from("agents")
            .select("id, nombre, apellidos")
            .order("apellidos", { ascending: true })
            .then(({ data }) => setAgents(data || []));
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const { data, error } = await insforge.database.from("clients").insert({
                full_name: formData.full_name,
                email: formData.email,
                phone: formData.phone,
                additional_info: formData.additional_info,
                agent_id: formData.agent_id || null,
            }).select();

            if (error) throw error;

            toast.success("Asegurado registrado exitosamente");

            if (data && data.length > 0) {
                router.push(`/clients/${data[0].id}`);
            } else {
                router.push("/clients");
            }
            router.refresh();

        } catch (error: any) {
            console.error("Error creating client:", error);
            toast.error("Error al crear el cliente: " + (error.message || "Intenta de nuevo"));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">

            <div className="flex items-center gap-4">
                <Link href="/clients">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft size={20} className="text-muted-foreground" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Dar de Alta Asegurado</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Completa la información básica para registrar un nuevo perfil de cliente.
                    </p>
                </div>
            </div>

            <div className="bg-card border border-border shadow-sm rounded-xl overflow-hidden p-6 md:p-8">
                <form onSubmit={handleSubmit} className="space-y-6">

                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold border-b border-border pb-2">Datos Personales</h3>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="sm:col-span-2">
                                <Input
                                    label="Nombre Completo (Asegurado) *"
                                    name="full_name"
                                    required
                                    value={formData.full_name}
                                    onChange={handleChange}
                                    placeholder="Ej. Juan Pérez García"
                                />
                            </div>

                            <Input
                                label="Correo Electrónico"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="correo@ejemplo.com"
                            />

                            <Input
                                label="Teléfono"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="+52 (55) 1234-5678"
                            />

                            <div className="sm:col-span-2 space-y-2">
                                <label className="text-sm font-medium leading-none">
                                    Agente a Cargo <span className="text-muted-foreground font-normal">(opcional)</span>
                                </label>
                                <select
                                    name="agent_id"
                                    value={formData.agent_id}
                                    onChange={handleChange}
                                    className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                >
                                    <option value="">Sin agente asignado</option>
                                    {agents.map((a) => (
                                        <option key={a.id} value={a.id}>{a.apellidos}, {a.nombre}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>


                    <div className="flex items-center justify-end gap-4 pt-6 mt-6 border-t border-border">
                        <Link href="/clients">
                            <Button variant="ghost" type="button">
                                Cancelar
                            </Button>
                        </Link>
                        <Button
                            type="submit"
                            isLoading={isSubmitting}
                            className="px-6"
                        >
                            {!isSubmitting && <Save className="mr-2 h-4 w-4" />} Guardar Asegurado
                        </Button>
                    </div>

                </form>
            </div>
        </div>
    );
}

