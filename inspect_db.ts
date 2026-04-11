import { insforge } from "./src/lib/insforge";

async function checkData() {
    try {
        const { data, error } = await insforge.database
            .from("client_products")
            .select("*")
            .limit(5);

        if (error) {
            console.error("Error fetching data:", error);
            return;
        }

        console.log("Sample rows from client_products:");
        data?.forEach((row, i) => {
            console.log(`\nRow ${i + 1}:`);
            console.log(`  ID: ${row.id}`);
            console.log(`  Policy Number: ${row.policy_number}`);
            console.log(`  Banco: ${row.banco}`);
            console.log(`  Tarjeta Principal: ${row.tarjeta_principal}`);
            console.log(`  Tarjetas (Type: ${typeof row.tarjetas}):`, JSON.stringify(row.tarjetas));
        });
    } catch (err) {
        console.error("Script error:", err);
    }
}

checkData();
