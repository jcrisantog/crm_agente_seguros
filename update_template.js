
const { createClient } = require('@insforge/sdk');

async function update() {
    const client = createClient({
        baseUrl: 'https://fbmf8gg8.us-west.insforge.app',
        anonKey: 'ik_5863262628f9d1dc6db41c29ffd7c8ef'
    });

    const newTemplate = `<p>Hola&nbsp;<span style="border-color: rgb(30, 41, 59); font-weight: bolder; letter-spacing: -0.4px;">{{nombre}}&nbsp;</span>! Excelente día ☀. Espero que todo vaya de maravilla.</p><p><br></p><p>Te escribo para saludar y también para notificar que está próxima la fecha de corte anual de tu estrategia de Prudential.</p><p><br></p><p>La fecha de corte es el&nbsp;<span style="border-color: rgb(30, 41, 59); font-weight: bolder; color: rgb(221, 39, 39); letter-spacing: -0.4px;">{{fecha_pago}}</span>&nbsp;y el monto al día de hoy es de&nbsp;<span style="border-color: rgb(30, 41, 59); font-weight: bolder; letter-spacing: -0.4px;"><font color="#0a33ff" style="border-color: rgb(30, 41, 59);">{{monto}}</font></span>.</p><p><br></p><p>El sistema hará el cargo en una exhibición en la fecha de corte anual a la tarjeta {{banco}} terminación {{terminacion}}</p><p><br></p>Duda, ¿este medio de cobro sigue vigente?<p><br></p><p>Saludos.</p>`;

    const { error } = await client.database
        .from('reminder_settings')
        .update({ email_template: newTemplate })
        .eq('id', '0e05c7ad-a2de-465e-80e7-6dbcb05ffcf9');

    if (error) {
        console.error('Error updating template:', error);
    } else {
        console.log('Template updated successfully');
    }
}

update();
