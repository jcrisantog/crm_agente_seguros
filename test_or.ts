import { createClient } from "@insforge/sdk";

const insforgeUrl = "https://fbmf8gg8.us-west.insforge.app";
const insforgeAnonKey = "ik_5863262628f9d1dc6db41c29ffd7c8ef";

const insforge = createClient({
    baseUrl: insforgeUrl,
    anonKey: insforgeAnonKey
});

async function checkOrQuery() {
    try {
        const targetDates = ['2026-03-29', '2026-03-25', '2026-03-20'];
        
        const { data: policies, error: policiesError } = await insforge.database
            .from("client_products")
            .select("policy_number, payment_limit, status")
            .in("payment_limit", targetDates)
            .or('status.eq.Activa,status.eq.ACTIVA');

        console.log("Returned policies:");
        if (policies) {
            policies.forEach(p => console.log(p));
        }
    } catch (e) {
        console.error(e);
    }
}
checkOrQuery();
