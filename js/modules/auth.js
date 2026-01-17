/**
 * TypifyPro 4.0.1 - Authentication Module
 * Handles Login, Logout, and Session Verification
 */

import { validateCredentials } from './credentialManager.js';

export const AUTH_KEYS = {
    USERNAME: 'username',
    SESSION_TOKEN: 'sessionToken',
    DOC_TYPE: 'userDocType',
    DOC_NUMBER: 'documentNumber',
    THEME: 'selectedTheme'
};

// Check if user is already authenticated
export function checkSession() {
    const username = localStorage.getItem(AUTH_KEYS.USERNAME);
    const sessionToken = localStorage.getItem(AUTH_KEYS.SESSION_TOKEN);
    const docType = localStorage.getItem(AUTH_KEYS.DOC_TYPE);
    const docNumber = localStorage.getItem(AUTH_KEYS.DOC_NUMBER);
    return username && sessionToken && docType && docNumber;
}

// Login Logic
export async function login(username, password, documentType, documentNumber) {
    const cleanUsername = username.trim();
    const cleanPassword = password.trim();
    const cleanDocNumber = documentNumber.trim();

    // Validate credentials against config file
    await validateCredentials(cleanUsername, cleanPassword);

    // Validate document based on type
    if (documentType === 'Cédula') {
        if (!/^\d{10}$/.test(cleanDocNumber)) {
            throw new Error('La Cédula debe tener exactamente 10 dígitos numéricos.');
        }
    } else if (documentType === 'Pasaporte') {
        if (!/^[a-zA-Z0-9]{6,20}$/.test(cleanDocNumber)) {
            throw new Error('El Pasaporte debe tener entre 6 y 20 caracteres alfanuméricos.');
        }
    } else {
        throw new Error('Debe seleccionar un tipo de documento válido.');
    }

    // Generate session token
    const sessionToken = generateSessionToken();

    // Save session (both authentication and document data)
    localStorage.setItem(AUTH_KEYS.USERNAME, cleanUsername);
    localStorage.setItem(AUTH_KEYS.SESSION_TOKEN, sessionToken);
    localStorage.setItem(AUTH_KEYS.DOC_TYPE, documentType);
    localStorage.setItem(AUTH_KEYS.DOC_NUMBER, cleanDocNumber);

    return true;
}

// Generate a simple session token
function generateSessionToken() {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Logout Logic
export function logout() {
    localStorage.removeItem(AUTH_KEYS.USERNAME);
    localStorage.removeItem(AUTH_KEYS.SESSION_TOKEN);
    localStorage.removeItem(AUTH_KEYS.DOC_TYPE);
    localStorage.removeItem(AUTH_KEYS.DOC_NUMBER);
    window.location.href = 'index.html';
}

// Initialize Protected Page (Dashboard, etc.)
export function requireAuth() {
    if (!checkSession()) {
        const path = window.location.pathname;
        if (!path.endsWith('login.html')) {
            window.location.href = 'login.html';
        }
    }
}

// Toggle Password Visibility
export function togglePasswordVisibility() {
    const passwordInput = document.getElementById('password');
    const toggleIcon = document.querySelector('.toggle-password');
    if (passwordInput && toggleIcon) {
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            toggleIcon.textContent = 'visibility_off';
        } else {
            passwordInput.type = 'password';
            toggleIcon.textContent = 'visibility';
        }
    }
}

// Open Logout Confirmation Modal
export function openLogoutModal() {
    const modal = document.getElementById('logoutModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

// Close Logout Confirmation Modal
export function closeLogoutModal() {
    const modal = document.getElementById('logoutModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Confirm Logout Action
export function confirmLogout() {
    closeLogoutModal();
    logout();
}

// Global Auth Object
export const AuthModule = {
    login,
    logout,
    checkSession,
    requireAuth,
    togglePasswordVisibility,
    getUser: () => localStorage.getItem(AUTH_KEYS.USERNAME),
    getDocumentNumber: () => localStorage.getItem(AUTH_KEYS.DOC_NUMBER),
    getDocumentType: () => localStorage.getItem(AUTH_KEYS.DOC_TYPE),
    openLogoutModal,
    closeLogoutModal,
    confirmLogout,
    goBackToStep1
};

// Expose for global usage (e.g. legacy scripts or inline onclic events)
window.AuthModule = AuthModule;

// Initialize Login Page logic
function initLoginPage() {
    // If already logged in, redirect to dashboard
    if (checkSession()) {
        window.location.href = 'dashboard.html';
        return;
    }

    // Step 1: Username and Password validation
    const loginFormStep1 = document.getElementById('loginFormStep1');
    if (loginFormStep1) {
        loginFormStep1.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const loginMessageDiv = document.getElementById('loginMessage');

            const showErrorMessage = (message) => {
                if (loginMessageDiv) {
                    loginMessageDiv.textContent = message;
                    loginMessageDiv.style.display = 'flex';
                }
            };

            const hideErrorMessage = () => {
                if (loginMessageDiv) {
                    loginMessageDiv.textContent = '';
                    loginMessageDiv.style.display = 'none';
                }
            };

            hideErrorMessage();

            try {
                // Validate credentials only
                await validateCredentials(username, password);

                // Store credentials temporarily (not in localStorage yet)
                window._tempLoginData = { username, password };

                // Show step 2
                document.getElementById('loginFormStep1').style.display = 'none';
                document.getElementById('loginFormStep2').style.display = 'block';
                document.getElementById('loginTitle').textContent = 'Información de Documento';
                document.getElementById('loginDescription').textContent = 'Complete sus datos de documento para continuar.';

                // Focus on first field of step 2
                document.getElementById('documentType').focus();
            } catch (error) {
                showErrorMessage(error.message);
            }
        });
    }

    // Step 2: Document information
    const loginFormStep2 = document.getElementById('loginFormStep2');
    if (loginFormStep2) {
        loginFormStep2.addEventListener('submit', async (e) => {
            e.preventDefault();
            const documentType = document.getElementById('documentType').value;
            const documentNumber = document.getElementById('documentNumber').value;
            const documentMessageDiv = document.getElementById('documentMessage');

            const showErrorMessage = (message) => {
                if (documentMessageDiv) {
                    documentMessageDiv.textContent = message;
                    documentMessageDiv.style.display = 'flex';
                }
            };

            const hideErrorMessage = () => {
                if (documentMessageDiv) {
                    documentMessageDiv.textContent = '';
                    documentMessageDiv.style.display = 'none';
                }
            };

            hideErrorMessage();

            try {
                // Get credentials from temporary storage
                const { username, password } = window._tempLoginData || {};

                if (!username || !password) {
                    throw new Error('Sesión expirada. Por favor, inicie sesión nuevamente.');
                }

                // Complete login with all data
                await login(username, password, documentType, documentNumber);

                // Clear temporary data
                delete window._tempLoginData;

                // Animation effect before redirect
                const btn = loginFormStep2.querySelector('button[type="submit"]');
                if (btn) btn.innerHTML = 'Ingresando...';

                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 500);
            } catch (error) {
                showErrorMessage(error.message);
            }
        });
    }
}

// Function to go back to step 1
export function goBackToStep1() {
    document.getElementById('loginFormStep2').style.display = 'none';
    document.getElementById('loginFormStep1').style.display = 'block';
    document.getElementById('loginTitle').textContent = 'Iniciar Sesión';
    document.getElementById('loginDescription').textContent = 'Ingrese su usuario y contraseña para acceder al sistema.';

    // Clear step 2 fields
    document.getElementById('documentType').value = '';
    document.getElementById('documentNumber').value = '';

    // Clear any error messages
    const documentMessageDiv = document.getElementById('documentMessage');
    if (documentMessageDiv) {
        documentMessageDiv.textContent = '';
        documentMessageDiv.style.display = 'none';
    }
}

// Auto-run logic
const path = window.location.pathname;
// Check if we are on the login page (index.html or login.html or root)
// Since user reverted index.html to be login page, we treat it as such if loginFormStep1 exists.
// However, the cleanest check is: if loginFormStep1 exists, init login logic. else, require auth.
if (document.getElementById('loginFormStep1')) {
    initLoginPage();
} else if (!path.endsWith('login.html') && !path.endsWith('index.html') && path !== '/') {
    // For other pages like dashboard.html, require auth
    requireAuth();
} else if (path.endsWith('dashboard.html')) {
    requireAuth();
}

console.log("AuthModule initialized");
