"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { insforge } from "@/lib/insforge";
import { toast } from "sonner";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import {
    UserCog,
    Plus,
    Search,
    Pencil,
    Trash2,
    Mail,
    Phone,
    Building2,
    Smartphone,
    Users,
} from "lucide-react";

interface Agent {
    id: string;
    nombre: string;
    apellidos: string;
    email: string | null;
    celular: string | null;
    tel_oficina: string | null;
    created_at: string;
}

export default function AgentsPage() {
    const [agents, setAgents] = useState<Agent[]>([]);
    const [filtered, setFiltered] = useState<Agent[]>([]);
    const [search, setSearch] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [confirmAgent, setConfirmAgent] = useState<Agent | null>(null);

    const fetchAgents = useCallback(async () => {
        setIsLoading(true);
        const { data, error } = await insforge.database
            .from("agents")
            .select("*")
            .order("apellidos", { ascending: true });

        if (error) {
            toast.error("Error al cargar los agentes.");
        } else {
            setAgents(data || []);
            setFiltered(data || []);
        }
        setIsLoading(false);
    }, []);

    useEffect(() => { fetchAgents(); }, [fetchAgents]);

    useEffect(() => {
        const q = search.toLowerCase();
        setFiltered(
            agents.filter(
                (a) =>
                    a.nombre.toLowerCase().includes(q) ||
                    a.apellidos.toLowerCase().includes(q) ||
                    (a.email || "").toLowerCase().includes(q)
            )
        );
    }, [search, agents]);

    const handleDeleteConfirmed = async () => {
        if (!confirmAgent) return;
        setDeletingId(confirmAgent.id);
        setConfirmAgent(null);

        const { error } = await insforge.database
            .from("agents")
            .delete()
            .eq("id", confirmAgent.id);

        if (error) {
            toast.error("Error al eliminar el agente.");
        } else {
            toast.success("Agente eliminado.");
            fetchAgents();
        }
        setDeletingId(null);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <ConfirmModal
                isOpen={!!confirmAgent}
                onClose={() => setConfirmAgent(null)}
                onConfirm={handleDeleteConfirmed}
                title="Eliminar Agente"
                description={`¿Estás seguro de que deseas eliminar a ${confirmAgent?.nombre} ${confirmAgent?.apellidos}? Los clientes asignados quedarán sin agente.`}
                confirmLabel="Sí, eliminar"
                cancelLabel="Cancelar"
                variant="danger"
            />
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <UserCog size={20} className="text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Agentes</h1>
                        <p className="text-sm text-muted-foreground">
                            {agents.length} agente{agents.length !== 1 ? "s" : ""} registrado{agents.length !== 1 ? "s" : ""}
                        </p>
                    </div>
                </div>
                <Link
                    href="/agents/new"
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95"
                >
                    <Plus size={16} />
                    Nuevo Agente
                </Link>
            </div>

            {/* Search */}
            <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Buscar por nombre, apellido o email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full h-10 pl-9 pr-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                />
            </div>

            {/* List */}
            {isLoading ? (
                <div className="bg-card border border-border shadow-sm rounded-xl p-12 text-center text-muted-foreground text-sm">
                    Cargando agentes...
                </div>
            ) : filtered.length === 0 ? (
                <div className="bg-card border border-border shadow-sm rounded-xl p-16 flex flex-col items-center gap-3 text-center">
                    <Users size={36} className="text-muted-foreground/30" />
                    <p className="font-medium text-muted-foreground">
                        {search ? "Sin resultados para tu búsqueda." : "No hay agentes registrados aún."}
                    </p>
                    {!search && (
                        <Link
                            href="/agents/new"
                            className="text-sm text-primary hover:underline font-medium"
                        >
                            Registrar primer agente →
                        </Link>
                    )}
                </div>
            ) : (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {filtered.map((agent) => (
                        <div
                            key={agent.id}
                            className="bg-card border border-border shadow-sm rounded-xl p-5 flex flex-col gap-4 hover:border-primary/30 transition-all group"
                        >
                            {/* Agent header */}
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg shrink-0">
                                        {agent.nombre.charAt(0)}{agent.apellidos.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold leading-tight">
                                            {agent.nombre} {agent.apellidos}
                                        </h3>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            Agente de seguros
                                        </p>
                                    </div>
                                </div>
                                {/* Actions */}
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Link
                                        href={`/agents/${agent.id}/edit`}
                                        className="p-2 rounded-lg hover:bg-muted/60 transition-colors text-muted-foreground hover:text-foreground"
                                        title="Editar"
                                    >
                                        <Pencil size={15} />
                                    </Link>
                                    <button
                                        onClick={() => setConfirmAgent(agent)}
                                        disabled={deletingId === agent.id}
                                        className="p-2 rounded-lg hover:bg-rose-500/10 transition-colors text-muted-foreground hover:text-rose-500 disabled:opacity-50"
                                        title="Eliminar"
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            </div>

                            {/* Contact details */}
                            <div className="space-y-2 text-sm">
                                {agent.email && (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Mail size={13} className="shrink-0" />
                                        <span className="truncate">{agent.email}</span>
                                    </div>
                                )}
                                {agent.celular && (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Smartphone size={13} className="shrink-0" />
                                        <span>{agent.celular}</span>
                                    </div>
                                )}
                                {agent.tel_oficina && (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Building2 size={13} className="shrink-0" />
                                        <span>{agent.tel_oficina}</span>
                                    </div>
                                )}
                                {!agent.email && !agent.celular && !agent.tel_oficina && (
                                    <p className="text-xs text-muted-foreground/50 italic">Sin datos de contacto</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
