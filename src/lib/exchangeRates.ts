import { insforge } from "@/lib/insforge";

export interface ExchangeRates {
    date: string;
    dolar: number;
    udi: number;
}

const CACHE_KEY = "crm_exchange_rates";

export async function getTodaysExchangeRates(): Promise<ExchangeRates | null> {
    try {
        if (typeof window === "undefined") return null;

        // Usar fecha local en formato YYYY-MM-DD para evitar el salto de día de UTC
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const todayDate = `${year}-${month}-${day}`; 

        // Local cache lookup
        const cachedStr = localStorage.getItem(CACHE_KEY);
        if (cachedStr) {
            try {
                const cached: ExchangeRates = JSON.parse(cachedStr);
                if (cached.date === todayDate) {
                    return cached;
                }
            } catch (e) {
                // Ignore parse errors, just refetch
            }
        }

        // Fetch from DB using insforge
        const { data, error } = await insforge.database
            .from("exchange_rate")
            .select("fecha, dolar, udi")
            .order("fecha", { ascending: false })
            .limit(1);

        if (error || !data || data.length === 0) {
            console.warn("Could not fetch exchange rates:", error);
            return null;
        }

        const latestData = data[0];

        const rates: ExchangeRates = {
            date: todayDate,
            dolar: latestData.dolar ?? 0,
            udi: latestData.udi ?? 0,
        };

        localStorage.setItem(CACHE_KEY, JSON.stringify(rates));
        return rates;
    } catch (error) {
        console.error("Failed getting exchange rates", error);
        return null;
    }
}
