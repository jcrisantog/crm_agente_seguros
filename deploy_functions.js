const { createClient } = require('@insforge/sdk');
const fs = require('fs');
const path = require('path');

const client = createClient({
    baseUrl: 'https://fbmf8gg8.us-west.insforge.app',
    anonKey: 'ik_5863262628f9d1dc6db41c29ffd7c8ef'
});

async function updateFunction(slug, filePath) {
    try {
        const fullPath = path.resolve(filePath);
        console.log(`Reading ${fullPath}...`);
        const code = fs.readFileSync(fullPath, 'utf8');
        console.log(`Updating function ${slug}...`);
        await client.functions.update(slug, { code });
        console.log(`SUCCESS: ${slug} updated.`);
    } catch (err) {
        console.error(`FAILED: ${slug}`, err.message);
        process.exit(1);
    }
}

async function run() {
    await updateFunction('send-reminder-email', 'd:/IA/DiegoMN/CRM/tmp_send_reminder.js');
    await updateFunction('automated-reminders-batch', 'd:/IA/DiegoMN/CRM/tmp_automated_reminders.js');
    console.log('All functions updated correctly.');
}

run();
