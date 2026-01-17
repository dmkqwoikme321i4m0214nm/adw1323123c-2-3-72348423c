/**
 * TypifyPro 4.0.0 - Credential Encryption Module
 * Handles AES-256 encryption/decryption of credentials
 */

// Encryption key - In production, this should be more secure
// For now, derived from a combination of factors
const ENCRYPTION_KEY = 'TypifyPro_4.0_SecureKey_2026_AES256_Protection';

// Convert string to ArrayBuffer
function str2ab(str) {
    const buf = new ArrayBuffer(str.length);
    const bufView = new Uint8Array(buf);
    for (let i = 0; i < str.length; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
}

// Convert ArrayBuffer to string
function ab2str(buf) {
    return String.fromCharCode.apply(null, new Uint8Array(buf));
}

// Convert ArrayBuffer to hex string
function ab2hex(buffer) {
    return Array.from(new Uint8Array(buffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

// Convert hex string to ArrayBuffer
function hex2ab(hex) {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
    }
    return bytes.buffer;
}

// Derive encryption key from passphrase
async function deriveKey(passphrase) {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(passphrase),
        { name: 'PBKDF2' },
        false,
        ['deriveBits', 'deriveKey']
    );

    return crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: encoder.encode('TypifyPro_Salt_2026'),
            iterations: 100000,
            hash: 'SHA-256'
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
    );
}

// Encrypt data
export async function encryptData(data) {
    const encoder = new TextEncoder();
    const key = await deriveKey(ENCRYPTION_KEY);
    const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for AES-GCM

    const encryptedData = await crypto.subtle.encrypt(
        {
            name: 'AES-GCM',
            iv: iv
        },
        key,
        encoder.encode(data)
    );

    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encryptedData.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encryptedData), iv.length);

    return ab2hex(combined.buffer);
}

// Decrypt data
export async function decryptData(encryptedHex) {
    try {
        const key = await deriveKey(ENCRYPTION_KEY);
        const combined = new Uint8Array(hex2ab(encryptedHex));

        // Extract IV and encrypted data
        const iv = combined.slice(0, 12);
        const encryptedData = combined.slice(12);

        const decryptedData = await crypto.subtle.decrypt(
            {
                name: 'AES-GCM',
                iv: iv
            },
            key,
            encryptedData
        );

        const decoder = new TextDecoder();
        return decoder.decode(decryptedData);
    } catch (error) {
        console.error('Decryption failed:', error);
        throw new Error('No se pudo descifrar los datos. Archivo corrupto o clave incorrecta.');
    }
}

// Encrypt username
export async function encryptUsername(username) {
    return await encryptData(username);
}

// Decrypt username
export async function decryptUsername(encryptedUsername) {
    return await decryptData(encryptedUsername);
}

// Load and decrypt credentials
export async function loadEncryptedCredentials() {
    try {
        const response = await fetch('config/credentials.json');
        if (!response.ok) {
            throw new Error('No se pudo cargar el archivo de credenciales');
        }
        const data = await response.json();

        // Decrypt users
        const decryptedUsers = [];
        for (const user of data.users) {
            const decryptedUsername = await decryptUsername(user.usernameEncrypted);
            decryptedUsers.push({
                username: decryptedUsername,
                passwordHash: user.passwordHash
            });
        }

        return decryptedUsers;
    } catch (error) {
        console.error('Error loading encrypted credentials:', error);
        // Fallback to default if file doesn't exist
        return [];
    }
}

// Export encryption module
export const EncryptionModule = {
    encryptData,
    decryptData,
    encryptUsername,
    decryptUsername,
    loadEncryptedCredentials
};

window.EncryptionModule = EncryptionModule;

console.log("EncryptionModule initialized");
