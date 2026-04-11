
import { insforge } from "./src/lib/insforge";

async function test() {
    const todayDate = new Date(); // Use same as server
    const todayPlus10 = new Date(todayDate);
    todayPlus10.setDate(todayPlus10.getDate() + 10);
    const todayPlus10Str = todayPlus10.toISOString().split('T')[0];

    // Assume msiMaxDate from DB
    const msiMaxDate = "2026-04-15";
    const maxDatePlux10 = new Date(msiMaxDate);
    maxDatePlux10.setDate(maxDatePlux10.getDate() + 10);
    const maxDatePlux10Str = maxDatePlux10.toISOString().split('T')[0];

    console.log("Range:", todayPlus10Str, "to", maxDatePlux10Str);

    const { data: policies, error } = await insforge.database
        .from("client_products")
        .select("*, client:clients(full_name, email)")
        .gte("payment_limit", todayPlus10Str)
        .lte("payment_limit", maxDatePlux10Str);

    if (error) {
        console.error("Error:", error);
        return;
    }

    console.log("Found policies:", policies?.length);
    policies?.forEach(p => {
        console.log(`Policy: ${p.policy_number}, Limit: ${p.payment_limit}, Client: ${p.client?.full_name}`);
    });
}

test();
