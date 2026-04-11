"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, ShieldCheck, User, Users, CreditCard, Plus, Trash2, X } from "lucide-react";
import Link from "next/link";
import { insforge, ensureValidSession } from "@/lib/insforge";
import { getTodaysExchangeRates, ExchangeRates } from "@/lib/exchangeRates";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

export default function EditPolicyPage({ params }: { params: Promise<{ id: string, policyId: string }> }) {
    const resolvedParams = use(params);
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [clientName, setClientName] = useState("Cargando...");
    const [products, setProducts] = useState<any[]>([]);
    const [exchangeRates, setExchangeRates] = useState<ExchangeRates | null>(null);

    // UI State
    const [activeTab, setActiveTab] = useState("poliza");
    const [isBeneficiaryModalOpen, setIsBeneficiaryModalOpen] = useState(false);
    const [isCardModalOpen, setIsCardModalOpen] = useState(false);

    // Form States
    const [formData, setFormData] = useState({
        product_id: "",
        insurer: "",
        policy_number: "",
        solicitud: "",
        issued_date: "",
        status: "Activa",
        coverage_type: "",
        vehicle_type: "",
        vehicle_brand: "",
        vehicle_model: "",
        vehicle_plates: "",
        vehicle_serial: "",
        vehicle_motor: "",
        net_premium: "", // Prima Anual
        moneda: "UDI",
        frecuencia_pago: "Anual",
        prima_por_periodo: "",
        comision_por_periodo: "",
        meses_sin_intereses: "",
        prima_mnx: "",
        payment_method: "",
        payment_limit: "",
        tipo_de_cambio: "1",
        exchange_rate_info: "",
    });

    const [contratante, setContratante] = useState({
        nombre: "",
        rfc: "",
        direccion: "",
        telefono_casa: "",
        celular: "",
        telefono_oficina: "",
        email: ""
    });

    const [beneficiarios, setBeneficiarios] = useState<any[]>([]);
    const [tarjetas, setTarjetas] = useState<any[]>([]);

    // Modal temp states
    const [currentBeneficiary, setCurrentBeneficiary] = useState({ nombre: "", relacion: "", tipo: "ORDINARIO", porcentaje: "" });
    const [currentCard, setCurrentCard] = useState({ no_tarjeta: "", banco: "", tipo_tarjeta: "Crédito", is_main: false });

    useEffect(() => {
        async function loadData() {
            setIsLoading(true);
            setError(null);
            try {
                const [clientRes, productsRes, policyRes] = await Promise.all([
                    insforge.database.from("clients").select("full_name").eq("id", resolvedParams.id).single(),
                    insforge.database.from("products").select("id, name").order("name"),
                    insforge.database.from("client_products").select("*").eq("id", resolvedParams.policyId).single()
                ]);

                if (clientRes.error) console.warn("Error fetching client:", clientRes.error);
                if (productsRes.error) console.warn("Error fetching products:", productsRes.error);
                if (policyRes.error) {
                    setError("No se pudo encontrar la póliza o no tienes permisos.");
                    return;
                }

                if (clientRes.data) setClientName(clientRes.data.full_name);
                if (productsRes.data) setProducts(productsRes.data);

                if (policyRes.data) {
                    const data = policyRes.data;

                    const formatDate = (dateStr: string | null) => {
                        if (!dateStr) return "";
                        try {
                            const d = new Date(dateStr);
                            if (isNaN(d.getTime())) return "";
                            return d.toISOString().split('T')[0];
                        } catch {
                            return "";
                        }
                    };

                    setFormData({
                        product_id: data.product_id || "",
                        insurer: data.insurer || "",
                        policy_number: data.policy_number || "",
                        solicitud: data.solicitud || "",
                        issued_date: formatDate(data.issued_date),
                        status: data.status || "Activa",
                        coverage_type: data.coverage_type || "",
                        vehicle_type: data.vehicle_type || "",
                        vehicle_brand: data.vehicle_brand || "",
                        vehicle_model: data.vehicle_model || "",
                        vehicle_plates: data.vehicle_plates || "",
                        vehicle_serial: data.vehicle_serial || "",
                        vehicle_motor: data.vehicle_motor || "",
                        net_premium: data.net_premium?.toString() || "",
                        moneda: data.moneda || "UDI",
                        frecuencia_pago: data.frecuencia_pago || "Anual",
                        prima_por_periodo: data.prima_por_periodo?.toString() || "",
                        comision_por_periodo: data.comision_por_periodo?.toString() || "",
                        meses_sin_intereses: data.meses_sin_intereses || "",
                        prima_mnx: data.prima_mnx?.toString() || "",
                        payment_method: data.payment_method || "",
                        payment_limit: formatDate(data.payment_limit),
                        tipo_de_cambio: data.tipo_de_cambio?.toString() || "1",
                        exchange_rate_info: data.exchange_rate_info || "",
                    });

                    // Parse JSON fields
                    if (data.contratante && Object.keys(data.contratante).length > 0) setContratante(data.contratante);
                    if (Array.isArray(data.beneficiarios)) setBeneficiarios(data.beneficiarios);
                    if (Array.isArray(data.tarjetas)) setTarjetas(data.tarjetas);
                }

                const rates = await getTodaysExchangeRates();
                if (rates) setExchangeRates(rates);
            } catch (err: any) {
                console.error("Critical error loading policy data:", err);
                setError("Ocurrió un error crítico al cargar la información.");
            } finally {
                setIsLoading(false);
            }
        }
        loadData();
    }, [resolvedParams.id, resolvedParams.policyId]);

    // Live calculations
    useEffect(() => {
        const primaAnual = parseFloat(formData.net_premium) || 0;
        const exchangeRate = parseFloat(formData.tipo_de_cambio) || 1;
        const frec = formData.frecuencia_pago;
        let divisor = 1;
        let feeMultiplier = 0;

        if (frec === "Anual") { divisor = 1; feeMultiplier = 0; }
        else if (frec === "Semestral") { divisor = 2; feeMultiplier = 0.04; }
        else if (frec === "Trimestral") { divisor = 4; feeMultiplier = 0.06; }
        else if (frec === "Mensual") { divisor = 12; feeMultiplier = 0.08; }

        const comision = (primaAnual * feeMultiplier) / divisor;
        const primaPeriodo = (primaAnual / divisor) + comision;
        const primaMxn = primaPeriodo * exchangeRate;

        setFormData(prev => ({
            ...prev,
            comision_por_periodo: primaAnual ? comision.toFixed(2) : "",
            prima_por_periodo: primaAnual ? primaPeriodo.toFixed(2) : "",
            prima_mnx: primaAnual ? primaMxn.toFixed(2) : ""
        }));
    }, [formData.net_premium, formData.frecuencia_pago, formData.tipo_de_cambio]);

    // Auto-update exchange rate based on selection
    useEffect(() => {
        if (!exchangeRates) return;

        let rate = "1";
        if (formData.moneda === "UDI") rate = exchangeRates.udi.toString();
        else if (formData.moneda === "USD") rate = exchangeRates.dolar.toString();
        else rate = "1"; // MXN by default

        setFormData(prev => ({ ...prev, tipo_de_cambio: rate }));
    }, [formData.moneda, exchangeRates]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };



    const handleContratanteChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setContratante((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const addBeneficiary = () => {
        if (!currentBeneficiary.nombre || !currentBeneficiary.porcentaje) {
            toast.error("El nombre y el porcentaje son obligatorios.");
            return;
        }
        setBeneficiarios(prev => [...prev, currentBeneficiary]);
        setCurrentBeneficiary({ nombre: "", relacion: "", tipo: "ORDINARIO", porcentaje: "" });
        setIsBeneficiaryModalOpen(false);
    };

    const addCard = () => {
        if (!currentCard.no_tarjeta || !currentCard.banco) {
            toast.error("El número de tarjeta y el banco son obligatorios.");
            return;
        }
        let newCards = [...tarjetas];
        if (currentCard.is_main) {
            newCards = newCards.map(c => ({ ...c, is_main: false }));
        }
        if (newCards.length === 0) currentCard.is_main = true; // Auto-select first
        setTarjetas([...newCards, currentCard]);
        setCurrentCard({ no_tarjeta: "", banco: "", tipo_tarjeta: "Crédito", is_main: false });
        setIsCardModalOpen(false);
    };

    const removeBeneficiary = (index: number) => setBeneficiarios(prev => prev.filter((_, i) => i !== index));
    const removeCard = (index: number) => setTarjetas(prev => prev.filter((_, i) => i !== index));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const session = await ensureValidSession();
            if (!session) {
                toast.error("Tu sesión ha expirado por inactividad. Copia tus datos, recarga la página e inicia sesión nuevamente para no perderlos.", {
                    duration: 8000,
                });
                setIsSubmitting(false);
                return;
            }

            const { error: insforgeError } = await insforge.database.from("client_products").update({
                product_id: formData.product_id ? formData.product_id : null,
                insurer: formData.insurer,
                policy_number: formData.policy_number,
                solicitud: formData.solicitud,
                issued_date: formData.issued_date || null,
                status: formData.status,
                coverage_type: formData.coverage_type,
                vehicle_type: formData.vehicle_type,
                vehicle_brand: formData.vehicle_brand,
                vehicle_model: formData.vehicle_model,
                vehicle_plates: formData.vehicle_plates,
                vehicle_serial: formData.vehicle_serial,
                vehicle_motor: formData.vehicle_motor,
                net_premium: formData.net_premium ? parseFloat(formData.net_premium) : null,
                moneda: formData.moneda,
                frecuencia_pago: formData.frecuencia_pago,
                prima_por_periodo: formData.prima_por_periodo ? parseFloat(formData.prima_por_periodo) : null,
                comision_por_periodo: formData.comision_por_periodo ? parseFloat(formData.comision_por_periodo) : null,
                meses_sin_intereses: formData.meses_sin_intereses,
                prima_mnx: formData.prima_mnx ? parseFloat(formData.prima_mnx) : null,
                tipo_de_cambio: formData.tipo_de_cambio ? parseFloat(formData.tipo_de_cambio) : null,
                payment_method: formData.payment_method,
                payment_limit: formData.payment_limit || null,
                contratante: contratante,
                beneficiarios: beneficiarios,
                tarjetas: tarjetas
            }).eq("id", resolvedParams.policyId);

            if (insforgeError) throw insforgeError;

            toast.success("Póliza actualizada correctamente");
            router.push(`/clients/${resolvedParams.id}`);
            router.refresh();

        } catch (error: any) {
            console.error("Error updating policy:", error);
            if (error.message && error.message.includes("JWT expired")) {
                toast.error("Tu sesión ha expirado. Por favor, recarga la página e inicia sesión nuevamente.", { duration: 6000 });
            } else {
                toast.error("Error al actualizar la póliza. Revisa la consola.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
                <p className="text-muted-foreground">Cargando información de la póliza...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto p-12 text-center space-y-6">
                <div className="bg-destructive/10 text-destructive p-6 rounded-xl border border-destructive/20 inline-block">
                    <p className="font-semibold">{error}</p>
                </div>
                <div>
                    <Link href={`/clients/${resolvedParams.id}`}>
                        <Button variant="ghost" className="mx-auto">
                            <ArrowLeft className="mr-2" size={16} /> Volver al cliente
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    const tabs = [
        { id: "poliza", label: "Póliza", icon: ShieldCheck },
        { id: "contratante", label: "Contratante", icon: User },
        { id: "beneficiarios", label: "Beneficiarios", icon: Users },
        { id: "tarjetas", label: "Tarjetas Vigentes", icon: CreditCard },
    ];

    return (
        <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12 relative">
            <div className="flex items-center gap-4">
                <Link href={`/clients/${resolvedParams.id}`}>
                    <Button variant="ghost" size="icon">
                        <ArrowLeft size={20} className="text-muted-foreground" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Editar Registro de Póliza</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Cliente asociado: <strong className="text-foreground">{clientName}</strong>
                    </p>
                </div>
            </div>

            <div className="bg-card border border-border shadow-sm rounded-xl overflow-hidden p-6 md:p-8">
                {/* MENU FICHAS */}
                <div className="flex space-x-2 border-b border-border/60 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all whitespace-nowrap
                                    ${activeTab === tab.id
                                        ? 'bg-primary/10 text-primary border-b-2 border-primary'
                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
                            >
                                <Icon size={16} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                <form onSubmit={handleSubmit}>
                    {/* FICHA 1: PÓLIZA */}
                    {activeTab === "poliza" && (
                        <div className="space-y-8 animate-in fade-in">
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-primary">Información General</h3>
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    <Select label="Tipo de Seguro" name="product_id" value={formData.product_id} onChange={handleChange} options={[{ value: "", label: "-- Seleccionar --" }, ...products.map(p => ({ value: p.id, label: p.name }))]} />
                                    <Input label="Aseguradora *" required name="insurer" value={formData.insurer} onChange={handleChange} placeholder="Ej. GNP" />
                                    <Input label="No. de Póliza" name="policy_number" value={formData.policy_number} onChange={handleChange} />
                                    <Input label="Solicitud" name="solicitud" value={formData.solicitud} onChange={handleChange} />
                                    <Input label="Inicio de Vigencia" type="date" name="issued_date" value={formData.issued_date} onChange={handleChange} />
                                    <Select label="Estatus" name="status" value={formData.status} onChange={handleChange} options={[{ value: "Activa", label: "Activa" }, { value: "Pendiente", label: "Pendiente" }, { value: "Cancelada", label: "Cancelada" }]} />
                                    <Input label="Tipo de Cobertura" name="coverage_type" value={formData.coverage_type} onChange={handleChange} />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-primary">Primas y Cálculos Financieros</h3>
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 p-5 rounded-lg border border-primary/20 bg-primary/5">
                                    <Select label="Moneda" name="moneda" value={formData.moneda} onChange={handleChange} options={[{ value: "UDI", label: "UDI" }, { value: "MXN", label: "MXN" }, { value: "USD", label: "USD" }]} />
                                    <Input label="Prima Bruta Anual" type="number" step="0.01" name="net_premium" value={formData.net_premium} onChange={handleChange} placeholder="Ej. 10000" />
                                    <Select label="Frecuencia de Pago" name="frecuencia_pago" value={formData.frecuencia_pago} onChange={handleChange} options={[{ value: "Anual", label: "Anual" }, { value: "Semestral", label: "Semestral" }, { value: "Trimestral", label: "Trimestral" }, { value: "Mensual", label: "Mensual" }]} />
                                    <Input label="Tipo de Cambio" type="number" step="0.0001" name="tipo_de_cambio" value={formData.tipo_de_cambio || ""} readOnly className="bg-muted pointer-events-none opacity-80" />
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2 mt-4">
                                    <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                                        <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Prima por Periodo en Divisa</p>
                                        <p className="text-2xl font-bold text-primary">${formData.prima_por_periodo || "0.00"}</p>
                                    </div>
                                    <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                                        <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Prima Por Periodo en MXN</p>
                                        <p className="text-2xl font-bold text-green-600">${formData.prima_mnx || "0.00"}</p>
                                    </div>
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-4">
                                    <Input label="Meses sin intereses" name="meses_sin_intereses" value={formData.meses_sin_intereses} onChange={handleChange} placeholder="Ej. BANAMEX 12 MONTHS" />
                                    <Input label="Conducto de Cobro" name="payment_method" value={formData.payment_method} onChange={handleChange} placeholder="Ej. Tarjeta" />
                                    <Input label="Pagado Hasta" type="date" name="payment_limit" value={formData.payment_limit} onChange={handleChange} />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-primary">Datos del Vehículo (Si Aplica)</h3>
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    <Input label="Tipo de Vehículo" name="vehicle_type" value={formData.vehicle_type} onChange={handleChange} />
                                    <Input label="Marca" name="vehicle_brand" value={formData.vehicle_brand} onChange={handleChange} />
                                    <Input label="Modelo" name="vehicle_model" value={formData.vehicle_model} onChange={handleChange} />
                                    <Input label="Placas" name="vehicle_plates" value={formData.vehicle_plates} onChange={handleChange} />
                                    <Input label="No. de Serie / VIN" name="vehicle_serial" value={formData.vehicle_serial} onChange={handleChange} />
                                    <Input label="Motor" name="vehicle_motor" value={formData.vehicle_motor} onChange={handleChange} />
                                </div>
                            </div>
                        </div>
                    )}



                    {/* FICHA 3: CONTRATANTE */}
                    {activeTab === "contratante" && (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 animate-in fade-in">
                            <Input label="Contratante (Nombre)" name="nombre" value={contratante.nombre} onChange={handleContratanteChange} />
                            <Input label="ID Fiscal / RFC" name="rfc" value={contratante.rfc} onChange={handleContratanteChange} />
                            <Input label="E-mail" type="email" name="email" value={contratante.email} onChange={handleContratanteChange} />
                            <div className="col-span-full">
                                <Input label="Dirección Completa" name="direccion" value={contratante.direccion} onChange={handleContratanteChange} className="w-full" />
                            </div>
                            <Input label="Teléfono Casa" name="telefono_casa" value={contratante.telefono_casa} onChange={handleContratanteChange} />
                            <Input label="Teléfono Oficina" name="telefono_oficina" value={contratante.telefono_oficina} onChange={handleContratanteChange} />
                            <Input label="Celular" name="celular" value={contratante.celular} onChange={handleContratanteChange} />
                        </div>
                    )}

                    {/* FICHA 4: BENEFICIARIOS */}
                    {activeTab === "beneficiarios" && (
                        <div className="space-y-6 animate-in fade-in">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-primary">Lista de Beneficiarios</h3>
                                <Button type="button" onClick={() => setIsBeneficiaryModalOpen(true)} className="flex items-center gap-2">
                                    <Plus size={16} /> Añadir Beneficiario
                                </Button>
                            </div>

                            {beneficiarios.length === 0 ? (
                                <div className="text-center py-10 bg-muted/20 border border-dashed rounded-lg">
                                    <p className="text-muted-foreground">No se han registrado beneficiarios. Haz clic en añadir.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto border border-border rounded-lg">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs uppercase bg-muted text-muted-foreground">
                                            <tr>
                                                <th className="px-6 py-3">Nombre</th>
                                                <th className="px-6 py-3">Relación</th>
                                                <th className="px-6 py-3">Tipo</th>
                                                <th className="px-6 py-3">%</th>
                                                <th className="px-6 py-3 text-right">Acción</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {beneficiarios.map((b, idx) => (
                                                <tr key={idx} className="border-b border-border/50 bg-background hover:bg-muted/30">
                                                    <td className="px-6 py-4 font-medium">{b.nombre}</td>
                                                    <td className="px-6 py-4">{b.relacion}</td>
                                                    <td className="px-6 py-4">{b.tipo}</td>
                                                    <td className="px-6 py-4">{b.porcentaje}%</td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button type="button" onClick={() => removeBeneficiary(idx)} className="text-red-500 hover:text-red-700 p-2">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* FICHA 5: TARJETAS */}
                    {activeTab === "tarjetas" && (
                        <div className="space-y-6 animate-in fade-in">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-primary">Tarjetas Vigentes</h3>
                                <Button type="button" onClick={() => setIsCardModalOpen(true)} className="flex items-center gap-2">
                                    <Plus size={16} /> Añadir Tarjeta
                                </Button>
                            </div>

                            {tarjetas.length === 0 ? (
                                <div className="text-center py-10 bg-muted/20 border border-dashed rounded-lg">
                                    <p className="text-muted-foreground">No hay tarjetas vigentes registradas.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto border border-border rounded-lg">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs uppercase bg-muted text-muted-foreground">
                                            <tr>
                                                <th className="px-6 py-3">No. Tarjeta</th>
                                                <th className="px-6 py-3">Banco</th>
                                                <th className="px-6 py-3">Tipo</th>
                                                <th className="px-6 py-3 text-center">Principal</th>
                                                <th className="px-6 py-3 text-right">Acción</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {tarjetas.map((t, idx) => (
                                                <tr key={idx} className="border-b border-border/50 bg-background hover:bg-muted/30">
                                                    <td className="px-6 py-4 font-medium">{t.no_tarjeta}</td>
                                                    <td className="px-6 py-4">{t.banco}</td>
                                                    <td className="px-6 py-4">{t.tipo_tarjeta}</td>
                                                    <td className="px-6 py-4 text-center">
                                                        <input
                                                            type="radio"
                                                            name="main_card"
                                                            checked={!!t.is_main}
                                                            onChange={() => {
                                                                setTarjetas(tarjetas.map((card, i) => ({ ...card, is_main: i === idx })));
                                                            }}
                                                            className="w-4 h-4 text-primary bg-background border-border"
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button type="button" onClick={() => removeCard(idx)} className="text-red-500 hover:text-red-700 p-2">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}


                    {/* MAIN SUBMIT BUTTONS */}
                    <div className="flex items-center justify-end gap-4 pt-8 mt-10 border-t border-border">
                        <Link href={`/clients/${resolvedParams.id}`}>
                            <Button variant="ghost" type="button">Cancelar</Button>
                        </Link>
                        <Button type="submit" isLoading={isSubmitting} className="px-8 py-6 text-base font-semibold">
                            {!isSubmitting && <Save className="mr-2 h-5 w-5" />} Guardar Toda la Información
                        </Button>
                    </div>
                </form>
            </div>

            {/* MODALES OVERLAYS */}
            {isBeneficiaryModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-background w-full max-w-lg rounded-xl shadow-2xl overflow-hidden border border-border animate-in zoom-in-95">
                        <div className="flex items-center justify-between p-4 border-b border-border">
                            <h3 className="font-semibold text-lg">Añadir Beneficiario</h3>
                            <button onClick={() => setIsBeneficiaryModalOpen(false)} className="text-muted-foreground hover:text-foreground p-1"><X size={20} /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <Input label="Nombre del Beneficiario *" value={currentBeneficiary.nombre} onChange={(e) => setCurrentBeneficiary({ ...currentBeneficiary, nombre: e.target.value })} placeholder="Nombre completo" />
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="Relación" value={currentBeneficiary.relacion} onChange={(e) => setCurrentBeneficiary({ ...currentBeneficiary, relacion: e.target.value })} placeholder="Ej. Esposa, Hijo" />
                                <Select label="Tipo" value={currentBeneficiary.tipo} onChange={(e) => setCurrentBeneficiary({ ...currentBeneficiary, tipo: e.target.value })} options={[{ value: "ORDINARIO", label: "Ordinario" }, { value: "CONTINGENTE", label: "Contingente" }]} />
                            </div>
                            <Input label="Porcentaje (%) *" type="number" step="0.1" value={currentBeneficiary.porcentaje} onChange={(e) => setCurrentBeneficiary({ ...currentBeneficiary, porcentaje: e.target.value })} placeholder="Ej. 100" />
                        </div>
                        <div className="p-4 border-t border-border bg-muted/20 flex justify-end gap-3">
                            <Button variant="outline" type="button" onClick={() => setIsBeneficiaryModalOpen(false)}>Cancelar</Button>
                            <Button type="button" onClick={addBeneficiary}>Guardar Beneficiario</Button>
                        </div>
                    </div>
                </div>
            )}

            {isCardModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-background w-full max-w-lg rounded-xl shadow-2xl overflow-hidden border border-border animate-in zoom-in-95">
                        <div className="flex items-center justify-between p-4 border-b border-border">
                            <h3 className="font-semibold text-lg">Añadir Tarjeta</h3>
                            <button onClick={() => setIsCardModalOpen(false)} className="text-muted-foreground hover:text-foreground p-1"><X size={20} /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <Input label="No. de Tarjeta *" value={currentCard.no_tarjeta} onChange={(e) => setCurrentCard({ ...currentCard, no_tarjeta: e.target.value })} placeholder="**** **** **** 1234" />
                            <Input label="Banco *" value={currentCard.banco} onChange={(e) => setCurrentCard({ ...currentCard, banco: e.target.value })} placeholder="Ej. BBVA, Santander" />
                            <Select label="Tipo de Tarjeta" value={currentCard.tipo_tarjeta} onChange={(e) => setCurrentCard({ ...currentCard, tipo_tarjeta: e.target.value })} options={[{ value: "Crédito", label: "Crédito" }, { value: "Débito", label: "Débito" }]} />
                            <label className="flex items-center space-x-2 text-sm font-medium mt-2">
                                <input
                                    type="checkbox"
                                    checked={currentCard.is_main}
                                    onChange={(e) => setCurrentCard({ ...currentCard, is_main: e.target.checked })}
                                    className="form-checkbox text-primary border-border focus:ring-primary h-4 w-4"
                                />
                                <span>Definir como tarjeta principal</span>
                            </label>
                        </div>
                        <div className="p-4 border-t border-border bg-muted/20 flex justify-end gap-3">
                            <Button variant="outline" type="button" onClick={() => setIsCardModalOpen(false)}>Cancelar</Button>
                            <Button type="button" onClick={addCard}>Guardar Tarjeta</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
