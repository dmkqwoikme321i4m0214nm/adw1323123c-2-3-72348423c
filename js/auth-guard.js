/**
 * TypifyPro 4.0.1 - Authentication Guard
 * CRITICAL: This script MUST be loaded FIRST on all protected pages
 * Blocks page rendering until authentication is verified
 */

(function () {
    'use strict';

    // Check if we're on the login page (allow access)
    const currentPath = window.location.pathname;
    const isLoginPage = currentPath.endsWith('index.html') ||
        currentPath.endsWith('login.html') ||
        currentPath === '/' ||
        currentPath.endsWith('/');

    if (isLoginPage) {
        // Allow login page to load
        return;
    }

    // For all other pages, verify authentication IMMEDIATELY
    const username = localStorage.getItem('username');
    const sessionToken = localStorage.getItem('sessionToken');
    const docType = localStorage.getItem('userDocType');
    const docNumber = localStorage.getItem('documentNumber');

    // If ANY required field is missing, redirect to login
    if (!username || !sessionToken || !docType || !docNumber) {
        console.warn('🔒 Authentication required - redirecting to login');

        // Prevent page from rendering
        document.documentElement.style.display = 'none';

        // Immediate redirect
        window.location.replace('index.html');

        // Halt script execution
        throw new Error('Authentication required');
    }

    // Authentication successful - allow page to render
    console.log('✅ Authentication verified for user:', username);
})();
