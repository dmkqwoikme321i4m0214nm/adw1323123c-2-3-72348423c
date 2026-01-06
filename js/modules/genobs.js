/**
 * TypifyPro 3.0 - GenObs Module
 * Handles "Generar Observación Final" logic matching Legacy Project
 */

const GENOBS_FIELDS = [
    { id: "tiempoFalla", label: "¿Desde cuándo presenta la falla?", type: "datetime-local", required: true, category: "common" },
    { id: "suministroElectrico", label: "¿Tiene suministro eléctrico?", type: "select", options: ["SI", "NO", "N/A"], required: true, category: "common" },
    { id: "generadorElectrico", label: "¿Tiene generador eléctrico?", type: "select", options: ["SI", "NO", "N/A"], required: true, category: "common" },
    { id: "tipoServicio", label: "Tipo de Servicio (Sondeo)", type: "select", options: ["INTERNET", "TV HD", "VOZ IP", "MUNDO GO", "3 MUNDOS (Todos los servicios)", "MOVIL"], required: true, onChange: "handleServiceChange", category: "sondeo" },
    { id: "tipoServicioGeneral", label: "Tipo de servicio (Cliente Persiste)", type: "select", options: ["INTERNET", "TV HD", "VOZ IP", "MUNDO GO", "2 MUNDOS (INTERNET + TV)", "2 MUNDOS (INTERNET + TELEFONIA)", "2 MUNDOS (INTERNET + MUNDO GO)", "3 MUNDOS (INTERNET + MUNDO GO + TELEFONIA)"], required: true, category: "persiste" },
    { id: "motivoComunicacion", label: "¿Por qué se comunica el cliente?", type: "select", options: ["Por servicio de internet", "Por servicio de tv", "Por servicio de fono", "Incumplimiento visita", "Otros:"], required: true, onChange: "handleMotivoComunicacionChange", category: "common" },
    { id: "motivoComunicacionOtros", label: "Especifique otro motivo:", type: "text", required: false, placeholder: "Especifique el motivo", hidden: true, category: "common" },

    // TV Switch (Specific for 3 Mundos / Mundo Go)
    { id: "fallaTvSwitch", label: "¿Tiene fallas en TV?", type: "checkbox", required: false, hidden: true, onChange: "handleTvSwitchChange", category: "common" },

    { id: "instalacionReparacion", label: "¿Inconvenientes en instalación o reparación?", type: "select", options: ["No", "No realizo el soporte", "No dio solucion al inconveniente", "Incumplimiento visita", "Tuvo alguna discusion con el tecnico", "Instalacion deficiente", "Ont en estado desconocido", "Otros"], required: true, category: "sondeo" },
    { id: "clienteReincidente", label: "¿El cliente es reincidente?", type: "select", options: ["Por servicio de internet", "Por servicio de tv", "Por servicio de fono", "Incumplimiento visita", "N/A"], required: true, category: "sondeo" },
    { id: "estadoLuces", label: "¿Estado de las luces de la ONT?", type: "select", options: ["Luces Verdes (sin intermitencia)", "Luz Roja (LOS)", "Luz (Power encendida) Sola", "Luz Pon (Intermitente)", "Sin Luces encendidas in la (ONT)"], required: true, category: "common" },
    { id: "estadoOnt", label: "Estado de la ONT (Sondeo):", type: "select", options: ["Conectado", "Conectado con pérdida de monitoreo", "Desconocido", "Autofind", "Offline", "Power Off"], required: true, category: "sondeo" },
    { id: "clienteMasiva", label: "¿Cliente dentro de una masiva?", type: "select", options: ["Sí", "No"], required: true, category: "common" },
    { id: "fallaMasiva", label: "¿Posible falla masiva?", type: "select", options: ["Sí", "No"], required: true, category: "common" },
    { id: "visitaTecnica", label: "¿Corresponde visita técnica?", type: "select", options: ["Sí", "No"], required: true, category: "common" },
    { id: "perdidaMonitoreo", label: "¿Tiene pérdida de monitoreo?", type: "select", options: ["SI", "NO"], required: true, category: "common" },
    { id: "clienteConectadoPor", label: "El cliente se encuentra conectado por:", type: "select", options: ["WIFI", "POR CABLE DE RED", "WIFI Y CABLE DE RED"], required: true, category: "persiste" },
    { id: "estadoOntPersiste", label: "Estado de la ONT (Persiste):", type: "select", options: ["CONECTADO", "DESCONOCIDO", "AUTOFIND", "OFFLINE", "POWEROFF", "LOS"], required: true, category: "persiste" },
    { id: "redesUnificadas", label: "¿Redes unificadas?", type: "select", options: ["SI", "EL CLIENTE SOLICITA QUE SE LE DEJEN SEPARADAS", "Otros:"], required: true, onChange: "handleRedesUnificadasChange", category: "persiste" },
    { id: "redesUnificadasOtros", label: "Especificar motivo de Redes Unificadas:", type: "text", required: false, placeholder: "Ingrese el motivo...", hidden: true, category: "persiste" }
];

const COMMON_TV_FIELDS = [
    { id: "controlRemoto", label: "¿El control remoto funciona en su totalidad?", type: "select", options: ["SI", "NO"], required: true },
    { id: "cambioPilas", label: "¿Se realizaron cambios de pilas del control remoto?", type: "select", options: ["SI", "NO"], required: true },
    { id: "pruebaCruzada", label: "¿Se hizo prueba cruzada?", type: "select", options: ["SI", "NO"], required: true }
];

const EXTENDED_TV_FIELDS = [
    { id: "decodificador", label: "¿El decodificador enciende?", type: "select", options: ["SI", "NO"], required: true },
    { id: "reinicioElectrico", label: "¿Se realizó reinicio eléctrico?", type: "select", options: ["SI", "NO"], required: true },
    { id: "cableHDMIAV", label: "¿El cable HDMI/AV está bien conectado?", type: "select", options: ["SI", "NO"], required: true },
    { id: "observacionTV", label: "Observación TV:", type: "textarea", required: true, placeholder: "Ingrese observación de TV..." }
];

class GenObsModule {
    constructor() {
        this.formId = 'genobsForm';
        this.previewId = 'genobsPreviewText';
        this.modalId = 'genobsModal';
        this.context = 'sondeo'; // 'sondeo' or 'persiste'
    }

    init() {
        this.render();
        // Restore data immediately so it's ready for generation even if modal isn't opened
        this.restoreDataFromStorage();
    }

    render() {
        const form = document.getElementById(this.formId);
        if (!form) return;
        form.innerHTML = '';

        // Helper to create a section
        const createSection = (title, fieldIds) => {
            const sectionFields = GENOBS_FIELDS.filter(f => fieldIds.includes(f.id));
            if (sectionFields.length === 0) return null;

            const section = document.createElement('div');
            section.className = 'modal-section-card';

            if (title) {
                const header = document.createElement('div');
                header.className = 'section-header';
                header.innerHTML = `<h4>${title}</h4>`;
                section.appendChild(header);
            }

            const gridDiv = document.createElement('div');
            gridDiv.className = 'question-grid';

            this.createFields(gridDiv, sectionFields);

            section.appendChild(gridDiv);
            return section;
        };

        // Group 1: General & Time (Fault time first as requested)
        const s1 = createSection('Datos Generales', ['tiempoFalla', 'suministroElectrico', 'generadorElectrico']);
        if (s1) form.appendChild(s1);

        // Group 2: Service Info
        const serviceSection = createSection('Información del Servicio', ['tipoServicio', 'tipoServicioGeneral', 'motivoComunicacion', 'motivoComunicacionOtros']);
        if (serviceSection) {
            const tvSwitchField = GENOBS_FIELDS.find(f => f.id === 'fallaTvSwitch');
            if (tvSwitchField) {
                const div = document.createElement('div');
                this.createFields(div, [tvSwitchField]);
                if (div.firstElementChild) serviceSection.querySelector('.question-grid').appendChild(div.firstElementChild);
            }
            form.appendChild(serviceSection);
        }

        // Group 3: Technical Status
        const s3 = createSection('Estado Técnico', ['estadoOnt', 'estadoLuces', 'clienteConectadoPor', 'estadoOntPersiste', 'perdidaMonitoreo']);
        if (s3) form.appendChild(s3);

        // Group 4: Masivas & Visita
        const s4 = createSection('Masivas y Visita Técnica', ['clienteMasiva', 'fallaMasiva', 'visitaTecnica']);
        if (s4) form.appendChild(s4);

        // Group 5: context
        const s5 = createSection('Contexto Cliente', ['instalacionReparacion', 'clienteReincidente']);
        if (s5) form.appendChild(s5);

        // Group 6: Redes
        const s6 = createSection('Configuración de Red', ['redesUnificadas', 'redesUnificadasOtros']);
        if (s6) form.appendChild(s6);

        // TV Container (Dynamic)
        const tvDiv = document.createElement('div');
        tvDiv.id = 'tvQuestions';
        tvDiv.className = 'modal-section-card tv-section hidden';

        tvDiv.innerHTML = `
            <div class="section-header">
                <h4><i class="material-icons">tv</i> Preguntas de TV</h4>
            </div>
            <div id="commonTvQuestions" class="question-grid"></div>
            <div id="extendedTvQuestions" class="question-grid extended-tv"></div>
        `;

        form.appendChild(tvDiv);
        this.createFields(tvDiv.querySelector('#commonTvQuestions'), COMMON_TV_FIELDS);
        this.createFields(tvDiv.querySelector('#extendedTvQuestions'), EXTENDED_TV_FIELDS);

        // Bind Events (Re-bind because elements were recreated)
        this.bindEvents();
    }

    bindEvents() {
        const on = (id, event, handler) => {
            const el = document.getElementById(id);
            if (el) el.addEventListener(event, (e) => handler(e.target.value || e.target.checked));
        };

        on('tipoServicio', 'change', (v) => this.handleServiceChange(v));
        on('tipoServicioGeneral', 'change', (v) => this.handleServiceChange(v));
        on('motivoComunicacion', 'change', (v) => this.handleMotivoComunicacionChange(v));
        on('redesUnificadas', 'change', (v) => this.handleRedesUnificadasChange(v));

        const tvSwitch = document.getElementById('fallaTvSwitch');
        if (tvSwitch) {
            tvSwitch.addEventListener('change', (e) => this.handleTvSwitchChange(e.target.checked));
        }

        // Double-click to close datetime picker
        const tiempoFallaInput = document.getElementById('tiempoFalla');
        if (tiempoFallaInput) {
            let clickCount = 0;
            let clickTimer = null;

            // Track clicks on the input
            tiempoFallaInput.addEventListener('click', () => {
                clickCount++;

                if (clickCount === 1) {
                    clickTimer = setTimeout(() => {
                        clickCount = 0;
                    }, 500); // Reset after 500ms
                } else if (clickCount === 2) {
                    clearTimeout(clickTimer);
                    clickCount = 0;
                    // Close picker on double click
                    setTimeout(() => {
                        tiempoFallaInput.blur();
                    }, 100);
                }
            });

            // Also close on change event (when date is selected)
            tiempoFallaInput.addEventListener('change', () => {
                if (clickCount >= 1) {
                    setTimeout(() => {
                        tiempoFallaInput.blur();
                    }, 100);
                }
            });
        }

        // Initialize Time Pickers (Removed custom picker for standard datetime-local)
    }


    createFields(container, fields) {
        fields.forEach(field => {
            const div = document.createElement('div');
            div.className = 'form-group-modern';
            div.id = `group-${field.id}`;
            if (field.hidden) {
                div.classList.add('hidden'); // Replaced style.display = 'none'
            }

            let inputHtml = '';
            if (field.type === 'select') {
                inputHtml = `<select id="${field.id}" ${field.required ? 'required' : ''}>
                    <option value="">Seleccione...</option>
                    ${field.options.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
                </select>`;
            } else if (field.type === 'textarea') {
                inputHtml = `<textarea id="${field.id}" placeholder="${field.placeholder || ''}" ${field.required ? 'required' : ''}></textarea>`;
            } else if (field.type === 'checkbox') {
                inputHtml = `
                    <label class="switch-modern">
                        <input type="checkbox" id="${field.id}">
                        <span class="slider round"></span>
                    </label>
                 `;
            } else if (field.type === 'time') {
                inputHtml = `
                    <div class="modern-time-picker" id="time-picker-${field.id}">
                        <input type="text" id="${field.id}" placeholder="HH:MM" maxlength="5" ${field.required ? 'required' : ''} autocomplete="off">
                        <div class="time-dropdown hidden" id="dropdown-${field.id}">
                            <div class="time-column hours-column">
                                ${Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0')).map(h => `<div class="time-option" data-unit="hour" data-value="${h}">${h}</div>`).join('')}
                            </div>
                            <div class="time-column minutes-column">
                                ${Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0')).map(m => `<div class="time-option" data-unit="minute" data-value="${m}">${m}</div>`).join('')}
                            </div>
                        </div>
                    </div>
                `;
            } else {
                // Para datetime-local, asegurarnos de que funcione correctamente
                if (field.type === 'datetime-local') {
                    // Agregar evento para mostrar la hora seleccionada
                    inputHtml = `<input type="${field.type}" id="${field.id}" ${field.required ? 'required' : ''} step="60" onchange="window.updateDateTimeDisplay('${field.id}')">`;
                } else {
                    inputHtml = `<input type="${field.type || 'text'}" id="${field.id}" placeholder="${field.placeholder || ''}" ${field.required ? 'required' : ''}>`;
                }
            }

            if (field.type === 'checkbox') {
                div.classList.add('flex-row');
                div.innerHTML = `
                    <label for="${field.id}">${field.label}</label>
                    ${inputHtml}
                `;
            } else {
                div.innerHTML = `
                    <label for="${field.id}">${field.label} ${field.required ? '<span class="required-star">*</span>' : ''}</label>
                    ${inputHtml}
                    ${field.type === 'datetime-local' ? '<small class="help-text">Seleccione fecha y hora (incluye AM/PM)</small><div id="' + field.id + '-display" class="datetime-display"></div>' : ''}
                `;
            }
            container.appendChild(div);
        });
    }

    handleServiceChange(value) {
        const tvQuestions = document.getElementById('tvQuestions');
        const tresMundosSwitch = document.getElementById('group-fallaTvSwitch');

        if (!tvQuestions || !tresMundosSwitch) return;

        // Hide all conditional sections by default
        tvQuestions.classList.add('hidden');
        tresMundosSwitch.classList.add('hidden');

        const commonTvQuestions = document.getElementById('commonTvQuestions');
        const extendedTvQuestions = document.getElementById('extendedTvQuestions');

        if (value === "TV HD") {
            tvQuestions.classList.remove('hidden');
            if (commonTvQuestions) commonTvQuestions.classList.remove('hidden');
            if (extendedTvQuestions) {
                extendedTvQuestions.classList.add('hidden');
                // Clear extended fields
                const extendedFields = ['decodificador', 'reinicioElectrico', 'cableHDMIAV', 'observacionTV'];
                extendedFields.forEach((id) => {
                    const el = document.getElementById(id);
                    if (el) el.value = '';
                });
            }
        } else if (value === "Peliculas") {
            tvQuestions.classList.remove('hidden');
            if (commonTvQuestions) commonTvQuestions.classList.remove('hidden');
            if (extendedTvQuestions) extendedTvQuestions.classList.remove('hidden');
        } else if (value === "3 MUNDOS (Todos los servicios)" || value === "MUNDO GO") {
            tresMundosSwitch.classList.remove('hidden');
            // Also check the switch state in case it was already checked
            this.handleTvSwitchChange(document.getElementById('fallaTvSwitch')?.checked || false);
        }
    }

    handleTvSwitchChange(isChecked) {
        const contextServiceId = this.context === 'sondeo' ? 'tipoServicio' : 'tipoServicioGeneral';
        const tipoServicio = document.getElementById(contextServiceId)?.value;
        const tvQuestionsContainer = document.getElementById('tvQuestions');
        const fallaTvSwitch = document.getElementById('fallaTvSwitch');
        const commonTvQuestions = document.getElementById('commonTvQuestions');
        const extendedTvQuestions = document.getElementById('extendedTvQuestions');

        if (!tvQuestionsContainer || !fallaTvSwitch) return;

        if (isChecked) {
            tvQuestionsContainer.classList.remove('hidden');
            if (tipoServicio === "3 MUNDOS (Todos los servicios)" || tipoServicio === "Peliculas") {
                if (commonTvQuestions) commonTvQuestions.classList.remove('hidden');
                if (extendedTvQuestions) extendedTvQuestions.classList.remove('hidden');
            } else if (tipoServicio === "MUNDO GO" || tipoServicio === "TV HD" || tipoServicio.includes("MUNDO GO")) {
                if (commonTvQuestions) commonTvQuestions.classList.remove('hidden');
                if (extendedTvQuestions) {
                    extendedTvQuestions.classList.add('hidden');
                    const extendedFields = ['decodificador', 'reinicioElectrico', 'cableHDMIAV', 'observacionTV'];
                    extendedFields.forEach((id) => {
                        const el = document.getElementById(id);
                        if (el) el.value = '';
                    });
                }
            }
        } else {
            tvQuestionsContainer.classList.add('hidden');
            const allTvFields = ['controlRemoto', 'cambioPilas', 'pruebaCruzada', 'decodificador', 'reinicioElectrico', 'cableHDMIAV', 'observacionTV'];
            allTvFields.forEach((id) => {
                const el = document.getElementById(id);
                if (el) el.value = '';
            });
        }
    }

    handleMotivoComunicacionChange(value) {
        const group = document.getElementById('group-motivoComunicacionOtros');
        const input = document.getElementById('motivoComunicacionOtros');
        if (value === 'Otros:') {
            if (group) group.classList.remove('hidden');
            if (input) input.required = true;
        } else {
            if (group) group.classList.add('hidden');
            if (input) {
                input.required = false;
                input.value = '';
            }
        }
    }

    handleRedesUnificadasChange(value) {
        const group = document.getElementById('group-redesUnificadasOtros');
        const input = document.getElementById('redesUnificadasOtros');
        if (value === 'Otros:') {
            if (group) group.classList.remove('hidden');
            if (input) input.required = true;
        } else {
            if (group) group.classList.add('hidden');
            if (input) {
                input.required = false;
                input.value = '';
            }
        }
    }


    applyContextFiltering() {
        // PARITY: Legacy showed all questions except conditional sub-sections
        GENOBS_FIELDS.forEach(field => {
            const group = document.getElementById(`group-${field.id}`);
            if (!group) return;

            // Show all core fields, only hide sub-fields explicitly marked hidden
            if (!field.hidden) {
                group.classList.remove('hidden');
            } else {
                group.classList.add('hidden');
            }
        });

        // Trigger current selection logic for conditional fields
        this.handleServiceChange(document.getElementById('tipoServicio')?.value || '');
        this.handleMotivoComunicacionChange(document.getElementById('motivoComunicacion')?.value || '');
        this.handleRedesUnificadasChange(document.getElementById('redesUnificadas')?.value || '');

        // Ensure "fallaTvSwitch" is only shown for 3 MUNDOS/MUNDO GO
        const tipoServicio = document.getElementById(this.context === 'sondeo' ? 'tipoServicio' : 'tipoServicioGeneral')?.value || '';
        const tresMundosSwitch = document.getElementById('group-fallaTvSwitch');

        if (tresMundosSwitch) {
            if (tipoServicio === "3 MUNDOS (Todos los servicios)" || tipoServicio.includes("MUNDO GO")) {
                tresMundosSwitch.classList.remove('hidden');
            } else {
                tresMundosSwitch.classList.add('hidden');
                // Force switch off and hide TV questions if service doesn't support them
                const s = document.getElementById('fallaTvSwitch');
                if (s) s.checked = false;
                this.handleTvSwitchChange(false);
            }
        }
    }


    apply() {
        // Collect technical support text
        const soporteField = document.getElementById('soporteGenerado');
        const supportVal = soporteField ? soporteField.value.trim() : '';

        // Validate support content
        if (!supportVal) {
            if (window.showToast) {
                window.showToast('El campo de "Soporte generado" está vacío.', 'warning');
            } else {
                alert('El campo de "Soporte generado" está vacío. Por favor ingrese el detalle del soporte.');
            }
            window.switchTab('genobs', 'soporte');
            return;
        }

        // Generate observation body (Questions + Support)
        // Note: Headers (Name, SOP, etc.) are handled by the main generator (generator.js)
        const questionsText = this.generateQuestionsText();
        const finalText = `${questionsText}Soporte Generado: ${supportVal}`;

        const mainObs = document.getElementById('observacionForm'); // Main form in dashboard
        if (mainObs) {
            mainObs.value = finalText;

            // Trigger input event for validation/resizing
            mainObs.dispatchEvent(new Event('input', { bubbles: true }));

            if (window.showToast) {
                window.showToast('Observación final aplicada exitosamente', 'success');
            }

            // Close modal
            const modal = document.getElementById('genobsModal');
            if (modal) modal.style.display = 'none';

            // Switch to main tab
            if (window.switchTab) {
                window.switchTab('main', 'form');
            }
        }
    }

    generateHeaderInfo() {
        // Get data from the main form fields that were already collected
        const formDataForSurvey = window.formDataForSurvey || {};

        let header = "";

        // Helper to add line if exists
        const addLine = (label, key) => {
            if (formDataForSurvey[key] && formDataForSurvey[key] !== '') {
                header += `${label}: ${formDataForSurvey[key]}\n`;
            }
        };

        // 1. NOMBRE
        addLine("NOMBRE", "NOMBRE");
        // 2. TARJETA
        addLine("TARJETA", "TARJETA");
        // 3. PUERTO
        addLine("PUERTO", "PUERTO");
        // 4. NODO
        addLine("NODO", "NODO");

        // 5. SOP Line
        const today = new Date();
        const formattedDate = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;
        const selectedTypification = localStorage.getItem("selectedTypification");
        let sopPrefix = "SOP";
        if (selectedTypification === "Movil") {
            sopPrefix = "MOVIL";
        } else if (selectedTypification === "SAC") {
            sopPrefix = "SAC";
        }

        let sopLine = `${sopPrefix} ${formattedDate}`;
        if (formDataForSurvey['ID_CLIENTE'] && formDataForSurvey['ID_CLIENTE'] !== '') sopLine += ` ID: ${formDataForSurvey['ID_CLIENTE']}`;
        if (formDataForSurvey['TELÉFONO'] && formDataForSurvey['TELÉFONO'] !== '') sopLine += ` TEL: ${formDataForSurvey['TELÉFONO']}`;
        header += `${sopLine}\n`;

        // 6. Correo
        addLine("Correo", "CORREO");
        // 7. CONTRATO
        addLine("CONTRATO", "CONTRATO");
        // 8. RUT
        addLine("RUT", "RUT");
        // 9. DIRECCION
        addLine("DIRECCION", "DIRECCIÓN CLIENTE");
        // 10. ONT
        addLine("ONT", "ONT");
        // 11. OLT
        addLine("OLT", "OLT");

        return header;
    }

    generateQuestionsText() {
        const getVal = (id) => {
            const el = document.getElementById(id);
            if (!el) return '';
            const group = document.getElementById(`group-${id}`);
            if (group && group.classList.contains('hidden')) return ''; // Don't include hidden fields
            return el.value || '';
        };

        const hasVal = (id) => {
            const val = getVal(id);
            return val && val !== '' && val !== 'Seleccione...';
        };

        let text = "";

        // 12. OBS: Desde Cuando Presenta la Falla
        const tiempoFalla = getVal('tiempoFalla');
        if (tiempoFalla) {
            // Use raw value to match user request example (2026-01-05T12:07) or format it?
            // User example: OBS: Desde Cuando Presenta la Falla:2026-01-05T12:07
            // We will stick to the user's requested format (Raw from input)
            text += `OBS: Desde Cuando Presenta la Falla:${tiempoFalla}\n`;
        } else {
            text += `OBS: \n`;
        }

        // Questions List
        if (hasVal('suministroElectrico')) text += `Tiene Suministro Eléctrico ?: ${getVal('suministroElectrico')}\n`;
        if (hasVal('generadorElectrico')) text += `Tiene Generador Electrico ?: ${getVal('generadorElectrico')}\n`;

        // Estado ONT
        // Note: sondeo uses 'estadoOnt', persiste uses 'estadoOntPersiste'
        // User example asks for "Estado ONT:Conectado". We should use the visible one.
        if (this.context === 'sondeo' && hasVal('estadoOnt')) {
            text += `Estado ONT:${getVal('estadoOnt')}\n`;
        } else if (this.context === 'persiste' && hasVal('estadoOntPersiste')) {
            text += `Estado ONT:${getVal('estadoOntPersiste')}\n`;
        }

        if (hasVal('clienteMasiva')) text += `Cliente Masiva:${getVal('clienteMasiva')}\n`;
        if (hasVal('fallaMasiva')) text += `Falla Masiva:${getVal('fallaMasiva')}\n`;
        if (hasVal('visitaTecnica')) text += `Visita Técnica:${getVal('visitaTecnica')}\n`;

        // Perdida Monitoreo (Single source of truth)
        if (hasVal('perdidaMonitoreo')) text += `Tiene perdida de monitoreo: ${getVal('perdidaMonitoreo')}\n`;

        // TV Section - only if TV questions are visible
        const tvContainer = document.getElementById('tvQuestions');
        if (tvContainer && !tvContainer.classList.contains('hidden')) {
            // Common TV Questions
            if (hasVal('controlRemoto')) text += `¿El control remoto funciona en su totalidad?: ${getVal('controlRemoto')}\n`;
            if (hasVal('cambioPilas')) text += `¿Se realizaron cambios de pilas del control remoto?: ${getVal('cambioPilas')}\n`;
            if (hasVal('pruebaCruzada')) text += `¿Se hizo prueba cruzada?: ${getVal('pruebaCruzada')}\n`;

            // Extended TV Questions
            if (hasVal('decodificador')) text += `¿El decodificador enciende?: ${getVal('decodificador')}\n`;
            if (hasVal('reinicioElectrico')) text += `¿Se realizó reinicio eléctrico?: ${getVal('reinicioElectrico')}\n`;
            if (hasVal('cableHDMIAV')) text += `¿El cable HDMI/AV está bien conectado?: ${getVal('cableHDMIAV')}\n`;

            if (hasVal('observacionTV')) text += `Observación TV: ${getVal('observacionTV')}\n`;
        }

        // Final Sanitize: Ensure no accidental SOP/MOVIL/SAC lines crept into the body
        // This addresses the user report of: "OBS: SOP 6/1/2026" appearing inside the questions
        text = text.replace(/^OBS:\s*(SOP|MOVIL|SAC).*\n?/gim, "");
        text = text.replace(/^(SOP|MOVIL|SAC)\s+\d{1,2}\/\d{1,2}\/\d{4}.*\n?/gim, "");

        return text;
    }

    generateText() {
        // This function should not be used for duplicating questions in the legacy way
        // The legacy approach builds the observation differently
        return "";
    }

    validate() {
        const form = document.getElementById(this.formId);
        if (!form) return false;

        const inputs = form.querySelectorAll('input, select, textarea');
        let isValid = true;
        let firstInvalid = null;

        inputs.forEach(input => {
            // Skip logic for hidden fields
            if (input.closest('.form-group-modern') && input.closest('.form-group-modern').classList.contains('hidden')) return;
            if (input.closest('#tvQuestionsContainer') && input.closest('#tvQuestionsContainer').classList.contains('hidden')) return;
            if (input.closest('.hidden')) return; // General check
            if (input.closest('#commonTvQuestions') && input.closest('#commonTvQuestions').style.display === 'none') return;
            if (input.closest('#extendedTvQuestions') && input.closest('#extendedTvQuestions').style.display === 'none') return;

            // Validate Logic match Legacy: Check empty string OR "Seleccione"
            const val = input.value.trim();
            if (input.hasAttribute('required') && (!val || val === 'Seleccione')) {
                input.style.border = '2px solid var(--danger-color)';
                isValid = false;
                if (!firstInvalid) firstInvalid = input;
            } else {
                input.style.border = '';
            }
        });

        if (!isValid) {
            // Use legacy-style notification if available, else alert
            if (window.showNotification) {
                window.showNotification("Por favor complete todos los campos obligatorios.", "error");
            } else {
                alert("Por favor complete todos los campos obligatorios.");
            }
            if (firstInvalid) firstInvalid.focus();
        }
        return isValid;
    }

    open(context = null) {
        // Ensure latest data from main form is collected
        if (window.collectSurveyData) {
            window.collectSurveyData();
        }

        const modal = document.getElementById(this.modalId);
        if (modal) modal.style.display = 'flex';

        // Set context: provided, or from localStorage, or default
        if (context) {
            this.context = context;
        } else {
            const typif = localStorage.getItem("selectedTypification");
            this.context = (typif === 'Persiste' || typif === 'Cliente Persiste') ? 'persiste' : 'sondeo';
        }

        // Get existing field values BEFORE init to preserve values during field recreation
        const existingData = this.getExistingFieldValues();

        this.init();
        this.applyContextFiltering();

        // PARITY: Handle pending support text from typification switch
        if (window._pendingSoporteExtra) {
            const soporteField = document.getElementById('soporteGenerado');
            if (soporteField) {
                soporteField.value = window._pendingSoporteExtra;
                delete window._pendingSoporteExtra;
            }
        }

        // Restore the existing data after fields are recreated
        this.restoreFieldValues(existingData);

        // Load data from formDataForSurvey as backup if needed
        this.loadExistingData();

        // RE-TRIGGER change handlers to ensure UI state (visibility) matches the values
        this.triggerChangeHandlers();

        // Default to questions tab
        if (window.switchTab) window.switchTab('genobs', 'questions');

        // Reset scroll
        const scroll = document.querySelector('.modal-main-area .tab-content.active');
        if (scroll) scroll.scrollTop = 0;

        // Auto-focus first field for quick navigation
        setTimeout(() => {
            const firstInput = document.querySelector('#genobsForm input, #genobsForm select, #genobsForm textarea');
            if (firstInput) firstInput.focus();
        }, 100);

        // Setup auto-save on field changes
        this.setupAutoSave();
    }

    setupAutoSave() {
        // Add event listeners to all form fields to auto-save on change
        const form = document.getElementById(this.formId);
        const soporteField = document.getElementById('soporteGenerado');

        if (form) {
            form.addEventListener('input', () => {
                this.saveFormData();
            });
            form.addEventListener('change', () => {
                this.saveFormData();
            });
        }

        if (soporteField) {
            soporteField.addEventListener('input', () => {
                this.saveFormData();
            });
        }
    }

    saveFormData() {
        const data = this.getExistingFieldValues();
        localStorage.setItem('genobsFormData', JSON.stringify(data));
    }

    clear() {
        const form = document.getElementById(this.formId);
        if (form) form.reset();

        if (document.getElementById('soporteGenerado')) document.getElementById('soporteGenerado').value = '';
        if (document.getElementById('tiempoFalla')) document.getElementById('tiempoFalla').value = '';

        // Clear template info
        const info = document.getElementById('templateInfoContainer');
        if (info) info.style.display = 'none';

        // Reset Logic
        this.handleServiceChange('');
        this.handleMotivoComunicacionChange('');
        this.handleRedesUnificadasChange('');

        // Clear localStorage
        localStorage.removeItem('genobsFormData');
    }

    loadExistingData() {
        // Load data from formDataForSurvey if available
        const formData = window.formDataForSurvey || {};

        // Only populate fields that are empty to preserve user edits
        const populateIfEmpty = (fieldId, dataKey) => {
            const field = document.getElementById(fieldId);
            if (field && (field.value === '' || field.value === 'Seleccione...')) {
                field.value = formData[dataKey] || '';
            }
        };

        // Populate basic fields only if they're empty
        populateIfEmpty('tiempoFalla', 'Desde Cuando Presenta la Falla');
        populateIfEmpty('suministroElectrico', 'Suministro Eléctrico');
        populateIfEmpty('generadorElectrico', 'Generador Eléctrico');
        populateIfEmpty('tipoServicio', 'Tipo de servicio');
        populateIfEmpty('tipoServicioGeneral', 'Tipo de servicio General');
        populateIfEmpty('motivoComunicacion', 'motivoComunicacion');
        populateIfEmpty('motivoComunicacionOtros', 'motivoComunicacionOtros');
        populateIfEmpty('estadoOnt', 'Estado ONT');
        populateIfEmpty('clienteMasiva', 'Cliente Masiva');
        populateIfEmpty('fallaMasiva', 'Falla Masiva');
        populateIfEmpty('visitaTecnica', 'Visita Técnica');
        populateIfEmpty('instalacionReparacion', 'Inconvenientes Instalación/Reparación');
        populateIfEmpty('estadoLuces', 'Estado Luces');
        populateIfEmpty('clienteReincidente', 'El cliente es reincidente');
        populateIfEmpty('perdidaMonitoreo', 'PERDIDA DE MONITOREO');
        populateIfEmpty('clienteConectadoPor', 'CLIENTE CONECTADO POR');
        populateIfEmpty('estadoOntPersiste', 'Estado ONT Persiste');
        populateIfEmpty('redesUnificadas', 'REDES UNIFICADAS');
        populateIfEmpty('redesUnificadasOtros', 'REDES UNIFICADAS OTROS');

        // TV questions
        populateIfEmpty('controlRemoto', 'Control Remoto');
        populateIfEmpty('cambioPilas', 'Cambio Pilas');
        populateIfEmpty('pruebaCruzada', 'Prueba Cruzada');
        populateIfEmpty('decodificador', 'Decodificador');
        populateIfEmpty('reinicioElectrico', 'Reinicio Eléctrico');
        populateIfEmpty('cableHDMIAV', 'Cable HDMI/AV');
        populateIfEmpty('observacionTV', 'Observacion TV');

        // For soporteGenerado, only populate if empty
        const soporteField = document.getElementById('soporteGenerado');
        if (soporteField && soporteField.value === '') {
            soporteField.value = formData['Soporte Generado'] || '';
        }
    }

    // Helper to restore everything from storage independently of the open() flow
    restoreDataFromStorage() {
        const savedData = localStorage.getItem('genobsFormData');
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                this.restoreFieldValues(parsed);
                // Also ensure formatting/logic requiring change events is triggered
                this.triggerChangeHandlers();
            } catch (e) {
                console.error('Error restoring GenObs data from storage:', e);
            }
        }
    }

    triggerChangeHandlers() {
        // RE-TRIGGER change handlers to ensure UI state (visibility) matches the values
        const contextServiceId = this.context === 'sondeo' ? 'tipoServicio' : 'tipoServicioGeneral';
        const serviceVal = document.getElementById(contextServiceId)?.value;
        // Also check the other context in case we switched types
        const altServiceId = this.context === 'sondeo' ? 'tipoServicioGeneral' : 'tipoServicio';
        const altServiceVal = document.getElementById(altServiceId)?.value;

        if (serviceVal) this.handleServiceChange(serviceVal);
        else if (altServiceVal) this.handleServiceChange(altServiceVal);

        // Specifically handle TV Switch Logic if applicable
        const tvSwitch = document.getElementById('fallaTvSwitch');
        if (tvSwitch && tvSwitch.checked) {
            this.handleTvSwitchChange(true);
        }

        // Ensure sub-questions in "Otros" are shown if needed
        const motivo = document.getElementById('motivoComunicacion')?.value;
        if (motivo === 'Otros:') this.handleMotivoComunicacionChange('Otros:');

        const redes = document.getElementById('redesUnificadas')?.value;
        if (redes === 'Otros:') this.handleRedesUnificadasChange('Otros:');
    }

    // Helper function to get current field values before they are cleared
    getExistingFieldValues() {
        const data = {};
        const fieldIds = [
            'tiempoFalla', 'suministroElectrico', 'generadorElectrico', 'tipoServicio',
            'tipoServicioGeneral', 'motivoComunicacion', 'motivoComunicacionOtros',
            'fallaTvSwitch', // Add Switch ID
            'estadoOnt', 'clienteMasiva', 'fallaMasiva', 'visitaTecnica',
            'instalacionReparacion', 'estadoLuces', 'clienteReincidente',
            'perdidaMonitoreo', 'clienteConectadoPor', 'estadoOntPersiste',
            'redesUnificadas', 'redesUnificadasOtros', 'controlRemoto',
            'cambioPilas', 'pruebaCruzada', 'decodificador',
            'reinicioElectrico', 'cableHDMIAV', 'observacionTV', 'soporteGenerado'
        ];

        fieldIds.forEach(id => {
            const field = document.getElementById(id);
            if (field) {
                if (field.type === 'checkbox') {
                    data[id] = field.checked;
                } else {
                    data[id] = field.value;
                }
            }
        });

        // Also try to load from localStorage if no DOM values exist
        const savedData = localStorage.getItem('genobsFormData');
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                // Merge: DOM values take precedence over localStorage
                Object.keys(parsed).forEach(key => {
                    if (data[key] === undefined || data[key] === '' || data[key] === null) {
                        data[key] = parsed[key];
                    }
                });
            } catch (e) {
                console.error('Error parsing saved GenObs data:', e);
            }
        }

        return data;
    }

    // Helper function to restore field values after they are recreated
    restoreFieldValues(data) {
        for (const [id, value] of Object.entries(data)) {
            const field = document.getElementById(id);
            if (field) {
                if (field.type === 'checkbox') {
                    field.checked = !!value;
                } else if (value && value !== '') {
                    field.value = value;
                }
            }
        }
    }
}

// Función global para actualizar la visualización de fecha/hora
window.updateDateTimeDisplay = function (fieldId) {
    const input = document.getElementById(fieldId);
    const display = document.getElementById(fieldId + '-display');

    if (input && display) {
        const value = input.value;
        if (value) {
            const date = new Date(value);
            if (!isNaN(date.getTime())) {
                // Formato manual consistente con AM/PM
                const day = date.getDate().toString().padStart(2, '0');
                const month = (date.getMonth() + 1).toString().padStart(2, '0');
                const year = date.getFullYear();
                let hours = date.getHours();
                const minutes = date.getMinutes().toString().padStart(2, '0');
                const ampm = hours >= 12 ? 'PM' : 'AM';
                hours = hours % 12;
                hours = hours ? hours : 12; // the hour '0' should be '12'
                const formattedHours = hours.toString().padStart(2, '0');

                const formatted = `${day}/${month}/${year} ${formattedHours}:${minutes} ${ampm}`;
                display.textContent = `Seleccionado: ${formatted}`;
                display.className = 'datetime-display visible';
            }
        } else {
            display.textContent = '';
            display.className = 'datetime-display';
        }
    }
};

// Tab Switching logic (Global Parity)
window.switchTab = (group, tabName) => {
    const modal = document.getElementById(`${group}Modal`);
    if (!modal) return;

    const tabs = modal.querySelectorAll('.tab-content');
    const buttons = modal.querySelectorAll('.tab-btn');

    tabs.forEach(t => t.classList.remove('active'));
    buttons.forEach(b => b.classList.remove('active'));

    const target = document.getElementById(`${group}-${tabName}`);
    if (target) {
        target.classList.add('active');
        // Reset scroll
        target.scrollTop = 0;
    }

    // Update button states
    const sidebar = modal.querySelector('.modal-sidebar');
    if (sidebar) {
        const btns = sidebar.querySelectorAll('.tab-btn');
        btns.forEach(btn => {
            if (btn.getAttribute('onclick').includes(`'${tabName}'`)) {
                btn.classList.add('active');
            }
        });
    }
};

window.GenObsModule = new GenObsModule();
document.addEventListener('DOMContentLoaded', () => {
    window.GenObsModule.init();
});
