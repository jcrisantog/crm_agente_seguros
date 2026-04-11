
const { createClient } = require("@insforge/sdk");

const insforgeUrl = "https://fbmf8gg8.us-west.insforge.app";
const insforgeAnonKey = "ik_5863262628f9d1dc6db41c29ffd7c8ef";

const client = createClient({
    baseUrl: insforgeUrl,
    anonKey: insforgeAnonKey
});

async function test() {
    const todayDate = new Date(); // Simulate current time at run 02:44
    const todayPlus10 = new Date(todayDate);
    todayPlus10.setDate(todayPlus10.getDate() + 10);
    const todayPlus10Str = todayPlus10.toISOString().split('T')[0];

    const msiMaxDate = "2026-04-15";
    const maxDatePlux10 = new Date(msiMaxDate);
    maxDatePlux10.setDate(maxDatePlux10.getDate() + 10);
    const maxDatePlux10Str = maxDatePlux10.toISOString().split('T')[0];

    console.log("Calculated todayPlus10Str:", todayPlus10Str);
    console.log("Calculated maxDatePlux10Str:", maxDatePlux10Str);

    const { data: policies, error } = await client.database
        .from("client_products")
        .select("*, client:clients(full_name, email)")
        .gte("payment_limit", todayPlus10Str)
        .lte("payment_limit", maxDatePlux10Str);

    if (error) {
        console.error("Error:", error);
    } else {
        console.log("Found policies:", policies.length);
        policies.forEach(p => {
            console.log(`Poliza: ${p.policy_number}, Status: ${p.status}, Client: ${p.client?.full_name}, Email: ${p.client?.email}`);
        });
    }
}

test();
