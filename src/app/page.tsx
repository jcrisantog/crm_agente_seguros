import {
  ShieldCheck,
  Users,
  AlertCircle,
  TrendingUp,
  FolderSync,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { insforge } from "@/lib/insforge";

/**
 * Recupera y procesa todos los datos necesarios para el Dashboard principal.
 * Realiza múltiples consultas en paralelo a Insforge (KPIs, Pólizas Urgentes, Documentos Faltantes).
 * 
 * @returns {Promise<Object>} Datos formateados para las tarjetas de KPI y tablas de alertas.
 * @throws {Error} Si alguna de las consultas falla.
 */
async function getDashboardData() {
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);

  // 0. Fetch Settings to get thresholds
  const { data: settings } = await insforge.database
    .from("reminder_settings")
    .select("threshold_1")
    .limit(1)
    .maybeSingle();

  const alertThreshold = settings?.threshold_1 || 15;
  const alertLimitDate = new Date(today.getTime() + alertThreshold * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  // 1. Fetch KPIs with optimized column selection
  const results = await Promise.all([
    // Active Policies
    insforge.database.from("client_products").select("id", { count: "exact" }).eq("status", "Activa"),

    // New Clients (last 30 days)
    insforge.database.from("clients").select("id", { count: "exact" }).gte("created_at", thirtyDaysAgo.toISOString()),

    // Urgent Attention (Payment limit in next threshold days OR status 'Pendiente')
    insforge.database.from("client_products")
      .select("id, status, payment_limit, net_premium, moneda, policy_number, clients(full_name), products(name)")
      .or(`status.eq.Pendiente,payment_limit.lte.${alertLimitDate}`)
      .order("full_name", { ascending: true, referencedTable: "clients" })
      .order("payment_limit", { ascending: true })
      .limit(10),

    // Data for missing documents verification (Only for non-cancelled policies)
    insforge.database.from("client_products")
      .select(`
        id, 
        client_id, 
        status,
        payment_limit,
        net_premium,
        moneda,
        policy_number,
        clients(full_name), 
        products(name, required_docs_schema),
        client_documents(name)
      `)
      .neq("status", "Cancelada")
  ]);

  const errors = results.filter(r => r.error);
  if (errors.length > 0) {
    console.error("Dashboard fetch errors:", errors.map(e => e.error));
    throw new Error("Error al cargar los datos del tablero.");
  }

  const [
    { data: activePolicies },
    { data: newClientsCount },
    { data: urgentPolicies },
    { data: missingDocsInfo }
  ] = results;

  // Process Missing Documents
  const missingDocsMap = new Map();
  const clientsWithMissingDocs = (missingDocsInfo || [])
    .map((policy: any) => {
      const product = Array.isArray(policy.products) ? policy.products[0] : policy.products;
      const client = Array.isArray(policy.clients) ? policy.clients[0] : policy.clients;
      const docs = policy.client_documents || [];

      const required = product?.required_docs_schema || [];
      const uploaded = docs.map((d: any) => d.name) || [];
      const missing = required.filter((req: string) => !uploaded.includes(req));

      // Save count for urgent table
      missingDocsMap.set(policy.id, missing.length);

      return {
        id: policy.id,
        clientId: policy.client_id,
        clientName: client?.full_name,
        productName: product?.name,
        missing: missing,
        status: policy.status,
        payment_limit: policy.payment_limit,
        net_premium: policy.net_premium,
        moneda: policy.moneda,
        policy_number: policy.policy_number
      };
    })
    .filter(item => item.missing.length > 0);

  // Process and merge urgent policies
  const combinedUrgentPoliciesMap = new Map();

  // 1. Payment urgent policies
  (urgentPolicies || []).forEach((policy: any) => {
    const client = Array.isArray(policy.clients) ? policy.clients[0] : policy.clients;
    const product = Array.isArray(policy.products) ? policy.products[0] : policy.products;
    combinedUrgentPoliciesMap.set(policy.id, {
      ...policy,
      clientName: client?.full_name,
      productName: product?.name,
      missingDocsCount: missingDocsMap.get(policy.id) || 0
    });
  });

  // 2. Missing docs policies
  clientsWithMissingDocs.forEach((missingDocPolicy: any) => {
    if (!combinedUrgentPoliciesMap.has(missingDocPolicy.id)) {
      combinedUrgentPoliciesMap.set(missingDocPolicy.id, {
        id: missingDocPolicy.id,
        status: missingDocPolicy.status,
        payment_limit: missingDocPolicy.payment_limit,
        net_premium: missingDocPolicy.net_premium,
        moneda: missingDocPolicy.moneda,
        policy_number: missingDocPolicy.policy_number,
        clientName: missingDocPolicy.clientName,
        productName: missingDocPolicy.productName,
        missingDocsCount: missingDocPolicy.missing.length
      });
    }
  });

  const finalUrgentPolicies = Array.from(combinedUrgentPoliciesMap.values()).sort((a: any, b: any) => {
    const dateA = a.payment_limit ? new Date(a.payment_limit).getTime() : Infinity;
    const dateB = b.payment_limit ? new Date(b.payment_limit).getTime() : Infinity;
    return dateA - dateB;
  });

  return {
    activePoliciesCount: activePolicies?.length || 0,
    newClientsCount: newClientsCount?.length || 0,
    urgentCount: finalUrgentPolicies.length, // total items in the urgent table
    urgentPolicies: finalUrgentPolicies,
    clientsWithMissingDocs: clientsWithMissingDocs.slice(0, 5) // for the right-side list
  };
}

export const dynamic = "force-dynamic";

export default async function Home() {
  const data = await getDashboardData();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header section */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bienvenido de nuevo</h1>
          <p className="text-muted-foreground mt-1 text-lg">Aquí tienes el resumen de tu cartera al día de hoy.</p>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium">
            {new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          <p className="text-xs text-muted-foreground">Última actualización: hace un momento</p>
        </div>
      </div>

      {/* KPIs Grid */}
      <div className="grid gap-4 md:grid-cols-3">

        <div className="bg-card border border-border shadow-sm rounded-xl p-6 flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">Pólizas Activas</h3>
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-bold">{data.activePoliciesCount.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <TrendingUp className="h-3 w-3 text-emerald-500" />
            <span className="text-emerald-500 font-medium">+5%</span> este mes
          </p>
        </div>

        <div className="bg-card border border-border shadow-sm rounded-xl p-6 flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">Nuevos Clientes</h3>
            <Users className="h-4 w-4 text-primary" />
          </div>
          <div className="text-3xl font-bold">{data.newClientsCount}</div>
          <p className="text-xs text-muted-foreground">Registrados en los últimos 30 días</p>
        </div>

        <div className={`bg-card border border-border shadow-sm rounded-xl p-6 flex flex-col space-y-2 border-emerald-500/20 ${data.urgentPolicies.length > 0 ? 'bg-amber-500/5' : ''}`}>
          <div className="flex items-center justify-between">
            <h3 className={`text-sm font-medium ${data.urgentPolicies.length > 0 ? 'text-amber-700 dark:text-amber-400' : 'text-muted-foreground'}`}>Atención Urgente</h3>
            <AlertCircle className={`h-4 w-4 ${data.urgentPolicies.length > 0 ? 'text-amber-600' : 'text-muted-foreground/30'}`} />
          </div>
          <div className={`text-3xl font-bold ${data.urgentPolicies.length > 0 ? 'text-amber-700 dark:text-amber-400' : 'text-foreground'}`}>
            {data.urgentCount}
          </div>
          <p className="text-xs text-muted-foreground">Trámites o cobranza pendiente</p>
        </div>

      </div>

      {/* Action Required Lists */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-7 mt-8">

        {/* Urgent Attention Table */}
        <div className="col-span-1 lg:col-span-7 bg-card border border-border shadow-sm rounded-xl p-6 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold tracking-tight">Atención Urgente</h2>
            <Link href="/clients" className="text-sm text-primary hover:underline flex items-center gap-1">
              Ver todos <ArrowRight size={14} />
            </Link>
          </div>

          <div className="overflow-x-auto flex-1">
            {data.urgentPolicies.length > 0 ? (
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/30 border-b border-border">
                  <tr>
                    <th className="px-4 py-3 font-medium">Cliente</th>
                    <th className="px-4 py-3 font-medium">Fecha de Pago</th>
                    <th className="px-4 py-3 font-medium text-right">Monto</th>
                    <th className="px-4 py-3 font-medium text-center">Docs Faltantes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.urgentPolicies.map((policy: any) => (
                    <tr key={policy.id} className="hover:bg-muted/10 transition-colors">
                      <td className="px-4 py-4">
                        <div className="font-semibold text-foreground">{policy.clientName || 'S/N'}</div>
                        <div className="text-xs text-muted-foreground">{policy.productName}</div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${policy.status === 'Pendiente' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900' : 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-900'}`}>
                          {policy.status === 'Pendiente' ? 'Vencido' : policy.payment_limit?.split('T')[0].split('-').reverse().join('/') || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right font-medium text-emerald-600 dark:text-emerald-400">
                        ${Number(policy.net_premium || 0).toLocaleString()} {policy.moneda || 'MXN'}
                      </td>
                      <td className="px-4 py-4 text-center">
                        {policy.missingDocsCount > 0 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400 text-xs font-bold ring-1 ring-rose-300 dark:ring-rose-800">
                            {policy.missingDocsCount}
                          </span>
                        ) : (
                          <span className="text-muted-foreground/50">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-12 flex flex-col items-center justify-center h-full text-muted-foreground">
                <ShieldCheck className="mx-auto h-10 w-10 text-emerald-500/30 mb-3" />
                <p className="text-base font-medium text-foreground">Todo al día</p>
                <p className="text-sm">No hay clientes requiriendo atención urgente en este momento.</p>
              </div>
            )}
          </div>
        </div>

        {/* Missing Documents List - Oculto a petición del usuario */}
        {/* 
        <div className="col-span-1 lg:col-span-3 bg-card border border-border shadow-sm rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold tracking-tight">Documentación Faltante</h2>
          </div>

          <div className="space-y-4">
            {data.clientsWithMissingDocs.length > 0 ? (
              data.clientsWithMissingDocs.map((item: any) => (
                <Link key={item.id} href={`/clients/${item.clientId}/documents?policyId=${item.id}`} className="block group">
                  <div className="flex flex-col p-4 rounded-lg bg-muted/10 border border-border/50 group-hover:bg-muted/30 group-hover:border-primary/30 transition-all gap-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-sm text-foreground">{item.clientName}</h4>
                        <p className="text-xs text-muted-foreground">{item.productName}</p>
                      </div>
                      <FolderSync size={16} className="text-amber-500" />
                    </div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900 px-2 py-0.5 rounded-md">
                        Faltan {item.missing.length} documentos
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {item.missing.slice(0, 3).map((doc: string) => (
                        <span key={doc} className="px-2 py-1 bg-background text-muted-foreground rounded-md border border-border shadow-sm">
                          {doc.length > 20 ? doc.substring(0, 20) + '...' : doc}
                        </span>
                      ))}
                      {item.missing.length > 3 && (
                        <span className="px-2 py-1 bg-muted text-muted-foreground rounded-md font-medium">
                          +{item.missing.length - 3} más
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <ShieldCheck className="mx-auto h-8 w-8 text-emerald-500/30 mb-2" />
                <p className="text-sm font-medium">Todos los expedientes están al día.</p>
              </div>
            )}
          </div>
        </div>
        */}

      </div>

    </div>
  );
}


