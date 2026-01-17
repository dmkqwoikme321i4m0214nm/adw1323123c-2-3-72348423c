/**
 * TypifyPro 3.0 - UI Module
 * Handles Themes, Sidebar, TMO Timer, and General UI Events
 */

const THEMES = {
    MUNDO: { name: 'Mundo', cssClass: 'theme-mundo', bg: '#0b3f4bff', accent: '#a19f0eff' },
    DARK: { name: 'Dark Blue', cssClass: 'theme-dark', bg: '#152533', accent: '#3b82f6' }
};

// Survey Configuration is now handled by config.js


// State
let currentTheme = localStorage.getItem('selectedTheme') || 'MUNDO';
let tmoSeconds = 0;
let tmoInterval;

// Theme Logic
function applyTheme(themeName) {
    // Basic validation
    // Normalize legacy keys if any
    if (themeName === 'MUNDO') themeName = 'tema_mundo';
    if (themeName === 'DARK') themeName = 'dark_blue';

    const validThemes = ['tema_mundo', 'dark_blue', 'modern_black'];
    if (!validThemes.includes(themeName)) return;

    // Save preference first
    localStorage.setItem('selectedTheme', themeName);

    // Update body background color to match theme
    const bgColors = {
        'tema_mundo': '#0b3f4b',
        'dark_blue': '#152533',
        'modern_black': '#0f172a'
    };
    document.body.style.backgroundColor = bgColors[themeName];

    // Apply to DOM - Mundo theme uses default CSS (no data-theme attribute)
    if (themeName === 'tema_mundo') {
        document.documentElement.removeAttribute('data-theme');
    } else {
        document.documentElement.setAttribute('data-theme', themeName);
    }

    // Update global variable
    currentTheme = themeName;

    // Update Settings UI if present (border highlight)
    const cards = document.querySelectorAll('.theme-card');
    if (cards.length > 0) {
        cards.forEach(card => {
            // Check if onclick handler string contains the theme name
            if (card.onclick && card.onclick.toString().includes(themeName)) {
                card.style.border = '2px solid var(--accent-primary)';
                card.style.opacity = '1';
            } else {
                card.style.border = '2px solid transparent';
                card.style.opacity = '0.7';
            }
        });
    }
}

function toggleTheme() {
    // Rotate themes: Mundo -> Dark Blue -> Modern Black -> Mundo
    let nextTheme = 'tema_mundo';
    if (currentTheme === 'tema_mundo') nextTheme = 'dark_blue';
    else if (currentTheme === 'dark_blue') nextTheme = 'modern_black';
    else nextTheme = 'tema_mundo';

    applyTheme(nextTheme);
}

// TMO Timer (Simulated/Placeholder for header if tmo.js not fully loaded)
// Logic: If tmo.js is loaded, it handles the timer. If not, this is dead code or basic fallback.
// Since TMO is now a robust separate module, we might want to remove this or make it safe.
// We'll keep it safe: check if window.TmoModule exists.

function startTmo() {
    // If TmoModule exists, let it handle.
    if (window.TmoModule) return;

    // Fallback or just do nothing to avoid conflicts
    // removing the interval logic to prevent duplicate timers if tmo.js is effectively doing the work via broadcasts
}

// Modal Logic
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = "flex";
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = "none";
    }
}

// Window Click to Close Modal (Outside Click)
window.onclick = function (event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = "none";
    }
}

// Auto Resize Textarea
function resizeTextarea(id) {
    const el = document.getElementById(id);
    if (el) {
        el.style.height = 'auto';
        el.style.height = (el.scrollHeight) + 'px';
    }
}

// Sidebar Logic
function updateSidebarIcon(isCollapsed) {
    const icon = document.querySelector('.sidebar-toggle .material-icons');
    if (icon) {
        icon.textContent = isCollapsed ? 'chevron_right' : 'menu';
    }
}

function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;

    sidebar.classList.toggle('collapsed');
    const isCollapsed = sidebar.classList.contains('collapsed');
    localStorage.setItem('sidebarCollapsed', isCollapsed);
    updateSidebarIcon(isCollapsed);
}

function initSidebar() {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;

    // Restore state
    const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    if (isCollapsed) {
        sidebar.classList.add('collapsed');
    }

    // Auto-collapse on small screens
    if (window.innerWidth <= 1024) {
        sidebar.classList.add('collapsed');
    }

    updateSidebarIcon(sidebar.classList.contains('collapsed'));
}

// Initialization
function initUI() {
    // Restore Theme
    let saved = localStorage.getItem('selectedTheme');
    if (!saved || saved === 'MUNDO') saved = 'tema_mundo';
    applyTheme(saved);

    // Initialize Sidebar
    initSidebar();

    // Set User Document Number (Cédula)
    const userDisplay = document.getElementById('userDisplay');
    if (userDisplay && window.AuthModule) {
        userDisplay.textContent = window.AuthModule.getDocumentNumber() || 'Usuario';
    }
}

/**
 * Shows a temporary notification toast
 * @param {string} message 
 * @param {string} type - 'success', 'error', 'info', 'warning'
 */
function showToast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let icon = 'info';
    if (type === 'success') icon = 'check_circle';
    if (type === 'error') icon = 'error';
    if (type === 'warning') icon = 'warning';

    toast.innerHTML = `
        <span class="material-icons">${icon}</span>
        <span class="message">${message}</span>
    `;

    container.appendChild(toast);

    // Fade in
    setTimeout(() => toast.classList.add('show'), 10);

    // Remove after 3s
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Export
window.toggleTheme = toggleTheme;
window.toggleSidebar = toggleSidebar;
window.openModal = openModal;
window.closeModal = closeModal;
window.abrirModal = openModal;
window.cerrarModal = closeModal;
window.showToast = showToast;
window.showNotification = showToast; // Aliasing for legacy compatibility
window.UIModule = {
    applyTheme,
    toggleTheme,
    toggleSidebar,
    openModal,
    closeModal,
    showToast
};

initUI();
