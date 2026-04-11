"use client";

import { useState } from "react";
import { Search, Plus, Users, Phone } from "lucide-react";
import Link from "next/link";

interface Client {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    created_at: string;
    client_products: { count: number }[];
}

export function ClientsList({ initialClients }: { initialClients: any[] }) {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredClients = initialClients.filter((client) =>
        client.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.phone?.includes(searchTerm)
    );

    return (
        <>
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Directorio de Clientes</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Gestiona asegurados, historial y prospectos.
                    </p>
                </div>

                <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Buscar cliente..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="h-10 w-full xs:w-[180px] sm:w-[250px] rounded-md border border-border bg-background px-9 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary transition-all sm:focus:w-[300px]"
                        />
                    </div>
                    <Link href="/clients/new" className="w-full xs:w-auto">
                        <button className="h-10 w-full inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
                            <Plus className="mr-2 h-4 w-4" />
                            <span className="xs:hidden sm:inline">Nuevo Cliente</span>
                            <span className="hidden xs:inline sm:hidden">Nuevo</span>
                        </button>
                    </Link>
                </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block bg-card border border-border shadow-sm rounded-xl overflow-hidden mt-6">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 border-b border-border text-xs uppercase text-muted-foreground">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Asegurado</th>
                                <th className="px-6 py-4 font-semibold">Contacto</th>
                                <th className="px-6 py-4 font-semibold justify-center text-center">Pólizas Activas</th>
                                <th className="px-6 py-4 font-semibold text-right">Registro</th>
                                <th className="px-6 py-4 font-semibold text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredClients.length > 0 ? (
                                filteredClients.map((client) => (
                                    <tr key={client.id} className="hover:bg-muted/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs transition-transform group-hover:scale-110 shrink-0">
                                                    {client.full_name?.charAt(0) || "U"}
                                                </div>
                                                <span className="font-medium text-foreground">{client.full_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">
                                            <div className="flex flex-col">
                                                <span>{client.email || "Sin correo"}</span>
                                                <span className="text-xs">{client.phone || "Sin teléfono"}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                                                {client.client_products?.[0]?.count || 0}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right text-muted-foreground whitespace-nowrap">
                                            {new Date(client.created_at).toLocaleDateString("es-MX", {
                                                year: "numeric", month: "short", day: "numeric"
                                            })}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link href={`/clients/${client.id}`}>
                                                <button className="text-primary hover:bg-primary/10 px-3 py-1.5 rounded-md font-medium text-sm transition-colors border border-transparent hover:border-primary/20">
                                                    Abrir Perfil
                                                </button>
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                                        No se encontraron clientes.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4 mt-6">
                {filteredClients.length > 0 ? (
                    filteredClients.map((client) => (
                        <div key={client.id} className="bg-card border border-border shadow-sm rounded-xl p-4 flex flex-col gap-4 border border-border/50">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                        {client.full_name?.charAt(0) || "U"}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-foreground text-base leading-tight">{client.full_name}</span>
                                        <span className="text-xs text-muted-foreground mt-0.5">{client.email || "Sin email"}</span>
                                    </div>
                                </div>
                                <div className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 px-2 py-1 rounded text-xs font-bold ring-1 ring-emerald-200 dark:ring-emerald-800">
                                    {client.client_products?.[0]?.count || 0} Pólizas
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Link href={`/clients/${client.id}`} className="flex-1">
                                    <button className="w-full h-10 bg-primary text-primary-foreground rounded-lg font-bold text-sm shadow-sm active:scale-[0.98] transition-all">
                                        Abrir Perfil Completo
                                    </button>
                                </Link>
                                <a href={`tel:${client.phone}`} className="shrink-0">
                                    <button className="h-10 w-10 border border-border flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground">
                                        <Phone size={18} />
                                    </button>
                                </a>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border">
                        <Users className="mx-auto h-12 w-12 opacity-20 mb-2" />
                        <p>No se encontraron resultados</p>
                    </div>
                )}
            </div>
        </>
    );
}
