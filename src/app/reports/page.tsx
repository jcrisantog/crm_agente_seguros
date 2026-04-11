import { TrendingUp, PieChart, BarChart3, Download } from "lucide-react";

export default function ReportsPage() {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Reportes de Negocio</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Analiza el rendimiento de tus ventas y pólizas.
                    </p>
                </div>
                <button className="h-9 inline-flex items-center justify-center rounded-md border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted/50 transition-colors">
                    <Download className="mr-2 h-4 w-4" />
                    Exportar Datos
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: "Primas Totales", value: "$420,500", trend: "+12%", icon: TrendingUp, color: "text-emerald-500" },
                    { label: "Pólizas Emitidas", value: "145", trend: "+5%", icon: PieChart, color: "text-blue-500" },
                    { label: "Crecimiento Mensual", value: "8.2%", trend: "+2.1%", icon: BarChart3, color: "text-amber-500" },
                ].map((stat, i) => (
                    <div key={i} className="bg-card border border-border shadow-sm rounded-xl p-6 border border-border">
                        <div className="flex items-center justify-between mb-4">
                            <stat.icon className={stat.color} size={20} />
                            <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">{stat.trend}</span>
                        </div>
                        <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                        <p className="text-2xl font-bold mt-1">{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="bg-card border border-border shadow-sm rounded-xl p-12 border border-border border-dashed flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <BarChart3 className="text-muted-foreground opacity-40" size={32} />
                </div>
                <h3 className="text-lg font-semibold">Gráficos Avanzados</h3>
                <p className="text-sm text-muted-foreground max-w-sm mt-2">
                    Estamos trabajando en integrar gráficos interactivos de última generación para tus reportes. Próximamente.
                </p>
            </div>
        </div>
    );
}
