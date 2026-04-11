"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, UploadCloud, File, Trash2, Download } from "lucide-react";
import Link from "next/link";
import { insforge } from "@/lib/insforge";
import { toast } from "sonner";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

export default function ClientDocumentsPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const router = useRouter();
    const [documents, setDocuments] = useState<any[]>([]);
    const [clientName, setClientName] = useState("Cargando...");
    const [policies, setPolicies] = useState<any[]>([]);

    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState("");
    const [selectedPolicy, setSelectedPolicy] = useState("");
    const [docName, setDocName] = useState("");
    const [fileToUpload, setFileToUpload] = useState<File | null>(null);

    // Confirmation Modal state
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [docToDelete, setDocToDelete] = useState<{ id: string; key: string } | null>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadData = async () => {
        const clientId = resolvedParams.id;
        if (!clientId) {
            setError("Identificador de cliente no proporcionado.");
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        console.log("ClientDocumentsPage: Iniciando carga para ID:", clientId);

        try {
            // Unify requests to be more deterministic
            const [clientRes, policiesRes, docsRes] = await Promise.all([
                insforge.database.from("clients").select("full_name").eq("id", clientId).single(),
                insforge.database.from("client_products").select("id, policy_number, products(name, required_docs_schema)").eq("client_id", clientId),
                insforge.database.from("client_documents").select("*").eq("client_id", clientId).order("uploaded_at", { ascending: false })
            ]);

            // Detailed logging to identify which one fails
            if (clientRes.error) console.error("Error loading client:", clientRes.error);
            if (policiesRes.error) console.error("Error loading policies:", policiesRes.error);
            if (docsRes.error) console.error("Error loading docs:", docsRes.error);

            if (clientRes.error || !clientRes.data) {
                setError("No se pudo cargar la información del cliente. El ID podría ser inválido.");
            } else {
                setClientName(clientRes.data.full_name);
            }

            if (policiesRes.data) setPolicies(policiesRes.data);
            if (docsRes.data) setDocuments(docsRes.data);

        } catch (err: any) {
            console.error("General error in loadData:", err);
            setError("Ocurrió un error inesperado al conectar con el servidor.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (typeof window !== "undefined") {
            const urlParams = new URLSearchParams(window.location.search);
            const policyIdParam = urlParams.get("policyId");
            if (policyIdParam) {
                setSelectedPolicy(policyIdParam);
            }
        }
        loadData();
    }, [resolvedParams.id]);

    const selectedPolicyData = policies.find(p => p.id === selectedPolicy);
    const requiredDocs: string[] = selectedPolicyData?.products?.required_docs_schema || [];
    const missingDocs = requiredDocs.filter((reqDoc: string) => {
        return !documents.some(doc => doc.client_product_id === selectedPolicy && doc.name === reqDoc);
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFileToUpload(file);
            // Automatically suggest name from file name if not set
            if (!docName) {
                setDocName(file.name.split('.')[0]);
            }
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!fileToUpload) return toast.error("Selecciona un archivo primero");

        setIsUploading(true);
        setUploadProgress("Subiendo archivo...");

        try {
            // 1. Upload to Storage
            const { data: storageData, error: storageError } = await insforge.storage
                .from("documents")
                .uploadAuto(fileToUpload);

            if (storageError) throw storageError;
            if (!storageData) throw new Error("No data returned from storage upload");

            setUploadProgress("Registrando documento...");

            // 2. Save metadata to Database
            const { error: dbError } = await insforge.database
                .from("client_documents")
                .insert({
                    client_id: resolvedParams.id,
                    client_product_id: selectedPolicy || null,
                    name: docName || fileToUpload.name,
                    file_url: storageData.url,     // Matches DB schema file_url
                    file_key: storageData.key,      // Enabled by SQL migration
                });

            if (dbError) throw dbError;

            // 3. Reset form and reload
            setFileToUpload(null);
            setDocName("");
            setSelectedPolicy("");
            (document.getElementById("docFile") as HTMLInputElement).value = "";
            toast.success("Documento subido correctamente");
            await loadData();

        } catch (error: any) {
            console.error("Error uploading document:", error);
            toast.error("Error al subir el documento: " + (error.message || "Intenta de nuevo"));
        } finally {
            setIsUploading(false);
            setUploadProgress("");
        }
    };

    const handleDeleteClick = (docId: string, fileKey: string) => {
        setDocToDelete({ id: docId, key: fileKey });
        setIsConfirmOpen(true);
    };

    const performDelete = async () => {
        if (!docToDelete) return;

        try {
            // 1. Delete from Storage
            if (docToDelete.key) {
                await insforge.storage.from("documents").remove(docToDelete.key);
            }

            // 2. Delete from DB
            await insforge.database.from("client_documents").delete().eq("id", docToDelete.id);

            toast.info("Documento eliminado");
            await loadData();
        } catch (error: any) {
            console.error("Error deleting document:", error);
            toast.error("Error al eliminar el documento: " + (error.message || "Intenta de nuevo"));
        } finally {
            setDocToDelete(null);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">

            <div className="flex items-center justify-between border-b border-border pb-6">
                <div className="flex items-center gap-4">
                    <Link href={`/clients/${resolvedParams.id}`}>
                        <button className="p-2 rounded-md hover:bg-muted/50 transition-colors">
                            <ArrowLeft size={20} className="text-muted-foreground" />
                        </button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Expediente de Documentos</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Archivos del asegurado: <strong className="text-foreground">{clientName}</strong>
                        </p>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
                    <p className="text-muted-foreground">Cargando expediente del cliente...</p>
                </div>
            ) : error ? (
                <div className="bg-card border border-border shadow-sm rounded-xl p-12 text-center space-y-4">
                    <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ArrowLeft size={32} />
                    </div>
                    <h2 className="text-xl font-semibold">Algo salió mal</h2>
                    <p className="text-muted-foreground max-w-sm mx-auto">{error}</p>
                    <Link href={`/clients/${resolvedParams.id}`}>
                        <button className="mt-4 h-10 inline-flex items-center justify-center rounded-md border border-border bg-background px-6 text-sm font-medium hover:bg-muted/50 transition-colors">
                            Volver al Perfil
                        </button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* UPLOAD FORM */}
                    <div className="bg-card border border-border shadow-sm rounded-xl p-6 h-fit md:col-span-1 space-y-4 shadow-sm border border-border">
                        <h3 className="font-semibold text-lg border-b border-border pb-2 flex items-center gap-2">
                            <UploadCloud className="w-5 h-5 text-primary" /> Subir Nuevo Archivo
                        </h3>

                        <form onSubmit={handleUpload} className="space-y-4 pt-2">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Nombre / Descripción *</label>
                                <input
                                    required
                                    value={docName}
                                    onChange={e => setDocName(e.target.value)}
                                    placeholder="Ej. INE Frente"
                                    className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                                />
                                {selectedPolicy && missingDocs.length > 0 && (
                                    <div className="mt-3 bg-muted/30 p-3 rounded-md border border-border">
                                        <p className="text-xs font-semibold text-muted-foreground mb-2">Requeridos por la póliza:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {missingDocs.map((doc: string) => (
                                                <button
                                                    key={doc}
                                                    type="button"
                                                    onClick={() => setDocName(doc)}
                                                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${docName === doc ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-border hover:bg-muted font-medium text-muted-foreground'}`}
                                                >
                                                    + {doc}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Vincular a Póliza (Opcional)</label>
                                <select
                                    value={selectedPolicy}
                                    onChange={e => setSelectedPolicy(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                                >
                                    <option value="">-- General del Cliente --</option>
                                    {policies.map(p => (
                                        <option key={p.id} value={p.id}>
                                            {p.products?.name} - {p.policy_number || 'En trámite'}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Seleccionar Archivo *</label>
                                <div className="flex items-center justify-center w-full">
                                    <label htmlFor="docFile" className="flex flex-col items-center justify-center w-full h-32 border-2 border-border border-dashed rounded-lg cursor-pointer bg-muted/20 hover:bg-muted/50 transition-colors">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <UploadCloud className="w-8 h-8 mb-3 text-muted-foreground" />
                                            <p className="text-sm text-muted-foreground">
                                                <span className="font-semibold">{fileToUpload ? fileToUpload.name : "Click para explorar"}</span> o arrastra y suelta
                                            </p>
                                        </div>
                                        <input id="docFile" type="file" required className="hidden" onChange={handleFileChange} />
                                    </label>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isUploading || !fileToUpload}
                                className="w-full inline-flex items-center justify-center rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                            >
                                {isUploading ? uploadProgress : "Subir Documento"}
                            </button>
                        </form>
                    </div>

                    {/* DOCUMENTS LIST */}
                    <div className="md:col-span-2 space-y-4 bg-card border border-border shadow-sm rounded-xl p-6 shadow-sm border border-border">
                        <h3 className="font-semibold text-lg border-b border-border pb-2 flex items-center justify-between">
                            <div className="flex gap-2 items-center">
                                <File className="w-5 h-5 text-muted-foreground" /> Archivos Registrados
                            </div>
                            <span className="text-sm font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{documents.length} archivos</span>
                        </h3>

                        <div className="space-y-3 pt-2">
                            {documents.length > 0 ? (
                                documents.map(doc => {
                                    const isGeneralPolicy = !doc.client_product_id;
                                    const policyMatch = policies.find(p => p.id === doc.client_product_id);

                                    return (
                                        <div key={doc.id} className="group flex items-center justify-between p-4 rounded-lg border border-border bg-background/50 hover:border-primary/50 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center justify-center">
                                                    <File className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-sm">{doc.name}</h4>
                                                    <p className="text-xs text-muted-foreground mt-0.5 flex gap-2">
                                                        <span>{new Date(doc.uploaded_at).toLocaleDateString()}</span>
                                                        •
                                                        <span className={isGeneralPolicy ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-blue-600 dark:text-blue-400 font-medium"}>
                                                            {isGeneralPolicy ? "Doc. General" : `Póliza: ${policyMatch?.policy_number || 'Asegurada'}`}
                                                        </span>
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                                                    <button className="p-2 rounded-md bg-muted text-foreground hover:bg-primary hover:text-primary-foreground transition-colors" title="Descargar">
                                                        <Download className="w-4 h-4" />
                                                    </button>
                                                </a>
                                                <button
                                                    onClick={() => handleDeleteClick(doc.id, doc.file_key)}
                                                    className="p-2 rounded-md bg-muted text-red-600 hover:bg-red-600 hover:text-white transition-colors"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    )
                                })
                            ) : (
                                <div className="text-center py-12 border-2 border-dashed border-border rounded-lg bg-muted/20">
                                    <File className="mx-auto w-10 h-10 text-muted-foreground/30 mb-3" />
                                    <p className="text-sm font-medium">Sin documentos aún</p>
                                    <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">Sube identificaciones, pólizas PDF o comprobantes para este asegurado.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
            <ConfirmModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={performDelete}
                title="¿Eliminar documento?"
                description="Esta acción eliminará permanentemente el archivo del servidor y su registro de la base de datos. No se puede deshacer."
                variant="danger"
                confirmLabel="Eliminar Archivo"
            />
        </div>
    );
}
