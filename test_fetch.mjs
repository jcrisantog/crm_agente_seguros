import { createClient } from "@insforge/sdk";

const insforge = createClient({
    baseUrl: "https://fbmf8gg8.us-west.insforge.app",
    anonKey: "ik_5863262628f9d1dc6db41c29ffd7c8ef"
});

async function testFetch() {
    const clientId = "00000000-0000-0000-0000-000000000000"; // Dummy
    console.log("Testing fetch for non-existing client:", clientId);

    const [clientRes, productsRes] = await Promise.all([
        insforge.database.from("clients").select("full_name").eq("id", clientId).single(),
        insforge.database.from("products").select("id, name").order("name")
    ]);

    console.log("Client Res Error:", clientRes.error);
    console.log("Products Res Error:", productsRes.error);
}

testFetch();
