import { insforge } from "@/lib/insforge";
import { ClientsList } from "@/components/clients/ClientsList";

export const dynamic = 'force-dynamic';

// Define the fetch function
/**
 * Obtiene la lista completa de asegurados con su respectivo conteo de pólizas.
 * Optimizado mediante selección de columnas específicas.
 * 
 * @returns {Promise<Array>} Lista de objetos de clientes/asegurados.
 * @throws {Error} Si la conexión con la base de datos falla.
 */
async function getClients() {
    const { data, error } = await insforge.database
        .from("clients")
        .select("id, full_name, email, phone, created_at, client_products(count)")
        .filter("client_products.status", "eq", "Activa")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching clients:", error);
        throw new Error("No se pudo cargar la lista de clientes.");
    }
    return data || [];
}

export default async function ClientsPage() {
    const clients = await getClients();

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <ClientsList initialClients={clients} />
        </div>
    );
}
