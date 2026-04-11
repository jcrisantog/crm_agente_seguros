import { insforge } from "@/lib/insforge";
import { ArrowLeft, User, Phone, Mail, FileText, Plus, ShieldAlert, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ReminderButton } from "@/components/clients/ReminderButton";

// Define the fetch function
async function getClientDetails(id: string) {
    const { data, error } = await insforge.database
        .from("clients")
        .select(`
      *,
      client_products (
        *,
        products (name, required_docs_schema),
        client_documents (name)
      )
    `)
        .eq("id", id)
        .single();

    if (error || !data) {
        console.error("Error fetching client details:", error);
        return null;
    }
    return data;
}

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const client = await getClientDetails(resolvedParams.id);

    if (!client) {
        notFound();
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-border pb-6">
                <div className="flex items-center gap-4">
                    <Link href="/clients">
                        <button className="p-2 rounded-md hover:bg-muted/50 transition-colors">
                            <ArrowLeft size={20} className="text-muted-foreground" />
                        </button>
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg flex-shrink-0">
                            {client.full_name?.charAt(0) || "U"}
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{client.full_name}</h1>
                            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                                ID: <span className="font-mono text-xs">{client.id.split('-')[0]}</span>
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 sm:gap-3">
                    <Link href={`/clients/${client.id}/documents`} className="flex-1 sm:flex-none">
                        <button className="w-full h-10 inline-flex items-center justify-center rounded-lg border border-border bg-card px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium hover:bg-muted transition-colors shadow-sm">
                            Documentos
                        </button>
                    </Link>
                    <Link href={`/clients/${client.id}/edit`} className="flex-1 sm:flex-none">
                        <button className="w-full h-10 inline-flex items-center justify-center rounded-lg border border-border bg-card px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium hover:bg-muted transition-colors shadow-sm">
                            Editar
                        </button>
                    </Link>
                    <Link href={`/clients/${client.id}/products/new`} className="w-full sm:w-auto">
                        <button className="w-full h-10 inline-flex items-center justify-center rounded-lg bg-primary px-4 sm:px-5 py-2 text-xs sm:text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-all shadow-md">
                            <Plus className="mr-2 h-4 w-4" />
                            Nueva Póliza
                        </button>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Left Column: Client Info */}
                {/* Left Column: Client Info */}
                <div className="bg-card border border-border shadow-sm rounded-xl p-6 space-y-6">
                    <div className="flex items-center justify-between border-b border-border/60 pb-4">
                        <h3 className="font-semibold flex items-center gap-2 text-lg text-foreground">
                            <User className="h-5 w-5 text-indigo-500" />
                            Perfil del Asegurado
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        {/* RFC and Email */}
                        <div className="grid grid-cols-1 gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-muted/40">
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">RFC / ID Fiscal</p>
                                    <p className="text-sm font-semibold tracking-tight">{client.rfc || "No registrado"}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-muted/40">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div className="space-y-0.5 text-ellipsis overflow-hidden">
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">E-mail</p>
                                    <p className="text-sm font-semibold tracking-tight break-all">{client.email || "No registrado"}</p>
                                </div>
                            </div>
                        </div>

                        {/* Birth and Sex */}
                        <div className="grid grid-cols-1 gap-4 pt-2 border-t border-border/40">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-muted/40">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Sexo / F. Nacimiento</p>
                                    <p className="text-sm font-semibold tracking-tight">
                                        {client.sexo || "S/D"} • {client.fecha_nacimiento ? client.fecha_nacimiento.split('T')[0].split('-').reverse().join('/') : "S/D"}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-muted/40">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Celular</p>
                                    <p className="text-sm font-bold text-primary">{client.phone || "No registrado"}</p>
                                </div>
                            </div>
                        </div>

                        {/* Other Phones and Age */}
                        <div className="grid grid-cols-1 gap-4 pt-2 border-t border-border/40">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-muted/40">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Tels. Otros</p>
                                    <p className="text-sm font-semibold tracking-tight">
                                        Casa: {client.telefono_casa || "—"} | Oficina: {client.telefono_oficina || "—"}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-muted/40">
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Edad Emisión Ref.</p>
                                    <p className="text-sm font-semibold tracking-tight">{client.edad_emision || "N/A"}</p>
                                </div>
                            </div>
                        </div>

                        {/* Full Address */}
                        <div className="pt-4 border-t border-border/60">
                            <div className="flex items-start gap-3">
                                <div className="p-2 rounded-lg bg-muted/40 mt-1">
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Dirección Completa</p>
                                    <p className="text-sm font-medium leading-relaxed text-muted-foreground italic">
                                        {client.direccion || "No registrada"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>


                {/* Center/Right Column: Policies */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-card border border-border shadow-sm rounded-xl p-6 border-t-4 border-t-indigo-500">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-semibold text-lg tracking-tight">Pólizas Vinculadas</h3>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-foreground">
                                Total: {client.client_products?.length || 0}
                            </span>
                        </div>

                        <div className="space-y-4">
                            {client.client_products && client.client_products.length > 0 ? (
                                client.client_products.map((policy: any) => (
                                    <div key={policy.id} className="group relative rounded-xl border border-border bg-card shadow-sm hover:shadow-md hover:border-indigo-500/50 transition-all p-6">
                                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-5">
                                            <div>
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 mb-3 uppercase tracking-wider">
                                                    {policy.products?.name || policy.coverage_type || "Seguro"}
                                                </span>
                                                <h4 className="font-semibold text-base">{policy.insurer || "Aseguradora Pendiente"}</h4>
                                                <p className="text-sm text-muted-foreground font-mono mt-1">
                                                    Poliza: {policy.policy_number || "En trámite"}
                                                </p>
                                                <div className="mt-3">
                                                    <ReminderButton
                                                        policyNumber={policy.policy_number || "S/N"}
                                                        clientName={client.full_name}
                                                        policyId={policy.id}
                                                        clientId={client.id}
                                                    />
                                                </div>
                                            </div>
                                            <div className="sm:text-right w-full sm:w-auto flex sm:block justify-start">
                                                <div className={`text-xs font-bold px-3 py-1.5 rounded-full border shadow-sm ${policy.status === "Activa" ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20" :
                                                    policy.status === "Cancelada" ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20" :
                                                        policy.status === "Pendiente" ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20" :
                                                            "bg-muted text-muted-foreground border-border"
                                                    }`}>
                                                    {policy.status?.toUpperCase() || "S/D"}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 py-4 border-y border-border/50 bg-muted/30 px-6 -mx-6 mb-5">
                                            <div>
                                                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Prima Anual</p>
                                                <p className="text-sm font-medium mt-0.5">${policy.net_premium || "0.00"} {policy.moneda || "UDI"}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Vencimiento</p>
                                                <p className="text-sm font-medium mt-0.5">
                                                    {policy.payment_limit
                                                        ? policy.payment_limit.split('T')[0].split('-').reverse().join('/')
                                                        : "No definido"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-sm pt-2 gap-3">
                                            <div>
                                                {(() => {
                                                    const required = policy.products?.required_docs_schema || [];
                                                    const uploaded = policy.client_documents?.map((d: any) => d.name) || [];
                                                    const missing = required.filter((req: string) => !uploaded.includes(req));

                                                    if (missing.length > 0) {
                                                        return (
                                                            <p className="text-rose-600 font-semibold flex items-center gap-1.5 animate-pulse">
                                                                <ShieldAlert size={14} />
                                                                Faltan {missing.length} documentos
                                                            </p>
                                                        );
                                                    }
                                                    return (
                                                        <p className="text-emerald-600 font-semibold flex items-center gap-1.5">
                                                            <ShieldCheck size={14} />
                                                            Expediente Completo
                                                        </p>
                                                    );
                                                })()}
                                            </div>
                                            <div className="flex items-center gap-4 w-full sm:w-auto justify-end border-t sm:border-transparent pt-2 sm:pt-0">
                                                <Link href={`/clients/${client.id}/products/${policy.id}/edit`}>
                                                    <button className="text-muted-foreground hover:text-foreground font-medium text-sm transition-colors">
                                                        Editar
                                                    </button>
                                                </Link>
                                                <Link href={`/clients/${client.id}/documents?policyId=${policy.id}`}>
                                                    <button className="text-primary font-medium hover:underline text-sm transition-opacity">
                                                        Ver Detalles &rarr;
                                                    </button>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-center bg-muted/20 rounded-lg border border-dashed border-border">
                                    <ShieldAlert className="h-10 w-10 text-muted-foreground/40 mb-3" />
                                    <p className="text-base font-medium text-foreground">Sin pólizas registradas</p>
                                    <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                                        Este cliente aún no tiene seguros activos o trámites iniciados en el sistema.
                                    </p>
                                    <Link href={`/clients/${client.id}/products/new`}>
                                        <button className="mt-4 h-9 inline-flex items-center justify-center rounded-md border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted/50 transition-colors">
                                            <Plus className="mr-2 h-4 w-4" /> Asignar Primer Póliza
                                        </button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}
