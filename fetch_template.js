
const { createClient } = require('@insforge/sdk');
const fs = require('fs');

async function check() {
    const client = createClient({
        baseUrl: 'https://fbmf8gg8.us-west.insforge.app',
        anonKey: 'ik_5863262628f9d1dc6db41c29ffd7c8ef'
    });

    const { data } = await client.database.from('reminder_settings').select('email_template').single();
    if (data) {
        fs.writeFileSync('template.html', data.email_template);
        console.log('Template saved to template.html');
    } else {
        console.log('No data found');
    }
}

check();
