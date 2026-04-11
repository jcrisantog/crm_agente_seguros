import { createClient } from "@insforge/sdk";

const insforgeUrl = "https://fbmf8gg8.us-west.insforge.app";
const insforgeAnonKey = "ik_5863262628f9d1dc6db41c29ffd7c8ef";

const insforge = createClient({
    baseUrl: insforgeUrl,
    anonKey: insforgeAnonKey
});

async function checkData() {
    try {
        const { data, error } = await insforge.database
            .from("client_products")
            .select("*")
            .limit(100);

        if (error) {
            console.error("Error fetching data:", error);
            return;
        }

        const { data: set } = await insforge.database.from("reminder_settings").select("*").maybeSingle();
        console.log("Settings Thresholds:", set?.threshold_1, set?.threshold_2, set?.threshold_3);

        const todayMX = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Mexico_City" }));
        todayMX.setHours(12, 0, 0, 0);
        console.log("Today (Normalized):", todayMX.toISOString());

        console.log("\nRows that SHOULD trigger (or why not):");
        data?.forEach((row: any) => {
            if (!row.payment_limit) return;
            
            const pLimit = new Date(row.payment_limit + "T12:00:00");
            const diff = Math.round((pLimit.getTime() - todayMX.getTime()) / (1000 * 60 * 60 * 24));
            
            const isMatch = diff === set?.threshold_1 || diff === set?.threshold_2 || diff === set?.threshold_3;
            if (isMatch || (diff >= -5 && diff <= 15)) {
                console.log(`[P: ${row.policy_number || 'S/N'}] Vence: ${row.payment_limit} | Diff: ${diff} días | Status: ${row.status} | MATCH: ${isMatch ? '✅' : '❌'}`);
            }
        });
    } catch (err) {
        console.error("Script error:", err);
    }
}

checkData();
