import { createClient } from "@insforge/sdk";

const insforge = createClient({
    baseUrl: "https://fbmf8gg8.us-west.insforge.app",
    anonKey: "ik_5863262628f9d1dc6db41c29ffd7c8ef"
});

async function main() {
    console.log("Invoking function...");
    const { data, error } = await insforge.functions.invoke('automated-reminders-batch', {
        body: { force: true }
    });

    if (error) {
        console.error("Error:", error);
    } else {
        console.log("Success:", JSON.stringify(data, null, 2));
    }
}

main();
