"use client";

import { useState, useEffect } from "react";
import {
    Settings,
    Bell,
    Lock,
    User,
    Database,
    Save,
    CheckCircle2,
    ShieldAlert,
    Mail,
    Clock,
    FileCode,
    Bold,
    Italic,
    Underline,
    List,
    ListOrdered,
    Type,
    Palette,
    Code,
    History,
    AlertCircle,
    Play,
    Loader2,
    CheckCircle,
    Tag,
    Send,
    Receipt
} from "lucide-react";

// Opciones del Régimen Fiscal de acuerdo al catálogo del SAT
const REGIMEN_FISCAL_OPTIONS = [
    { value: "601", label: "601 - General de Ley Personas Morales" },
    { value: "603", label: "603 - Personas Morales con Fines no Lucrativos" },
    { value: "605", label: "605 - Sueldos y Salarios e Ingresos Asimilados a Salarios" },
    { value: "606", label: "606 - Arrendamiento" },
    { value: "607", label: "607 - Régimen de Enajenación o Adquisición de Bienes" },
    { value: "608", label: "608 - Demás ingresos" },
    { value: "609", label: "609 - Consolidación" },
    { value: "610", label: "610 - Residentes en el Extranjero sin Establecimiento Permanente en México" },
    { value: "611", label: "611 - Ingresos por Dividendos (socios y accionistas)" },
    { value: "612", label: "612 - Personas Físicas con Actividades Empresariales y Profesionales" },
    { value: "614", label: "614 - Ingresos por intereses" },
    { value: "615", label: "615 - Régimen de los ingresos por obtención de premios" },
    { value: "616", label: "616 - Sin obligaciones fiscales" },
    { value: "620", label: "620 - Sociedades Cooperativas de Producción que optan por diferir sus ingresos" },
    { value: "621", label: "621 - Incorporación Fiscal" },
    { value: "622", label: "622 - Actividades Agrícolas, Ganaderas, Silvícolas y Pesqueras" },
    { value: "623", label: "623 - Opcional para Grupos de Sociedades" },
    { value: "624", label: "624 - Coordinados" },
    { value: "625", label: "625 - Régimen de las Actividades Empresariales con ingresos a través de Plataformas Tecnológicas" },
    { value: "626", label: "626 - Régimen Simplificado de Confianza" },
    { value: "628", label: "628 - Hidrocarburos" },
    { value: "629", label: "629 - De los Regímenes Fiscales Preferentes y de las Empresas Multinacionales" },
    { value: "630", label: "630 - Enajenación de acciones en bolsa de valore" }
];
import { insforge } from "@/lib/insforge";
import { toast } from "sonner";
import { useRef } from "react";

// Componente Editor de Texto Enriquecido
function RichTextEditor({ value, onChange }: { value: string, onChange: (val: string) => void }) {
    const editorRef = useRef<HTMLDivElement>(null);
    const lastValue = useRef(value);

    // Sincronizar el valor externo (por ejemplo, al cargar de DB o insertar variable)
    useEffect(() => {
        if (editorRef.current && value !== editorRef.current.innerHTML) {
            editorRef.current.innerHTML = value;
            lastValue.current = value;
        }
    }, [value]);

    useEffect(() => {
        // Asegurar que al pulsar Enter se creen etiquetas de párrafo
        document.execCommand('defaultParagraphSeparator', false, 'p');
    }, []);

    const execCommand = (command: string, arg?: string) => {
        document.execCommand(command, false, arg);
        if (editorRef.current) {
            const newValue = editorRef.current.innerHTML;
            lastValue.current = newValue;
            onChange(newValue);
        }
    };

    const handleInput = () => {
        if (editorRef.current) {
            const newValue = editorRef.current.innerHTML;
            lastValue.current = newValue;
            onChange(newValue);
        }
    };

    const insertVariableAtCursor = (variable: string) => {
        if (!editorRef.current) return;

        editorRef.current.focus();
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);

            if (editorRef.current.contains(range.commonAncestorContainer)) {
                range.deleteContents();
                const textNode = document.createTextNode(variable);
                range.insertNode(textNode);

                range.setStartAfter(textNode);
                range.setEndAfter(textNode);
                selection.removeAllRanges();
                selection.addRange(range);

                handleInput();
                return;
            }
        }

        editorRef.current.innerHTML += variable;
        handleInput();
    };

    return (
        <div className="flex flex-col rounded-md border border-border bg-background overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 transition-all">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-1 p-2 border-b border-border bg-muted/30">
                <button type="button" onClick={() => execCommand('bold')} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Negrita"><Bold size={16} /></button>
                <button type="button" onClick={() => execCommand('italic')} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Cursiva"><Italic size={16} /></button>
                <button type="button" onClick={() => execCommand('underline')} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Subrayado"><Underline size={16} /></button>
                <div className="w-[1px] h-4 bg-border mx-1" />
                <button type="button" onClick={() => execCommand('insertUnorderedList')} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Lista"><List size={16} /></button>
                <button type="button" onClick={() => execCommand('insertOrderedList')} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Lista Numerada"><ListOrdered size={16} /></button>
                <div className="w-[1px] h-4 bg-border mx-1" />
                <select
                    onChange={(e) => execCommand('fontSize', e.target.value)}
                    className="h-7 text-[11px] bg-transparent border-none focus:ring-0 text-muted-foreground"
                >
                    <option value="3">Tamaño Normal</option>
                    <option value="1">Pequeño</option>
                    <option value="5">Grande</option>
                    <option value="7">Muy Grande</option>
                </select>
                <input
                    type="color"
                    onChange={(e) => execCommand('foreColor', e.target.value)}
                    className="w-6 h-6 p-0 border-none bg-transparent cursor-pointer"
                    title="Color de texto"
                />
            </div>

            {/* Editor Area */}
            <div
                ref={editorRef}
                contentEditable
                onInput={handleInput}
                className="p-4 min-h-[200px] text-sm focus:outline-none leading-relaxed"
                suppressContentEditableWarning
            />

            {/* Quick Variables */}
            <div className="p-3 bg-muted/20 border-t border-border flex flex-wrap gap-2 items-center">
                <span className="text-[10px] font-bold uppercase text-muted-foreground/70 mr-2">Insertar Variable:</span>
                {["{{nombre}}", "{{fecha_pago}}", "{{dias_restantes}}", "{{monto}}", "{{msi_opciones}}", "{{fecha_pago_menos_10}}", "{{tarjeta_principal}}", "{{banco}}"].map(v => (
                    <button
                        key={v}
                        type="button"
                        onClick={() => insertVariableAtCursor(v)}
                        className="bg-primary/5 hover:bg-primary/10 text-primary px-2.5 py-1 rounded text-[10px] font-mono border border-primary/20 transition-colors"
                    >
                        {v}
                    </button>
                ))}
            </div>
        </div>
    );
}

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Estado para la configuración de recordatorios
    const [reminderSettings, setReminderSettings] = useState<any>({
        threshold_1: 10,
        threshold_2: 5,
        threshold_3: 3,
        delivery_hour: "09:00",
        email_subject: "",
        email_template: "",
        msi_options: [],
        msi_active: false,
        msi_start_date: "",
        msi_end_date: "",
        msi_email_subject: "",
        msi_email_template: ""
    });

    // Estado para la configuración de facturación
    const [billingSettings, setBillingSettings] = useState<any>({
        razon_social: "",
        domicilio: "",
        codigo_postal: "",
        rfc: "",
        telefono: "",
        regimen_fiscal: ""
    });

    // Estado para los logs
    const [logs, setLogs] = useState<any[]>([]);
    const [msiLogs, setMsiLogs] = useState<any[]>([]);
    const [isLoadingLogs, setIsLoadingLogs] = useState(false);
    const [isLoadingMsiLogs, setIsLoadingMsiLogs] = useState(false);
    const [isRunningJob, setIsRunningJob] = useState(false);
    const [isSendingMsi, setIsSendingMsi] = useState(false);
    const [isMsiConfirmationOpen, setIsMsiConfirmationOpen] = useState(false);

    const fetchLogs = async () => {
        setIsLoadingLogs(true);
        try {
            const { data, error } = await insforge.database
                .from("reminder_logs")
                .select("*")
                .order("execution_date", { ascending: false })
                .limit(20);
            if (data) setLogs(data);
        } catch (error) {
            console.error("Error al cargar logs:", error);
        } finally {
            setIsLoadingLogs(false);
        }
    };

    const handleRunJob = async () => {
        setIsRunningJob(true);
        try {
            const { data, error } = await insforge.functions.invoke('automated-reminders-batch', {
                body: { force: true }
            });
            if (error) throw error;

            toast.success("Proceso automatizado ejecutado", {
                description: `Se procesaron ${data?.results?.length || 0} pólizas. Los webhooks y correos se gestionan desde el servidor.`
            });
            fetchLogs(); // Recargar logs
        } catch (error: any) {
            console.error("Error al ejecutar proceso:", error);
            toast.error("Error al ejecutar el proceso manual", {
                description: error.message
            });
        } finally {
            setIsRunningJob(false);
        }
    };

    const handleSendMsiPromotions = async () => {
        setIsMsiConfirmationOpen(false);
        setIsSendingMsi(true);
        try {
            const res = await fetch("/api/send-msi-promotions", { method: "POST" });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Ocurrió un error");

            const diag = data.diagnostics || {};
            const sent = diag.sentCount ?? data.count ?? 0;
            const found = diag.foundPolicies ?? 0;
            const errors = diag.errors?.length ?? 0;
            const report = diag.errorReport ? ` (${diag.errorReport})` : "";

            toast.success("Envío de Promociones", {
                description: `Enviadas: ${sent} | Encontradas: ${found} | Omitidas: ${errors}${report}`,
            });
            fetchMsiLogs();
        } catch (error: any) {
            console.error("Error al ejecutar promociones MSI:", error);
            toast.error("Error al ejecutar proceso", { description: error.message });
        } finally {
            setIsSendingMsi(false);
        }
    };

    const fetchMsiLogs = async () => {
        setIsLoadingMsiLogs(true);
        try {
            const { data, error } = await insforge.database
                .from("sent_messages")
                .select("*")
                .eq("type", "MSI_PROMOTION")
                .order("sent_at", { ascending: false })
                .limit(50);
            if (data) setMsiLogs(data);
        } catch (error) {
            console.error("Error al cargar logs MSI:", error);
        } finally {
            setIsLoadingMsiLogs(false);
        }
    }

    useEffect(() => {
        if (activeTab === "history") {
            fetchLogs();
        } else if (activeTab === "msi_history") {
            fetchMsiLogs();
        }
    }, [activeTab]);

    useEffect(() => {
        const fetchSettings = async () => {
            const { data, error } = await insforge.database
                .from("reminder_settings")
                .select("*")
                .limit(1)
                .maybeSingle();

            if (data) {
                setReminderSettings(data);
            }

            const { data: billingData } = await insforge.database
                .from("billing_settings")
                .select("*")
                .limit(1)
                .maybeSingle();

            if (billingData) {
                setBillingSettings(billingData);
            }
        };
        fetchSettings();
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            if (activeTab === "reminders" || activeTab === "msi") {
                // Asegurar que los valores numéricos son enteros y no NaN
                const { id, ...rest } = reminderSettings;
                const cleanData = {
                    ...rest,
                    threshold_1: parseInt(String(reminderSettings.threshold_1)) || 10,
                    threshold_2: parseInt(String(reminderSettings.threshold_2)) || 5,
                    threshold_3: parseInt(String(reminderSettings.threshold_3)) || 3,
                    // Asegurar consistencia de datos MSI
                    msi_options: reminderSettings.msi_options || [],
                    msi_active: !!reminderSettings.msi_active,
                    msi_start_date: reminderSettings.msi_start_date || null,
                    msi_end_date: reminderSettings.msi_end_date || null,
                    msi_email_subject: reminderSettings.msi_email_subject || "",
                    msi_email_template: reminderSettings.msi_email_template || ""
                };

                let response;
                if (id) {
                    // Update existente - Excluímos el ID del cuerpo para evitar errores de PK
                    response = await insforge.database
                        .from("reminder_settings")
                        .update(cleanData)
                        .eq("id", id)
                        .select();
                } else {
                    // Insertar nuevo si no hay ID
                    response = await insforge.database
                        .from("reminder_settings")
                        .insert([cleanData])
                        .select();
                }

                if (response.error) {
                    console.error("DB Error:", response.error);
                    throw new Error(response.error.message || "Error en la base de datos");
                }
            } else if (activeTab === "billing") {
                const { id, ...rest } = billingSettings;
                let response;
                if (id) {
                    response = await insforge.database
                        .from("billing_settings")
                        .update(rest)
                        .eq("id", id)
                        .select();
                } else {
                    response = await insforge.database
                        .from("billing_settings")
                        .insert([rest])
                        .select();
                }

                if (response.error) {
                    console.error("DB Error:", response.error);
                    throw new Error(response.error.message || "Error en la base de datos");
                }
            } else {
                // Simular guardado para otras pestañas (legacy logic)
                await new Promise(resolve => setTimeout(resolve, 800));
            }
            toast.success("Configuración guardada correctamente");
        } catch (error: any) {
            console.error("Save Error Detail:", error);
            toast.error("Error al guardar la configuración", {
                description: error.message || "Verifica la consola para más detalles."
            });
        } finally {
            setIsSaving(false);
        }
    };

    const tabs = [
        /* { id: "profile", label: "Perfil de Usuario", icon: User }, */
        /* { id: "notifications", label: "Notificaciones", icon: Bell }, */
        { id: "reminders", label: "Recordatorios Email", icon: Mail },
        { id: "history", label: "Historial de Envíos", icon: History },
        { id: "msi", label: "Promociones MSI", icon: Tag },
        { id: "billing", label: "Datos para facturar", icon: Receipt },
        /* { id: "msi_history", label: "Mensajes Enviados", icon: Send }, */
        /* { id: "security", label: "Seguridad y Accesos", icon: Lock }, */
        /* { id: "database", label: "Datos y Exportación", icon: Database }, */
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Ajustes del Sistema</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Configura tu cuenta y las preferencias del CRM.
                    </p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Tabs Sidebar */}
                <div className="w-full md:w-64 space-y-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'}`}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="flex-1 space-y-6">
                    {!activeTab ? (
                        <div className="bg-card border border-border border-dashed shadow-sm rounded-xl p-12 flex flex-col items-center justify-center text-center animate-in fade-in duration-500">
                            <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                                <Settings className="text-muted-foreground/40" size={32} />
                            </div>
                            <h3 className="text-lg font-medium text-foreground">Selecciona una opción</h3>
                            <p className="text-sm text-muted-foreground max-w-[250px] mt-1">
                                Elige una de las categorías de la izquierda para configurar los parámetros del sistema.
                            </p>
                        </div>
                    ) : (
                        <div className="bg-card border border-border shadow-sm rounded-xl p-6 md:p-8">

                        {activeTab === "profile" && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold border-b border-border pb-2">Información de Perfil</h3>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2 sm:col-span-2">
                                        <label className="text-sm font-medium">Nombre de la Organización</label>
                                        <input defaultValue="Diego MN Seguros" className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Nombre del Administrador</label>
                                        <input defaultValue="Juan Perez" className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Correo de Soporte</label>
                                        <input defaultValue="admin@diegomn.com" className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "notifications" && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold border-b border-border pb-2">Preferencias de Alertas</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">Vencimiento de Pólizas</p>
                                            <p className="text-xs text-muted-foreground">Alertas {reminderSettings.threshold_1} días antes del vencimiento</p>
                                        </div>
                                        <div className="h-6 w-11 rounded-full bg-primary relative cursor-pointer"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div></div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">Documentos Pendientes</p>
                                            <p className="text-xs text-muted-foreground">Resumen semanal de expedientes incompletos</p>
                                        </div>
                                        <div className="h-6 w-11 rounded-full bg-primary relative cursor-pointer"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div></div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">Pagos Atrasados</p>
                                            <p className="text-xs text-muted-foreground">Notificación inmediata de falta de pago</p>
                                        </div>
                                        <div className="h-6 w-11 rounded-full bg-muted relative cursor-pointer"><div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></div></div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "reminders" && (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                <div className="flex items-center justify-between border-b border-border pb-2">
                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                        <Mail className="text-primary" size={20} />
                                        Configuración de Recordatorios Email
                                    </h3>
                                    <button
                                        onClick={handleRunJob}
                                        disabled={isRunningJob}
                                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold bg-amber-500 text-white hover:bg-amber-600 transition-colors disabled:opacity-50"
                                    >
                                        {isRunningJob ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
                                        Ejecutar Proceso Ahora
                                    </button>
                                </div>

                                <div className="grid gap-6">
                                    <div className="space-y-4">
                                        <p className="text-sm font-medium text-muted-foreground">Intervalos de Alerta (Días antes del vencimiento)</p>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">1er Aviso</label>
                                                <input
                                                    type="number"
                                                    value={reminderSettings.threshold_1}
                                                    onChange={(e) => setReminderSettings({ ...reminderSettings, threshold_1: parseInt(e.target.value) })}
                                                    className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">2do Aviso</label>
                                                <input
                                                    type="number"
                                                    value={reminderSettings.threshold_2}
                                                    onChange={(e) => setReminderSettings({ ...reminderSettings, threshold_2: parseInt(e.target.value) })}
                                                    className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">3er Aviso</label>
                                                <input
                                                    type="number"
                                                    value={reminderSettings.threshold_3}
                                                    onChange={(e) => setReminderSettings({ ...reminderSettings, threshold_3: parseInt(e.target.value) })}
                                                    className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium flex items-center gap-2">
                                            <Clock size={16} className="text-muted-foreground" />
                                            Hora de Envío Diaria
                                        </label>
                                        <input
                                            type="time"
                                            value={reminderSettings.delivery_hour}
                                            onChange={(e) => setReminderSettings({ ...reminderSettings, delivery_hour: e.target.value })}
                                            className="flex h-10 w-full md:w-48 rounded-md border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                        />
                                        <p className="text-[11px] text-muted-foreground">Hora en la que se disparará el proceso automático de revisión de pólizas.</p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Asunto del Correo</label>
                                        <input
                                            value={reminderSettings.email_subject}
                                            onChange={(e) => setReminderSettings({ ...reminderSettings, email_subject: e.target.value })}
                                            className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                            placeholder="Ej: Recordatorio de Pago - {{nombre}}"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium flex items-center gap-2">
                                            <Type size={16} className="text-muted-foreground" />
                                            Cuerpo del Mensaje (Plantilla)
                                        </label>

                                        <RichTextEditor
                                            value={reminderSettings.email_template}
                                            onChange={(html) => setReminderSettings({ ...reminderSettings, email_template: html })}
                                        />

                                        <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-1">
                                            <Code size={12} />
                                            Sugerencia: Haz clic en las variables de arriba para insertarlas donde desees.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "history" && (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                <div className="flex items-center justify-between border-b border-border pb-2">
                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                        <History className="text-primary" size={20} />
                                        Historial de Ejecuciones
                                    </h3>
                                    <button
                                        onClick={fetchLogs}
                                        className="text-primary text-xs font-medium hover:underline flex items-center gap-1"
                                    >
                                        {isLoadingLogs ? <Loader2 size={12} className="animate-spin" /> : <Clock size={12} />}
                                        Actualizar
                                    </button>
                                </div>

                                {isLoadingLogs && logs.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                        <Loader2 className="h-8 w-8 animate-spin mb-4" />
                                        <p>Cargando historial...</p>
                                    </div>
                                ) : logs.length === 0 ? (
                                    <div className="text-center py-12 bg-muted/20 rounded-lg border border-dashed border-border">
                                        <History className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                                        <p className="text-sm text-muted-foreground">No hay registros de ejecución todavía.</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto rounded-xl border border-border shadow-sm">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-muted/50 text-muted-foreground font-semibold uppercase text-[10px] tracking-wider">
                                                <tr>
                                                    <th className="px-4 py-3">Fecha y Hora</th>
                                                    <th className="px-4 py-3">Estado</th>
                                                    <th className="px-4 py-3 text-center">Pólizas</th>
                                                    <th className="px-4 py-3 text-center">Envíos</th>
                                                    <th className="px-4 py-3">Resumen</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border">
                                                {logs.map((log) => (
                                                    <tr key={log.id} className="hover:bg-muted/20 transition-colors group">
                                                        <td className="px-4 py-3 whitespace-nowrap text-xs font-medium">
                                                            {new Date(log.execution_date).toLocaleString()}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center gap-1.5">
                                                                {log.status === 'success' && <CheckCircle size={14} className="text-emerald-500" />}
                                                                {log.status === 'partial' && <AlertCircle size={14} className="text-amber-500" />}
                                                                {log.status === 'error' && <AlertCircle size={14} className="text-rose-500" />}
                                                                <span className={`capitalize font-bold text-[9px] px-2 py-0.5 rounded-full ${log.status === 'success' ? 'bg-emerald-100 text-emerald-700' :
                                                                    log.status === 'partial' ? 'bg-amber-100 text-amber-700' :
                                                                        'bg-rose-100 text-rose-700'
                                                                    }`}>
                                                                    {log.status}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-center font-mono font-bold">{log.policies_count}</td>
                                                        <td className="px-4 py-3 text-center font-mono font-bold text-emerald-600">{log.sent_count}</td>
                                                        <td className="px-4 py-3 text-[11px] text-muted-foreground">
                                                            <div className="line-clamp-1 group-hover:line-clamp-none transition-all">
                                                                {log.message}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === "msi" && (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                <div className="flex items-center justify-between border-b border-border pb-2">
                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                        <Tag className="text-primary" size={20} />
                                        Configuración de Promociones (MSI)
                                    </h3>
                                    {/* <button
                                        onClick={() => setIsMsiConfirmationOpen(true)}
                                        disabled={isSendingMsi}
                                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold bg-amber-500 text-white hover:bg-amber-600 transition-colors disabled:opacity-50"
                                    >
                                        {isSendingMsi ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
                                        Enviar Promociones MSI
                                    </button> */}
                                </div>

                                <div className="grid gap-6">
                                    <div className="flex items-center justify-between bg-muted/30 p-4 rounded-lg border border-border">
                                        <div>
                                            <p className="font-medium">Promoción MSI Activa</p>
                                            <p className="text-xs text-muted-foreground">Si está activa, los recordatorios de pólizas candidatas incluirán la promoción MSI.</p>
                                        </div>
                                        <div 
                                            onClick={() => setReminderSettings({ ...reminderSettings, msi_active: !reminderSettings.msi_active })}
                                            className={`h-6 w-11 rounded-full relative cursor-pointer transition-colors ${reminderSettings.msi_active ? 'bg-primary' : 'bg-muted'}`}>
                                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${reminderSettings.msi_active ? 'right-1' : 'left-1'}`}></div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <p className="text-sm font-medium flex items-center gap-2">
                                            <Tag size={16} className="text-muted-foreground" />
                                            Opciones MSI (Meses Sin Intereses)
                                        </p>
                                        <div className="flex gap-4">
                                            {[3, 6, 9, 12].map(option => (
                                                <label key={option} className="flex items-center space-x-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={(reminderSettings.msi_options || []).includes(option.toString())}
                                                        onChange={(e) => {
                                                            const currentOptions = new Set(reminderSettings.msi_options || []);
                                                            if (e.target.checked) currentOptions.add(option.toString());
                                                            else currentOptions.delete(option.toString());
                                                            setReminderSettings({ ...reminderSettings, msi_options: Array.from(currentOptions) });
                                                        }}
                                                        className="form-checkbox text-primary border-border focus:ring-primary h-4 w-4"
                                                    />
                                                    <span className="text-sm font-medium">{option} Meses</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium flex items-center gap-2">
                                            <Clock size={16} className="text-muted-foreground" />
                                            Rango de Fechas de la Promoción
                                        </label>
                                        <div className="flex gap-4">
                                            <div className="flex-1">
                                                <span className="text-xs text-muted-foreground font-semibold uppercase">Fecha Inicio</span>
                                                <input
                                                    type="date"
                                                    value={reminderSettings.msi_start_date || ""}
                                                    onChange={(e) => setReminderSettings({ ...reminderSettings, msi_start_date: e.target.value })}
                                                    className="w-full mt-1 flex h-10 rounded-md border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <span className="text-xs text-muted-foreground font-semibold uppercase">Fecha Fin</span>
                                                <input
                                                    type="date"
                                                    value={reminderSettings.msi_end_date || ""}
                                                    onChange={(e) => setReminderSettings({ ...reminderSettings, msi_end_date: e.target.value })}
                                                    className="w-full mt-1 flex h-10 rounded-md border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                                />
                                            </div>
                                        </div>
                                        <p className="text-[11px] text-muted-foreground mt-2">La promoción aplicará a las pólizas que cobren los próximos días basados en tu configuración, y solo si la fecha actual está dentro de este rango.</p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Asunto del Correo</label>
                                        <input
                                            value={reminderSettings.msi_email_subject || ""}
                                            onChange={(e) => setReminderSettings({ ...reminderSettings, msi_email_subject: e.target.value })}
                                            className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                            placeholder="Ej: Promoción de Pago a Meses -"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium flex items-center gap-2">
                                            <Type size={16} className="text-muted-foreground" />
                                            Cuerpo del Mensaje (Plantilla)
                                        </label>

                                        <RichTextEditor
                                            value={reminderSettings.msi_email_template || ""}
                                            onChange={(html) => setReminderSettings({ ...reminderSettings, msi_email_template: html })}
                                        />

                                        <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-1">
                                            <Code size={12} />
                                            Sugerencia: puedes usar variables como {`{{nombre}}, {{msi_opciones}}, {{fecha_pago}}, {{monto}}, {{poliza}}`}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "msi_history" && (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                <div className="flex items-center justify-between border-b border-border pb-2">
                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                        <History className="text-primary" size={20} />
                                        Mensajes Enviados (Promociones MSI)
                                    </h3>
                                    <button
                                        onClick={fetchMsiLogs}
                                        className="text-primary text-xs font-medium hover:underline flex items-center gap-1"
                                    >
                                        {isLoadingMsiLogs ? <Loader2 size={12} className="animate-spin" /> : <Clock size={12} />}
                                        Actualizar
                                    </button>
                                </div>

                                {isLoadingMsiLogs && msiLogs.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                        <Loader2 className="h-8 w-8 animate-spin mb-4" />
                                        <p>Cargando mensajes enviados...</p>
                                    </div>
                                ) : msiLogs.length === 0 ? (
                                    <div className="text-center py-12 bg-muted/20 rounded-lg border border-dashed border-border">
                                        <History className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                                        <p className="text-sm text-muted-foreground">No hay mensajes enviados todavía.</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto rounded-xl border border-border shadow-sm">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-muted/50 text-muted-foreground font-semibold uppercase text-[10px] tracking-wider">
                                                <tr>
                                                    <th className="px-4 py-3">Cliente</th>
                                                    <th className="px-4 py-3">Póliza</th>
                                                    <th className="px-4 py-3">Vencimiento Póliza</th>
                                                    <th className="px-4 py-3">Fecha de Envío</th>
                                                    <th className="px-4 py-3">Estado</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border">
                                                {msiLogs.map((log) => (
                                                    <tr key={log.id} className="hover:bg-muted/20 transition-colors">
                                                        <td className="px-4 py-3 font-medium text-foreground">
                                                            <div>{log.client_name}</div>
                                                            <div className="text-[10px] text-muted-foreground font-normal">{log.client_email}</div>
                                                        </td>
                                                        <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{log.policy_number || "S/N"}</td>
                                                        <td className="px-4 py-3 text-muted-foreground text-xs">{log.payment_limit || "N/A"}</td>
                                                        <td className="px-4 py-3 text-muted-foreground text-xs">{new Date(log.sent_at).toLocaleString()}</td>
                                                        <td className="px-4 py-3">
                                                            <span className={`capitalize font-bold text-[9px] px-2 py-0.5 rounded-full ${log.status === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                                                {log.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === "security" && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold border-b border-border pb-2">Seguridad del Tenant</h3>
                                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30 rounded-lg p-4 flex gap-3 text-amber-800 dark:text-amber-400">
                                    <ShieldAlert className="shrink-0" size={20} />
                                    <div className="text-xs">
                                        <p className="font-semibold">Límite de Sesiones Activas</p>
                                        <p className="mt-0.5">Tu organización tiene un límite de 3 usuarios concurrentes activos. Las sesiones inactivas se cerrarán automáticamente tras 2 horas.</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <button className="text-sm font-medium text-primary hover:underline">Cambiar Contraseña Maestra</button>
                                    <button className="text-sm font-medium text-primary hover:underline block">Gestionar Invitaciones de Agentes</button>
                                </div>
                            </div>
                        )}

                        {activeTab === "billing" && (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                <div className="flex items-center justify-between border-b border-border pb-2">
                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                        <Receipt className="text-primary" size={20} />
                                        Datos para Facturar
                                    </h3>
                                </div>

                                <div className="grid gap-6 sm:grid-cols-2">
                                    <div className="space-y-2 sm:col-span-2">
                                        <label className="text-sm font-medium">Razón Social</label>
                                        <input
                                            value={billingSettings.razon_social}
                                            onChange={(e) => setBillingSettings({ ...billingSettings, razon_social: e.target.value })}
                                            className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                            placeholder="Ej: Mi Empresa S.A. de C.V."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">RFC</label>
                                        <input
                                            value={billingSettings.rfc}
                                            onChange={(e) => setBillingSettings({ ...billingSettings, rfc: e.target.value })}
                                            className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all uppercase"
                                            placeholder="XXXX000000XXX"
                                            maxLength={13}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Teléfono</label>
                                        <input
                                            value={billingSettings.telefono}
                                            onChange={(e) => setBillingSettings({ ...billingSettings, telefono: e.target.value })}
                                            className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                            placeholder="10 dígitos"
                                        />
                                    </div>
                                    <div className="space-y-2 sm:col-span-2">
                                        <label className="text-sm font-medium">Régimen Fiscal</label>
                                        <select
                                            value={billingSettings.regimen_fiscal}
                                            onChange={(e) => setBillingSettings({ ...billingSettings, regimen_fiscal: e.target.value })}
                                            className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                        >
                                            <option value="">Selecciona un régimen...</option>
                                            {REGIMEN_FISCAL_OPTIONS.map((opt) => (
                                                <option key={opt.value} value={opt.value}>
                                                    {opt.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2 sm:col-span-2">
                                        <label className="text-sm font-medium">Domicilio</label>
                                        <input
                                            value={billingSettings.domicilio}
                                            onChange={(e) => setBillingSettings({ ...billingSettings, domicilio: e.target.value })}
                                            className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                            placeholder="Calle, Número, Colonia, Ciudad, Estado"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Código Postal</label>
                                        <input
                                            value={billingSettings.codigo_postal}
                                            onChange={(e) => setBillingSettings({ ...billingSettings, codigo_postal: e.target.value })}
                                            className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                            placeholder="Ej: 11000"
                                            maxLength={5}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "database" && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold border-b border-border pb-2">Mantenimiento de Datos</h3>
                                <p className="text-sm text-muted-foreground">Descarga copias de seguridad de tu base de datos o limpia registros antiguos.</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <button className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors text-left">
                                        <p className="font-medium text-sm">Exportar a Excel</p>
                                        <p className="text-xs text-muted-foreground">Resumen completo de clientes y pólizas</p>
                                    </button>
                                    <button className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors text-left">
                                        <p className="font-medium text-sm">Backup de Documentos</p>
                                        <p className="text-xs text-muted-foreground">Descargar expediente comprimido (.zip)</p>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab && (
                    <div className="fixed bottom-0 left-0 right-0 md:relative md:mt-6 bg-background/80 backdrop-blur-md border-t md:border-none p-4 md:p-0 z-10">
                        <div className="max-w-4xl mx-auto flex justify-end">
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-2.5 rounded-lg font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100"
                            >
                                {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                {isSaving ? "Guardando..." : "Guardar Preferencias"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
            {/* Modal de Confirmación MSI */}
            {isMsiConfirmationOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-background w-full max-w-md rounded-xl shadow-2xl overflow-hidden border border-border animate-in zoom-in-95">
                        <div className="flex items-center gap-3 p-4 border-b border-border bg-amber-500/10 text-amber-600">
                            <AlertCircle size={24} />
                            <h3 className="font-semibold text-lg">Confirmar Envío MSI</h3>
                        </div>
                        <div className="p-6 space-y-4 text-sm text-muted-foreground">
                            <p>¿Estás seguro de enviar promociones de <strong>Meses Sin Intereses (MSI)</strong> a los clientes con pólizas próximas a vencer?</p>
                            <p>Asegúrate de haber guardado previamente la configuración de la fecha límite y la plantilla de correo.</p>
                        </div>
                        <div className="p-4 border-t border-border bg-muted/20 flex justify-end gap-3">
                            <button
                                onClick={() => setIsMsiConfirmationOpen(false)}
                                className="px-4 py-2 text-sm font-medium rounded-md border border-border hover:bg-muted transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSendMsiPromotions}
                                className="px-4 py-2 text-sm font-medium rounded-md bg-amber-500 text-white hover:bg-amber-600 transition-colors"
                            >
                                Sí, enviar promociones
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
