const { createClient } = require('@insforge/sdk');
const fs = require('fs');
const path = require('path');

const client = createClient({
    baseUrl: 'https://fbmf8gg8.us-west.insforge.app',
    anonKey: 'ik_5863262628f9d1dc6db41c29ffd7c8ef'
});

async function deployFunction(slug, filePath) {
    try {
        const fullPath = path.resolve(filePath);
        console.log(`Reading ${fullPath}...`);
        const code = fs.readFileSync(fullPath, 'utf8');
        console.log(`Updating function ${slug} in Insforge...`);
        const { data, error } = await client.functions.update(slug, { code, status: 'active' });
        if (error) throw error;
        console.log(`SUCCESS: ${slug} updated.`);
    } catch (err) {
        console.error(`FAILED: ${slug}`, err.message);
    }
}

async function run() {
    await deployFunction('send-reminder-email', 'd:/IA/DiegoMN/CRM/send-reminder-email.js');
    await deployFunction('automated-reminders-batch', 'd:/IA/DiegoMN/CRM/automated-reminders-batch.js');
    console.log('Deployment completed.');
}

run();
