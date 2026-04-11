import { createClient } from "@insforge/sdk";

const insforgeUrl = "https://fbmf8gg8.us-west.insforge.app";
const insforgeAnonKey = "ik_5863262628f9d1dc6db41c29ffd7c8ef";

const insforge = createClient({
    baseUrl: insforgeUrl,
    anonKey: insforgeAnonKey
});

async function checkTargetDates() {
    try {
        const { data: settings } = await insforge.database
            .from("reminder_settings")
            .select("*")
            .limit(1)
            .maybeSingle();

        if (!settings) {
            console.error("No settings found");
            return;
        }

        const t1 = settings.threshold_1;
        const t2 = settings.threshold_2;
        const t3 = settings.threshold_3;
        const thresholds = [t1, t2, t3].filter(t => t !== null && t !== undefined);
        console.log("Thresholds Configured:", thresholds);

        const targetDates = thresholds.map(t => {
            const todayMX = new Intl.DateTimeFormat("en-US", {
                timeZone: "America/Mexico_City",
                year: "numeric",
                month: "2-digit",
                day: "2-digit"
            }).formatToParts(new Date());

            const Y = todayMX.find(p => p.type === "year")?.value || "";
            const M = todayMX.find(p => p.type === "month")?.value || "";
            const D = todayMX.find(p => p.type === "day")?.value || "";

            const localDate = new Date(`${Y}-${M}-${D}T12:00:00`);
            localDate.setDate(localDate.getDate() + (t as number));
            return localDate.toISOString().split('T')[0];
        });

        console.log("Generated Target Dates (MX Local + Threshold):", targetDates);

        const { data: matched } = await insforge.database
            .from("client_products")
            .select("policy_number, payment_limit, status")
            .in("payment_limit", targetDates)
            .or('status.eq.Activa,status.eq.ACTIVA');

        console.log("\nPolicies matching query:");
        if (matched && matched.length > 0) {
            matched.forEach(p => {
                console.log(`- Policy: ${p.policy_number}, Vence: ${p.payment_limit}, Status: ${p.status}`);
            });
        } else {
            console.log("No policies matched the database query.");
        }

    } catch (err) {
        console.error("Error execution diagnostic:", err);
    }
}

checkTargetDates();
