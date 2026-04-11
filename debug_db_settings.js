const { createClient } = require('@insforge/sdk');

const client = createClient({
    baseUrl: 'https://fbmf8gg8.us-west.insforge.app',
    anonKey: 'ik_5863262628f9d1dc6db41c29ffd7c8ef'
});

async function checkData() {
    try {
        const { data: settings, error } = await client.database
            .from('reminder_settings')
            .select('*')
            .limit(1)
            .single();

        if (error) throw error;
        console.log("Settings in DB:", JSON.stringify(settings, null, 2));

    } catch (err) {
        console.error("Script error:", err);
    }
}

checkData();
