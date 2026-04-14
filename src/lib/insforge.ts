import { createClient } from "@insforge/sdk";

const insforgeUrl = process.env.NEXT_PUBLIC_INSFORGE_URL!;
const insforgeAnonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!;

if (process.env.NODE_ENV === "development") {
    if (!insforgeUrl) console.warn("Insforge SDK: NEXT_PUBLIC_INSFORGE_URL is missing from environment variables.");
    if (!insforgeAnonKey) console.warn("Insforge SDK: NEXT_PUBLIC_INSFORGE_ANON_KEY is missing from environment variables.");
}

// Initialize the Insforge client
/**
 * Instancia global del cliente de Insforge SDK.
 * Proporciona acceso a base de datos, autenticación y almacenamiento.
 * 
 * @throws {Error} Si las variables de entorno no están configuradas.
 * 
 * @example
 * const { data, error } = await insforge.database.from("clients").select("*");
 */
export const insforge = createClient({
    baseUrl: insforgeUrl,
    anonKey: insforgeAnonKey
});

// Forzar modo storage para asegurar persistencia en el navegador
if (typeof window !== "undefined") {
    // @ts-ignore - acceso al manager
    insforge.tokenManager?.setStorageMode();
}

export const ensureValidSession = async () => {
    try {
        const { data } = await insforge.auth.getCurrentSession();
        return data?.session;
    } catch {
        return null;
    }
};
