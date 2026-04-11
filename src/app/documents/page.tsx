"use client";

import { useState, useEffect } from "react";
import {
    Search,
    File,
    ExternalLink,
    Download,
    Trash2,
    Filter,
    Calendar,
    Users as UsersIcon,
    Shield
} from "lucide-react";
import Link from "next/link";
import { insforge } from "@/lib/insforge";

export default function DocumentsGeneralPage() {
    const [documents, setDocuments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState("all"); // all, general, policy

    const loadDocuments = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await insforge.database
                .from("client_documents")
                .select(`
                    *,
                    clients (full_name),
                    client_products (policy_number, products (name))
                `)
                .order("uploaded_at", { ascending: false });

            if (data) setDocuments(data);
            if (error) console.error("Error loading documents:", error);
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadDocuments();
    }, []);

    const handleDelete = async (docId: string, fileKey: string) => {
        if (!confirm("¿Seguro que deseas eliminar este documento? Esta acción no se puede deshacer.")) return;

        try {
            if (fileKey) {
                await insforge.storage.from("documents").remove(fileKey);
            }
            const { error } = await insforge.database.from("client_documents").delete().eq("id", docId);
            if (error) throw error;

            setDocuments(prev => prev.filter(d => d.id !== docId));
        } catch (error) {
            console.error("Error deleting document:", error);
            alert("Error al eliminar el documento.");
        }
    };

    const filteredDocs = documents.filter(doc => {
        const matchesSearch =
            doc.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            doc.clients?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            doc.client_products?.policy_number?.toLowerCase().includes(searchQuery.toLowerCase());

        const isPolicyDoc = !!doc.client_product_id;
        if (filterType === "general") return matchesSearch && !isPolicyDoc;
        if (filterType === "policy") return matchesSearch && isPolicyDoc;
        return matchesSearch;
    });

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Expediente General</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Todos los documentos subidos al sistema.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre, cliente o póliza..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-10 w-[300px] rounded-md border border-border bg-background px-9 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                        />
                    </div>
                </div>
            </div>

            <div className="flex gap-2 pb-2">
                <button
                    onClick={() => setFilterType("all")}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${filterType === 'all' ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-border hover:bg-muted'}`}
                >
                    Todos
                </button>
                <button
                    onClick={() => setFilterType("general")}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${filterType === 'general' ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-border hover:bg-muted'}`}
                >
                    Docs Generales
                </button>
                <button
                    onClick={() => setFilterType("policy")}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${filterType === 'policy' ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-border hover:bg-muted'}`}
                >
                    Por Póliza
                </button>
            </div>

            <div className="bg-card border border-border shadow-sm rounded-xl overflow-hidden shadow-sm border border-border">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 border-b border-border text-xs uppercase text-muted-foreground">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Documento</th>
                                <th className="px-6 py-4 font-semibold">Relacionado con</th>
                                <th className="px-6 py-4 font-semibold">Fecha</th>
                                <th className="px-6 py-4 font-semibold text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                                        Cargando archivos...
                                    </td>
                                </tr>
                            ) : filteredDocs.length > 0 ? (
                                filteredDocs.map((doc) => (
                                    <tr key={doc.id} className="hover:bg-muted/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-lg bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center justify-center">
                                                    <File size={18} />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-foreground">{doc.name}</p>
                                                    {doc.clients && (
                                                        <Link href={`/clients/${doc.client_id}`} className="text-xs text-primary hover:underline flex items-center gap-1 mt-0.5">
                                                            <UsersIcon size={12} className="text-muted-foreground" />
                                                            {doc.clients.full_name}
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">
                                            {doc.client_product_id ? (
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-xs font-medium text-blue-600 dark:text-blue-400 flex items-center gap-1">
                                                        <Shield size={12} />
                                                        {doc.client_products?.products?.name || "Seguro"}
                                                    </span>
                                                    <span className="text-xs font-mono">#{doc.client_products?.policy_number || 'En trámite'}</span>
                                                </div>
                                            ) : (
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/30">
                                                    Expediente General
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">
                                            <div className="flex items-center gap-2 text-xs">
                                                <Calendar size={14} />
                                                {new Date(doc.uploaded_at).toLocaleDateString("es-MX", {
                                                    day: "2-digit",
                                                    month: "short",
                                                    year: "numeric"
                                                })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                                                    <button className="p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Descargar">
                                                        <Download size={16} />
                                                    </button>
                                                </a>
                                                <button
                                                    onClick={() => handleDelete(doc.id, doc.file_key)}
                                                    className="p-2 rounded-md hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                                        <div className="flex flex-col items-center justify-center">
                                            <File className="h-10 w-10 text-muted-foreground/30 mb-3" />
                                            <p className="text-base font-medium text-foreground">No se encontraron documentos</p>
                                            <p className="text-sm mt-1">Intenta con otra búsqueda o filtro.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
