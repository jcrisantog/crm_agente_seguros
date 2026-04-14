"use client";

import { useState } from "react";
import { Search, Plus, ShieldCheck, Trash2, Loader2, AlertTriangle, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { insforge } from "@/lib/insforge";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Product {
    id: string;
    name: string;
    description: string;
    required_docs_schema: string[];
}

export function ProductsList({ initialProducts }: { initialProducts: Product[] }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<{id: string, name: string} | null>(null);
    const router = useRouter();

    const filteredProducts = products.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleDelete = async () => {
        if (!confirmDelete) return;
        
        const { id, name } = confirmDelete;
        setConfirmDelete(null); // Cerrar modal inmediatamente
        setDeletingId(id);
        
        try {
            const { error } = await insforge.database
                .from("products")
                .delete()
                .eq("id", id);

            if (error) {
                // Código de error 23503 es violación de restricción de clave foránea en Postgres
                if (error.code === "23503") {
                    toast.error(`No se puede eliminar "${name}" porque está asignado a pólizas de clientes.`);
                } else {
                    toast.error("Error al eliminar el producto: " + error.message);
                }
                return;
            }

            toast.success("Producto eliminado correctamente");
            setProducts(prev => prev.filter(p => p.id !== id));
            router.refresh();
        } catch (err) {
            console.error("Delete error:", err);
            toast.error("Ocurrió un error inesperado al intentar borrar.");
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Catálogo de Productos</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Tipos de seguro base y configuración de documentos requeridos.
                    </p>
                </div>

                <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Buscar producto..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="h-10 w-full xs:w-[180px] sm:w-[250px] rounded-md border border-border bg-background px-9 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary transition-all sm:focus:w-[300px]"
                        />
                    </div>
                    <Link href="/products/new" className="w-full xs:w-auto">
                        <Button className="h-10 w-full">
                            <Plus className="mr-2 h-4 w-4" />
                            <span className="xs:hidden sm:inline">Nuevo Producto</span>
                            <span className="hidden xs:inline sm:hidden">Nuevo</span>
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                        <div key={product.id} className="bg-card border border-border shadow-sm rounded-xl p-6 group hover:border-primary/50 transition-colors flex flex-col">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                    <ShieldCheck size={20} />
                                </div>
                                <div className="flex gap-2">
                                    <Link href={`/products/${product.id}/edit`}>
                                        <Button variant="outline" size="sm" className="opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity text-[10px] h-7 px-2 sm:h-8 sm:px-3 sm:text-xs">
                                            Configurar
                                        </Button>
                                    </Link>
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={() => setConfirmDelete({id: product.id, name: product.name})}
                                        disabled={deletingId === product.id}
                                        className="opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity text-[10px] h-7 px-2 sm:h-8 sm:px-3 sm:text-xs border-red-500/30 hover:bg-red-500 hover:text-white"
                                    >
                                        {deletingId === product.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                                    </Button>
                                </div>
                            </div>
                            <h3 className="font-semibold text-base sm:text-lg line-clamp-1">{product.name}</h3>
                            <p className="text-xs sm:text-sm text-muted-foreground mt-1 mb-4 h-8 sm:h-12 line-clamp-2">
                                {product.description || "Sin descripción detallada."}
                            </p>

                            <div className="border-t border-border pt-4 mt-auto">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                    Documentos Base Requeridos:
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {product.required_docs_schema && Array.isArray(product.required_docs_schema) ? (
                                        product.required_docs_schema.map((doc: string, idx: number) => (
                                            <span key={idx} className="inline-flex items-center px-2 py-1 rounded bg-muted text-xs font-medium text-foreground border border-border/50">
                                                {doc}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-xs text-muted-foreground">No hay configuración de documentos.</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full bg-card border border-border shadow-sm rounded-xl p-12 text-center">
                        <ShieldCheck className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
                        <h3 className="text-lg font-semibold">{searchTerm ? "No se encontraron resultados" : "El catálogo está vacío"}</h3>
                        <p className="text-muted-foreground mt-1 max-w-md mx-auto">
                            {searchTerm ? "Intenta con otro término de búsqueda." : "Comienza registrando los tipos de seguros que ofreces para luego poder asignarlos a tus clientes."}
                        </p>
                        {!searchTerm && (
                            <Link href="/products/new">
                                <Button className="mt-6">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Registrar Primer Producto
                                </Button>
                            </Link>
                        )}
                    </div>
                )}
            </div>

            {/* Modal de Confirmación Premium */}
            {confirmDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-card w-full max-w-md border border-border shadow-2xl rounded-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                                    <AlertTriangle size={24} />
                                </div>
                                <button 
                                    onClick={() => setConfirmDelete(null)}
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            
                            <h3 className="text-xl font-bold mb-2">¿Eliminar producto?</h3>
                            <p className="text-muted-foreground text-sm">
                                Estás a punto de eliminar <span className="font-semibold text-foreground">"{confirmDelete.name}"</span>. 
                                Esta acción es irreversible y podría afectar a pólizas vinculadas.
                            </p>
                        </div>
                        
                        <div className="bg-muted/50 p-4 flex gap-3 justify-end">
                            <Button 
                                variant="outline" 
                                onClick={() => setConfirmDelete(null)}
                                className="bg-transparent"
                            >
                                Cancelar
                            </Button>
                            <Button 
                                onClick={handleDelete}
                                className="bg-red-500 hover:bg-red-600 text-white border-none"
                            >
                                Sí, eliminar producto
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
