import { AuthModule } from './modules/auth.js';

document.addEventListener('DOMContentLoaded', () => {
    // Check if already logged in
    const docNumber = AuthModule.getUser();
    if (docNumber) {
        window.location.href = 'index.html';
        return;
    }

    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;

    // Initialize toggle password functionality
    const toggleIcon = document.querySelector('.toggle-password');
    if (toggleIcon) {
        toggleIcon.addEventListener('click', AuthModule.togglePasswordVisibility);
    }

    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const documentType = document.getElementById('documentType').value;
        const documentNumber = document.getElementById('documentNumber').value;
        const loginMessageDiv = document.getElementById('loginMessage');
        const submitButton = loginForm.querySelector('button[type="submit"]');

        const showErrorMessage = (message) => {
            loginMessageDiv.textContent = message;
            loginMessageDiv.style.display = 'flex';
        };

        const hideErrorMessage = () => {
            loginMessageDiv.textContent = '';
            loginMessageDiv.style.display = 'none';
        };

        hideErrorMessage();

        if (!documentType || !documentNumber) {
            showErrorMessage('Por favor, seleccione el tipo de documento e ingrese su número.');
            return;
        }

        try {
            // Attempt login
            AuthModule.login(documentType, documentNumber);

            // UI Feedback
            submitButton.disabled = true;
            submitButton.textContent = 'Ingresando...';

            // Redirect
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 500);

        } catch (error) {
            showErrorMessage(error.message);
            submitButton.disabled = false;
        }
    });

    // Make body visible after initialization (if hidden by CSS, though here it's fine)
    document.body.classList.add('login-initialized');
});
