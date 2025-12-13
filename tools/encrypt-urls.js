#!/usr/bin/env node

/**
 * Herramienta de Encriptación de URLs
 * 
 * Este script encripta las URLs de los formularios y genera el archivo
 * config.encrypted.js que debe ser incluido en la aplicación.
 * 
 * USO:
 *   node tools/encrypt-urls.js
 * 
 * El script solicitará las URLs y generará automáticamente el archivo encriptado.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Clave de encriptación (debe coincidir con la del configLoader.js)
const ENCRYPTION_KEY = 'TipifyPro2024SecureKey!@#';

/**
 * Encripta una cadena usando XOR cipher y la codifica en Base64
 * @param {string} text - Texto a encriptar
 * @param {string} key - Clave de encriptación
 * @returns {string} - Texto encriptado en Base64
 */
function xorEncrypt(text, key) {
    let encrypted = '';

    // Aplicar XOR con la clave
    for (let i = 0; i < text.length; i++) {
        const charCode = text.charCodeAt(i) ^ key.charCodeAt(i % key.length);
        encrypted += String.fromCharCode(charCode);
    }

    // Codificar en Base64
    return Buffer.from(encrypted, 'binary').toString('base64');
}

/**
 * Genera el archivo de configuración encriptada
 * @param {string} surveyUrl - URL del formulario de sondeo
 * @param {string} persisteUrl - URL del formulario de cliente persiste
 */
function generateEncryptedConfig(surveyUrl, persisteUrl) {
    const encryptedSurveyUrl = xorEncrypt(surveyUrl, ENCRYPTION_KEY);
    const encryptedPersisteUrl = xorEncrypt(persisteUrl, ENCRYPTION_KEY);

    const configContent = `/**
 * Configuración Encriptada de URLs
 * 
 * Este archivo contiene las URLs de los formularios en formato encriptado.
 * No modificar manualmente. Usar tools/encrypt-urls.js para actualizar.
 * 
 * Generado: ${new Date().toISOString()}
 */

window.ENCRYPTED_CONFIG = {
  SURVEY_BASE_URL: "${encryptedSurveyUrl}",
  SURVEY_PERSISTE_BASE_URL: "${encryptedPersisteUrl}"
};
`;

    const outputPath = path.join(__dirname, '..', 'js', 'config.encrypted.js');

    try {
        fs.writeFileSync(outputPath, configContent, 'utf8');
        console.log('\n✓ Archivo de configuración encriptada generado exitosamente:');
        console.log(`  ${outputPath}\n`);
        console.log('Las URLs han sido encriptadas y no son visibles en texto plano.\n');
    } catch (error) {
        console.error('✗ Error al escribir el archivo:', error.message);
        process.exit(1);
    }
}

/**
 * Interfaz de línea de comandos
 */
async function main() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    console.log('='.repeat(60));
    console.log('  HERRAMIENTA DE ENCRIPTACIÓN DE URLs - Tipify Pro');
    console.log('='.repeat(60));
    console.log('\nEsta herramienta encriptará las URLs de los formularios.');
    console.log('Las URLs encriptadas se guardarán en js/config.encrypted.js\n');

    const question = (prompt) => new Promise((resolve) => {
        rl.question(prompt, resolve);
    });

    try {
        const surveyUrl = await question('Ingrese la URL del formulario de SONDEO:\n> ');

        if (!surveyUrl || !surveyUrl.includes('docs.google.com/forms')) {
            console.error('\n✗ URL inválida. Debe ser una URL de Google Forms.');
            rl.close();
            process.exit(1);
        }

        const persisteUrl = await question('\nIngrese la URL del formulario de CLIENTE PERSISTE:\n> ');

        if (!persisteUrl || !persisteUrl.includes('docs.google.com/forms')) {
            console.error('\n✗ URL inválida. Debe ser una URL de Google Forms.');
            rl.close();
            process.exit(1);
        }

        console.log('\n' + '-'.repeat(60));
        console.log('Generando archivo encriptado...');
        console.log('-'.repeat(60));

        generateEncryptedConfig(surveyUrl, persisteUrl);

        console.log('IMPORTANTE:');
        console.log('  1. El archivo config.encrypted.js ha sido creado');
        console.log('  2. Asegúrese de incluirlo en index.html');
        console.log('  3. Las URLs originales NO deben estar en el código fuente\n');

    } catch (error) {
        console.error('\n✗ Error:', error.message);
    } finally {
        rl.close();
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    main();
}

module.exports = { xorEncrypt };
