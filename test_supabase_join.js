
const { createClient } = require("@insforge/sdk");

const insforgeUrl = "https://fbmf8gg8.us-west.insforge.app";
const insforgeAnonKey = "ik_5863262628f9d1dc6db41c29ffd7c8ef";

const client = createClient({
    baseUrl: insforgeUrl,
    anonKey: insforgeAnonKey
});

async function test() {
    const { data: policies, error } = await client.database
        .from("client_products")
        .select("*, client:clients(full_name, email)")
        .eq("policy_number", "A-25154");

    if (error) {
        console.error("Error:", error);
    } else {
        console.log("Policies count:", policies.length);
        console.log("Policy details:", JSON.stringify(policies[0], null, 2));
    }
}

test();
