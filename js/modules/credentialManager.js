/**
 * TypifyPro 4.0.1 - Secure Credential Manager
 * AES-256 Encryption - Silent Operation (No Logs)
 */

const ENCRYPTION_KEY = '_TypifyPro_2026_SecureKey_v4.0_AES256';
const SALT = 'TypifyPro_Salt_v4';

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
            salt: encoder.encode(SALT),
            iterations: 100000,
            hash: 'SHA-256'
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
    );
}

async function decryptData(encryptedHex) {
    try {
        const key = await deriveKey(ENCRYPTION_KEY);
        const combined = new Uint8Array(encryptedHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
        const iv = combined.slice(0, 12);
        const encryptedData = combined.slice(12);
        const decryptedData = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: iv },
            key,
            encryptedData
        );
        const decoder = new TextDecoder();
        return decoder.decode(decryptedData);
    } catch (error) {
        throw new Error('Decryption failed');
    }
}

async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function loadEncryptedCredentials() {
    try {
        const response = await fetch('config/credentials.json');
        if (!response.ok) {
            throw new Error('File not found');
        }
        const data = await response.json();
        const decryptedUsers = [];
        for (const user of data.users) {
            const decryptedUsername = await decryptData(user.usernameEncrypted);
            decryptedUsers.push({
                username: decryptedUsername,
                passwordHash: user.passwordHash
            });
        }
        return decryptedUsers;
    } catch (error) {
        return [];
    }
}

export async function validateCredentials(username, password) {
    if (!username || !password) {
        throw new Error('Usuario y contraseña son requeridos');
    }
    const users = await loadEncryptedCredentials();
    const user = users.find(u => u.username === username);
    if (!user) {
        throw new Error('Usuario o contraseña incorrectos');
    }
    const passwordHash = await hashPassword(password);
    if (user.passwordHash !== passwordHash) {
        throw new Error('Usuario o contraseña incorrectos');
    }
    return true;
}

export async function getUserInfo(username) {
    const users = await loadEncryptedCredentials();
    const user = users.find(u => u.username === username);
    if (user) {
        return { username: user.username };
    }
    return null;
}

export async function createPasswordHash(password) {
    return await hashPassword(password);
}

export const CredentialManager = {
    validateCredentials,
    getUserInfo,
    createPasswordHash,
    hashPassword
};

window.CredentialManager = CredentialManager;
