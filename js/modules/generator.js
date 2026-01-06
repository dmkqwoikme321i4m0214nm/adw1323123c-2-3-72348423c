/**
 * TypifyPro 3.0 - Generator Module
 * Handles form rendering and observation generation
 */

// Field Definitions
const FIELDS = {
    MINIMAL: [
        { id: "clienteId", label: "ID", type: "text", required: true, placeholder: "123456789", hover: "Ej: 123456789" },
        { id: "clienteNombre", label: "Nombre Cliente", type: "text", required: true, placeholder: "Juan Pérez", hover: "Ej: Juan Pérez" },
        { id: "clienteRUT", label: "RUT", type: "text", required: true, placeholder: "12.345.678-9", hover: "Ej: 12.345.678-9" },
        { id: "clienteTelefono", label: "Teléfono", type: "tel", required: true, placeholder: "+569...", hover: "Ej: +56912345678" },
        { id: "clienteContrato", label: "Contrato", type: "text", required: true, placeholder: "N° Contrato", hover: "Ej: MTC24/152465" },
        { id: "clienteCorreo", label: "Correo", type: "email", required: true, placeholder: "correo@ejemplo.com", hover: "Ej: correo@ejemplo.com" }
    ],
    COMMON: [
        { id: "clienteDireccion", label: "Dirección", type: "text", required: true, placeholder: "Dirección completa del domicilio del cliente", hover: "Ej: Calle Falsa 123, Comuna, Ciudad" },
        { id: "clienteONT", label: "ONT", type: "text", required: true, placeholder: "Serial Number (S/N) o MAC de la ONT", hover: "Ej: ABC123456789" },
        { id: "clienteOLT", label: "OLT", type: "text", required: true, placeholder: "Nombre o identificación de la OLT", hover: "Ej: OLT-01" },
        { id: "clienteTarjeta", label: "Tarjeta", type: "text", required: true, placeholder: "Slot o tarjeta física en el equipo", hover: "Ej: Tarjeta 1" },
        { id: "clientePuerto", label: "Puerto", type: "text", required: true, placeholder: "Puerto asignado en la tarjeta", hover: "Ej: Puerto 5" },
        { id: "clienteNodo", label: "Nodo", type: "text", required: true, placeholder: "Nodo o zona técnica de conexión", hover: "Ej: NODO-XYZ" }
    ]
};

// Save form data to localStorage
function saveFormData() {
    const container = document.getElementById('typificationForm');
    if (!container) return;

    const formData = {};
    const inputs = container.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        if (input.id) {
            formData[input.id] = input.value;
        }
    });

    // Also save the observation textarea if it exists
    const obsForm = document.getElementById('observacionForm');
    if (obsForm) {
        formData['observacionForm'] = obsForm.value;
    }

    localStorage.setItem('typificationFormData', JSON.stringify(formData));
    console.log('Form data saved to localStorage');
}

// Load form data from localStorage
function loadFormData() {
    const savedData = localStorage.getItem('typificationFormData');
    if (!savedData) return;

    try {
        const formData = JSON.parse(savedData);
        const container = document.getElementById('typificationForm');
        if (!container) return;

        Object.entries(formData).forEach(([fieldId, value]) => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.value = value;
            }
        });

        console.log('Form data loaded from localStorage');
    } catch (error) {
        console.error('Error loading form data from localStorage:', error);
    }
}

// Clear form data from localStorage
function clearSavedFormData() {
    localStorage.removeItem('typificationFormData');
    console.log('Form data cleared from localStorage');
}

// Render Form
function renderForm(type = 'Soporte') {
    const container = document.getElementById('typificationForm');
    if (!container) return;

    const typeSelector = document.getElementById('typificationType');
    const oldType = typeSelector?.dataset.lastType || '';

    // Capture CURRENT data before clearing
    const currentData = {};
    const existingInputs = container.querySelectorAll('input, select, textarea');
    existingInputs.forEach(input => {
        if (input.id) currentData[input.id] = input.value;
    });

    // PARITY: If switching from a manual entry mode (like Transferencia) to Soporte,
    // and there is content in the observation, we should offer to move it to "Soporte Generado" 
    // or do it automatically if it matches legacy expectations.
    // Logic for switching modes
    if (type === 'Soporte' && oldType && oldType !== 'Soporte') {
        // If coming from another mode and there is text, attempt to preserve it in GenObs
        if (currentData['observacionForm'] && currentData['observacionForm'].trim()) {
            const obsValue = currentData['observacionForm'].trim();
            const soporteField = document.getElementById('soporteGenerado');

            if (soporteField) {
                soporteField.value = obsValue;
            } else {
                window._pendingSoporteExtra = obsValue;
            }
            if (window.showToast) window.showToast("Observación movida a Soporte Generado", "info");
        } else {
            // Just notify change if appropriate
            if (window.showToast) window.showToast("Modo Soporte Técnico activado", "info");
        }
    } else if (type === 'Transferencia' && oldType === 'Soporte') {
        // Check if there is content to move (either in main preview or hidden in Soporte modal)
        let contentToMove = currentData['observacionForm'] ? currentData['observacionForm'].trim() : '';

        // If main preview is empty, check the hidden Soporte field
        if (!contentToMove) {
            const soporteField = document.getElementById('soporteGenerado');
            if (soporteField && soporteField.value.trim()) {
                contentToMove = soporteField.value.trim();
                // Update currentData so it renders in the new textarea
                currentData['observacionForm'] = contentToMove;
            }
        }

        if (contentToMove) {
            if (window.showToast) window.showToast("Observación movida a Transferencia", "info");
        } else {
            if (window.showToast) window.showToast("Modo Transferencia activado", "info");
        }
    }

    if (typeSelector) typeSelector.dataset.lastType = type;

    container.innerHTML = ''; // Clear previous

    let fields = [...FIELDS.MINIMAL];

    if (type === 'Soporte') {
        fields = [...fields, ...FIELDS.COMMON];
    }
    // 'Transferencia' and others use only MINIMAL fields

    // Generate HTML for Fields
    fields.forEach(field => {
        const div = document.createElement('div');
        div.className = 'form-group';

        let inputHtml = '';
        const savedValue = currentData[field.id] || '';

        if (field.type === 'select') {
            inputHtml = `
                <select id="${field.id}" ${field.required ? 'required' : ''} title="${field.hover || ''}">
                    <option value="" disabled ${!savedValue ? 'selected' : ''}>Seleccione...</option>
                    ${field.options.map(opt => `
                        <option value="${opt}" ${opt === savedValue ? 'selected' : ''}>${opt}</option>
                    `).join('')}
                </select>
            `;
        } else {
            inputHtml = `<input type="${field.type}" id="${field.id}" placeholder="${field.placeholder || ''}" ${field.required ? 'required' : ''} value="${savedValue}" title="${field.hover || ''}">`;
        }

        const labelHtml = `
            <label for="${field.id}">
                ${field.label} ${field.required ? '<span style="color:var(--danger-color)">*</span>' : ''}
            </label>
        `;

        div.innerHTML = `
            ${labelHtml}
            ${inputHtml}
        `;
        container.appendChild(div);
    });

    // Add Observation Area
    const obsDiv = document.createElement('div');
    obsDiv.className = 'form-group form-full-width';

    let obsHtml = `<label>Observación Adicional <span style="color:var(--danger-color)">*</span></label>`;
    const savedObs = currentData['observacionForm'] || '';

    if (type === 'Soporte') {
        // Read-only + Edit Button for GenObs
        obsHtml += `
            <div class="input-with-action">
                <textarea id="observacionForm" readonly placeholder="Utiliza el botón de editar para generar la observación completa...">${savedObs}</textarea>
                <button type="button" class="action-btn" onclick="openGenObsModal()" title="Generar Observación Final">
                    <span class="material-icons">edit</span>
                </button>
            </div>
        `;
    } else {
        // Editable + Template Search Button
        obsHtml += `
            <div class="input-with-action">
                <textarea id="observacionForm" placeholder="Escribe aquí o presiona F2 para buscar plantillas...">${savedObs}</textarea>
                <button type="button" class="action-btn" onclick="openTemplatesModal()" title="Buscar Plantillas (F2)">
                    <span class="material-icons">description</span>
                </button>
            </div>
        `;
    }

    obsDiv.innerHTML = obsHtml;
    container.appendChild(obsDiv);

    // Bind Shortcuts logic
    if (window.ShortcutsModule && window.ShortcutsModule.applyListeners) {
        window.ShortcutsModule.applyListeners(container);
    }

    // Special key binding for Templates (F2) in Transfer/Others mode
    if (type !== 'Soporte') {
        const obsArea = document.getElementById('observacionForm');
        if (obsArea) {
            obsArea.addEventListener('keydown', (e) => {
                if (e.key === "F2") {
                    e.preventDefault();
                    openTemplatesModal();
                }
            });
        }
    }

    // Load any saved data from localStorage after form is rendered
    setTimeout(() => {
        loadFormData();
    }, 100);
}

// Global functions for buttons
window.openGenObsModal = function () {
    const type = document.getElementById('typificationType')?.value || 'Soporte';
    const context = (type === 'Persiste' || type === 'Cliente Persiste') ? 'persiste' : 'sondeo';

    // Check if GenObs module is loaded
    if (window.GenObsModule && window.GenObsModule.open) {
        window.GenObsModule.open(context);
    } else {
        // Fallback or legacy modal ID
        const modal = document.getElementById('genobsModal');
        if (modal) modal.style.display = 'flex';
    }
};

window.openTemplatesModal = function () {
    const type = document.getElementById('typificationType')?.value || 'Soporte';
    if (window.TemplatesModule && window.TemplatesModule.open) {
        window.TemplatesModule.open(type);
    } else {
        const modal = document.getElementById('templatesModal');
        if (modal) modal.style.display = 'flex';
    }
};

// Generate Logic
function generate() {
    console.log('Iniciando generación...');
    const mainForm = document.getElementById('typificationForm');
    const genobsForm = document.getElementById('genobsForm');
    const type = document.getElementById('typificationType')?.value || 'Soporte';

    let isValid = true;

    // 1. Validate Main Form
    if (mainForm) {
        mainForm.querySelectorAll('input[required], select[required], textarea[required]').forEach(input => {
            if (!input.value.trim() || input.value === 'Seleccione') {
                input.style.border = "2px solid var(--danger-color)";
                isValid = false;
            } else {
                input.style.border = "";
            }
        });
    }

    if (!isValid) {
        console.error('Generación fallida: Campos incompletos');
        if (window.showNotification) window.showNotification("Por favor, complete los campos obligatorios.", "error");
        else alert("Por favor, complete los campos obligatorios.");
        return;
    }

    // Save form data before generating
    saveFormData();

    // Helpers
    const getVal = (id) => document.getElementById(id)?.value.trim() || '';

    // Build Output in "Original Project" Format
    // Order: NOMBRE, TARJETA, PUERTO, NODO, SOP LINE, RUT, CONTRATO, DIRECCION, ONT, OLT, CORREO, OBS
    let output = "";

    // 1. Name
    if (getVal('clienteNombre')) output += `NOMBRE: ${getVal('clienteNombre')}\n`;

    // 2. Tech Part 1
    const tarjeta = getVal('clienteTarjeta');
    const puerto = getVal('clientePuerto');
    if (tarjeta || puerto) output += `TARJETA/PUERTO: ${tarjeta}/${puerto}\n`;

    // Restore Nodo
    if (getVal('clienteNodo')) output += `NODO: ${getVal('clienteNodo')}\n`;
    // 3. SOP Line (Construct string but do not output as standalone header)
    const today = new Date();
    const formattedDate = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;

    let prefix = "SOP";
    const selectedTypification = localStorage.getItem("selectedTypification");
    if (selectedTypification === "Movil") prefix = "MOVIL";
    else if (selectedTypification === "SAC") prefix = "SAC";

    const sopLine = `${prefix} ${formattedDate} ID: ${getVal('clienteId')} TEL: ${getVal('clienteTelefono')}`;

    // 4. Contact & Contract (New Order: Correo, Contrato, RUT, Direccion)
    if (getVal('clienteCorreo')) output += `Correo: ${getVal('clienteCorreo')}\n`;
    if (getVal('clienteContrato')) output += `CONTRATO: ${getVal('clienteContrato')}\n`;
    if (getVal('clienteRUT')) output += `RUT: ${getVal('clienteRUT')}\n`;
    if (getVal('clienteDireccion')) output += `DIRECCION: ${getVal('clienteDireccion')}\n`;

    // 5. Tech Part 2 (ONT, OLT)
    if (getVal('clienteONT')) output += `ONT: ${getVal('clienteONT')}\n`;
    if (getVal('clienteOLT')) output += `OLT: ${getVal('clienteOLT')}\n`;

    // 6. Observation Body (SOP Line goes here now)
    let obsBody = document.getElementById('observacionForm').value.trim();

    // Clean existing OBS prefix from body if present to avoid duplication
    // (e.g. if GenObs generated "OBS: Desde...")
    obsBody = obsBody.replace(/^OBS:\s*/i, '');

    output += `OBS: ${sopLine}\n`;
    if (obsBody) {
        output += `${obsBody}`;
    }

    // Set output and Copy
    const preview = document.getElementById('outputPreview');
    if (preview) {
        preview.value = output;

        // Show survey buttons after successful generation
        const surveyButtonsContainer = document.getElementById('surveyButtonsContainer');
        if (surveyButtonsContainer) {
            surveyButtonsContainer.style.display = (type !== 'Transferencia') ? 'grid' : 'none';
        }

        // Automatic copy to clipboard
        copy();
        console.log('Generación exitosa.');
    }

    // --- Robust History Saving ---
    if (window.HistoryModule && window.HistoryModule.add) {
        // Capture ALL form data (Main + GenObs)
        const formData = {};

        // Collect from Dashboard
        if (mainForm) {
            mainForm.querySelectorAll('input, select, textarea').forEach(input => {
                if (input.id) formData[input.id] = input.value;
            });
        }

        // Collect from GenObs Modal
        if (genobsForm) {
            genobsForm.querySelectorAll('input, select, textarea').forEach(input => {
                if (input.id) formData[input.id] = input.value;
            });
            // Also collect support generated if present
            const soporte = document.getElementById('soporteGenerado');
            if (soporte) formData['soporteGenerado'] = soporte.value;
        }

        formData.type = type;
        formData.prefix = prefix;

        // Build survey/persiste URLs and save them to history
        let urlSondeo = null;
        let urlPersiste = null;

        // Only generate URLs for non-Transferencia types
        if (type !== 'Transferencia') {
            try {
                // Build Survey URL
                if (window.buildSurveyUrl) {
                    urlSondeo = window.buildSurveyUrl(formData);
                    if (urlSondeo) {
                        console.log('URL Sondeo generada para historial:', urlSondeo);
                    }
                }

                // Build Persiste URL
                if (window.buildSurveyPersisteUrl) {
                    urlPersiste = window.buildSurveyPersisteUrl(formData);
                    if (urlPersiste) {
                        console.log('URL Persiste generada para historial:', urlPersiste);
                    }
                }
            } catch (error) {
                console.warn('Error al generar URLs para historial:', error);
            }
        }

        const historyItem = {
            id: Date.now().toString(36),
            date: new Date().toISOString(),
            rut: getVal('clienteRUT'),
            nombre: getVal('clienteNombre'),
            telefono: getVal('clienteTelefono'),
            contrato: getVal('clienteContrato'),
            type: type,
            text: output,
            observation: obsBody,
            formData: formData,
            urlSondeo: urlSondeo,
            urlPersiste: urlPersiste
        };

        window.HistoryModule.add(historyItem);
        console.log('Guardado en historial con metadatos completos (incluyendo GenObs y URLs).');
    }

    // Log success
    if (window.LoggerModule) {
        window.LoggerModule.log(`Observación generada: ${type}`);
    }
}

// Copy Logic
function copy() {
    const text = document.getElementById('outputPreview');
    if (text && text.value) {
        navigator.clipboard.writeText(text.value).then(() => {
            console.log('Copiado al portapapeles');
            // PARITY: Show the legacy-style copy success modal
            if (window.openModal) {
                window.openModal('copySuccessModal');
            } else if (window.showToast) {
                window.showToast('Observación copiada al portapapeles', 'success');
            }
        }).catch(err => {
            console.error('Error al copiar', err);
            if (window.showToast) {
                window.showToast('Error al copiar al portapapeles', 'error');
            }
        });
    }
}

// Clear Logic
function clearForm() {
    // 1. Reset the main form inputs
    const form = document.getElementById('typificationForm');
    if (form) {
        form.reset();
        // Specifically clear textareas and inputs that might not react to reset() due to dynamic injection
        form.querySelectorAll('input, textarea, select').forEach(el => {
            if (el.tagName === 'SELECT') {
                el.selectedIndex = 0;
            } else {
                el.value = '';
            }
        });
    }

    // 2. Clear the main output preview
    const preview = document.getElementById('outputPreview');
    if (preview) preview.value = '';

    // 3. Clear GenObs modal data if available
    if (window.GenObsModule && window.GenObsModule.clear) {
        window.GenObsModule.clear();
    }

    // 4. Hide survey buttons
    const surveyButtonsContainer = document.getElementById('surveyButtonsContainer');
    if (surveyButtonsContainer) {
        surveyButtonsContainer.style.display = 'none';
    }

    // 5. Clear saved form data from localStorage
    clearSavedFormData();

    if (window.showToast) {
        window.showToast('Formulario y observación limpiados', 'info');
    }

    console.log('Formulario y módulos de observación limpiados por completo.');
}

// Survey Generation
function generateSurvey() {
    console.log('Generando sondeo...');

    if (!window.buildSurveyUrl) {
        alert('El módulo de sondeo no está cargado.');
        return;
    }

    const surveyUrl = window.buildSurveyUrl();

    if (surveyUrl) {
        window.construirYEnviarSondeo(surveyUrl);
        window.openModal('surveyModal');
        console.log('Sondeo generado exitosamente');

        if (window.LoggerModule) {
            window.LoggerModule.log('Sondeo generado');
        }
    } else {
        console.error('Error al generar URL de sondeo');
    }
}

// Survey Persiste Generation
function generateSurveyPersiste() {
    console.log('Generando cliente persiste...');

    if (!window.buildSurveyPersisteUrl) {
        alert('El módulo de cliente persiste no está cargado.');
        return;
    }

    const surveyUrl = window.buildSurveyPersisteUrl();

    if (surveyUrl) {
        window.construirYEnviarSondeoPersiste(surveyUrl);
        window.openModal('surveyPersisteModal');
        console.log('Cliente persiste generado exitosamente');

        if (window.LoggerModule) {
            window.LoggerModule.log('Cliente persiste generado');
        }
    } else {
        console.error('Error al generar URL de cliente persiste');
    }
}


// Init
window.renderForm = renderForm;
window.generate = generate;
window.copy = copy;
window.clearForm = clearForm;
window.generateSurvey = generateSurvey;
window.generateSurveyPersiste = generateSurveyPersiste;

// Default render
document.addEventListener('DOMContentLoaded', () => {
    renderForm('Soporte');
    // Load any saved data when the page loads
    setTimeout(() => {
        loadFormData();
    }, 200);
});