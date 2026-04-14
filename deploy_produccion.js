const { createClient } = require('@insforge/sdk');
const fs = require('fs');
const path = require('path');

// ⚠️ IMPORTANTE: REEMPLAZA ESTOS VALORES CON LAS CREDENCIALES DE TU NUEVA BD DE PRODUCCIÓN
const PROD_BASE_URL = 'https://4fwpzp74.us-east.insforge.app';
const PROD_ANON_KEY = 'ik_0864a6e76f81ab7d9c9c4f436e70cb50';

const client = createClient({
    baseUrl: PROD_BASE_URL,
    anonKey: PROD_ANON_KEY
});

async function deployFunction(slug, filePath) {
    try {
        const fullPath = path.resolve(filePath);
        console.log(`Leyendo archivo ${fullPath}...`);

        if (!fs.existsSync(fullPath)) {
            throw new Error(`El archivo ${fullPath} no existe.`);
        }

        const code = fs.readFileSync(fullPath, 'utf8');
        console.log(`Desplegando función ${slug}...`);

        // Intentamos primero ACTUALIZAR, si falla porque no existe, la CREAMOS.
        try {
            await client.functions.update(slug, { code });
            console.log(`✅ ÉXITO: Función '${slug}' actualizada en la BD.`);
        } catch (updateErr) {
            // Si el error implica que no se encontró, intentamos crearla
            console.log(`La función no existe aún. Intentando CREAR '${slug}'...`);
            await client.functions.create({
                name: slug,
                slug: slug,
                code: code
            });
            console.log(`✅ ÉXITO: Función '${slug}' creada con éxito.`);
        }
    } catch (err) {
        console.error(`❌ ERROR en ${slug}:`, err.message || err);
    }
}

async function run() {
    console.log("Iniciando despliegue hacia Producción...\n");

    // Primero, revisamos que hayas puesto las llaves correctas y no sean las por defecto.
    if (PROD_BASE_URL.includes("URL_DE_TU_NUEVO_PROYECTO")) {
        console.error("⚠️ ALTO: Debes editar este archivo y colocar tu URL y Anon Key de Producción.");
        process.exit(1);
    }

    // Archivos locales que quieres publicar
    await deployFunction('automated-reminders-batch', './automated-reminders-batch.js');
    await deployFunction('send-reminder-email', './send-reminder-email.js');

    console.log('\nFinalizado el despliegue de Functions.');
}

run();
