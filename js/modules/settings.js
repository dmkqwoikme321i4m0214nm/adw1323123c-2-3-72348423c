/**
 * TypifyPro 3.0 - Settings Module
 */

// Helper to show custom confirmation modal
function showConfirmModal(title, message, onConfirm) {
    const modal = document.getElementById('confirmModal');
    const titleEl = document.getElementById('confirmTitle');
    const msgEl = document.getElementById('confirmMessage');
    const btn = document.getElementById('confirmActionBtn');

    if (!modal) {
        if (confirm(message)) onConfirm();
        return;
    }

    titleEl.textContent = title;
    msgEl.textContent = message;

    btn.onclick = () => {
        onConfirm();
        window.closeModal('confirmModal');
    };

    window.openModal('confirmModal');
}

// Helper to show custom message modal (Success/Info)
function showMessageModal(title, message, type = 'success', onDismiss = null) {
    const modal = document.getElementById('messageModal');
    const titleEl = document.getElementById('messageTitle');
    const msgEl = document.getElementById('messageBody');
    const btn = document.getElementById('messageActionBtn');
    const icon = document.getElementById('messageIcon');

    if (!modal) {
        alert(message);
        if (onDismiss) onDismiss();
        return;
    }

    titleEl.textContent = title;
    msgEl.textContent = message;

    // Icon handling
    if (type === 'success') {
        icon.textContent = 'check_circle';
        icon.style.color = 'var(--success-color)';
    } else if (type === 'error') {
        icon.textContent = 'error';
        icon.style.color = 'var(--danger-color)';
    } else {
        icon.textContent = 'info';
        icon.style.color = 'var(--accent-primary)';
    }

    btn.onclick = () => {
        window.closeModal('messageModal');
        if (onDismiss) onDismiss();
    };

    window.openModal('messageModal');
}

export function exportAllData() {
    // Note: History excluded from backup here as per user request.
    const data = {
        meta: {
            timestamp: new Date().toISOString(),
            version: "3.0.0",
            exportType: "settings_only"
        },
        data: {
            // Core
            shortcuts: JSON.parse(localStorage.getItem('shortcuts') || '[]'),

            // UI & Preferences
            selectedTheme: localStorage.getItem('selectedTheme') || 'modern_black',
            sidebarCollapsed: localStorage.getItem('sidebarCollapsed') === 'true',

            // Auth
            auth_doc_type: localStorage.getItem('auth_doc_type'),
            auth_doc_number: localStorage.getItem('auth_doc_number'),

            // TMO
            tmo_history: JSON.parse(localStorage.getItem('tmo_history') || '[]'),
            tmo_categories: JSON.parse(localStorage.getItem('tmo_categories') || '[]'),
            tmo_active_session: JSON.parse(localStorage.getItem('tmo_active_session') || 'null'),

            // Chrono
            pipTimer_presets: JSON.parse(localStorage.getItem('pipTimer_presets') || '[]'),
            pipTimer_selectedSound: localStorage.getItem('pipTimer_selectedSound'),
            pipTimer_lastSelected: localStorage.getItem('pipTimer_lastSelected')
        }
    };

    const fileName = `TypifyPro_Settings_Backup_${new Date().toISOString().slice(0, 10)}.txt`;
    const content = JSON.stringify(data, null, 2);
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    if (window.showToast) {
        window.showToast("Respaldo de configuración descargado correctamente.", "success");
    } else {
        alert("Respaldo de configuración descargado correctamente.");
    }
}

export function importAllData(file) {
    if (!file) {
        alert("Por favor selecciona un archivo válido.");
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const raw = JSON.parse(e.target.result);
            let dataToRestore = raw;
            if (raw.meta && raw.data) dataToRestore = raw.data;

            if (!dataToRestore.shortcuts && !dataToRestore.tmo_history && !dataToRestore.selectedTheme) {
                throw new Error("Formato de respaldo inválido or archivo vacío");
            }

            showConfirmModal(
                "Restaurar Configuración",
                "¿Estás seguro de restaurar este respaldo? Esto SOBRESCRIBIRÁ tus configuraciones actuales.",
                () => {
                    const d = dataToRestore;

                    // History Check (restore if present, though unlikely in new backups)
                    if (d.historial) {
                        localStorage.setItem('typify_history', JSON.stringify(d.historial));
                        localStorage.setItem('historial', JSON.stringify(d.historial));
                    }

                    if (d.shortcuts) localStorage.setItem('shortcuts', JSON.stringify(d.shortcuts));
                    if (d.selectedTheme) localStorage.setItem('selectedTheme', d.selectedTheme);
                    if (d.sidebarCollapsed !== undefined) localStorage.setItem('sidebarCollapsed', d.sidebarCollapsed);
                    if (d.auth_doc_type) localStorage.setItem('auth_doc_type', d.auth_doc_type);
                    if (d.auth_doc_number) localStorage.setItem('auth_doc_number', d.auth_doc_number);
                    if (d.tmo_history) localStorage.setItem('tmo_history', JSON.stringify(d.tmo_history));
                    if (d.tmo_categories) localStorage.setItem('tmo_categories', JSON.stringify(d.tmo_categories));
                    if (d.tmo_active_session) localStorage.setItem('tmo_active_session', JSON.stringify(d.tmo_active_session));
                    if (d.pipTimer_presets) localStorage.setItem('pipTimer_presets', JSON.stringify(d.pipTimer_presets));
                    if (d.pipTimer_selectedSound) localStorage.setItem('pipTimer_selectedSound', d.pipTimer_selectedSound);
                    if (d.pipTimer_lastSelected) localStorage.setItem('pipTimer_lastSelected', d.pipTimer_lastSelected);
                    if (d.surveyHistory) localStorage.setItem('surveyHistory', JSON.stringify(d.surveyHistory));
                    if (d.surveyPersisteHistory) localStorage.setItem('surveyPersisteHistory', JSON.stringify(d.surveyPersisteHistory));


                    // Success Message via Modal
                    showMessageModal(
                        "Restauración Completada",
                        "Los datos han sido restaurados exitosamente. La página se recargará ahora.",
                        "success",
                        () => {
                            location.reload();
                        }
                    );
                }
            );

        } catch (error) {
            console.error("Error import:", error);
            // Error Message via Modal
            showMessageModal(
                "Error de Importación",
                "No se pudo leer el archivo. Asegúrate de que sea un respaldo válido de TypifyPro.",
                "error"
            );
        }
    };
    reader.readAsText(file);
}

export function clearAllData() {
    showConfirmModal(
        "Borrar Todo",
        "¡ADVERTENCIA! ¿Estás seguro de borrar TODOS los datos? Esta acción NO se puede deshacer.",
        () => {
            localStorage.clear();
            // Success Message via Modal
            showMessageModal(
                "Datos Borrados",
                "Todos los datos han sido eliminados correctamente. La aplicación se reiniciará.",
                "success",
                () => {
                    location.reload();
                }
            );
        }
    );
}

export function applyTheme(themeName) {
    if (window.UIModule && window.UIModule.applyTheme) {
        window.UIModule.applyTheme(themeName);
    } else {
        console.error("UIModule not loaded or applyTheme missing");
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('importFileInput');
    if (input) {
        input.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                importAllData(e.target.files[0]);
                e.target.value = '';
            }
        });
    }
});

window.SettingsModule = {
    exportAllData,
    importAllData,
    clearAllData,
    applyTheme
};
