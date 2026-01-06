/**
 * TypifyPro 3.0 - Authentication Module
 * Handles Login, Logout, and Session Verification
 */

export const AUTH_KEYS = {
    DOC_TYPE: 'userDocType',
    DOC_NUMBER: 'documentNumber',
    THEME: 'selectedTheme'
};

// Check if user is already authenticated
export function checkSession() {
    const docType = localStorage.getItem(AUTH_KEYS.DOC_TYPE);
    const docNumber = localStorage.getItem(AUTH_KEYS.DOC_NUMBER);
    return docType && docNumber;
}

// Login Logic
export function login(documentType, documentNumber) {
    const cleanNumber = documentNumber.trim();

    // Validation based on document type
    if (documentType === 'Cédula') {
        if (!/^\d{10}$/.test(cleanNumber)) {
            throw new Error('La Cédula debe tener exactamente 10 dígitos numéricos.');
        }
    } else if (documentType === 'Pasaporte') {
        if (!/^[a-zA-Z0-9]{6,20}$/.test(cleanNumber)) {
            throw new Error('El Pasaporte debe tener entre 6 y 20 caracteres alfanuméricos.');
        }
    } else {
        throw new Error('Debe seleccionar un tipo de documento válido.');
    }

    // Save session
    localStorage.setItem(AUTH_KEYS.DOC_TYPE, documentType);
    localStorage.setItem(AUTH_KEYS.DOC_NUMBER, cleanNumber);

    return true;
}

// Logout Logic
export function logout() {
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
    const passwordInput = document.getElementById('documentNumber');
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
    getUser: () => localStorage.getItem(AUTH_KEYS.DOC_NUMBER),
    openLogoutModal,
    closeLogoutModal,
    confirmLogout
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

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const docType = document.getElementById('documentType').value;
            const docNumber = document.getElementById('documentNumber').value;
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
                login(docType, docNumber);
                // Animation effect before redirect
                const btn = loginForm.querySelector('button');
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

// Auto-run logic
const path = window.location.pathname;
// Check if we are on the login page (index.html or login.html or root)
// Since user reverted index.html to be login page, we treat it as such if loginForm exists.
// However, the cleanest check is: if loginForm exists, init login logic. else, require auth.
if (document.getElementById('loginForm')) {
    initLoginPage();
} else if (!path.endsWith('login.html') && !path.endsWith('index.html') && path !== '/') {
    // For other pages like dashboard.html, require auth
    requireAuth();
} else if (path.endsWith('dashboard.html')) {
    requireAuth();
}

console.log("AuthModule initialized");
