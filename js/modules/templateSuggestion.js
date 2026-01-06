
// Advanced Template Suggestion AI Engine
// Analyzes all form data to find the most semantically relevant template

const TAGS_MAPPING = {
    'estadoLuces': {
        'Luces Verdes (sin intermitencia)': ['navegacion', 'ok', 'normal'],
        'Luz Roja (LOS)': ['los', 'roja', 'fibra cortada', 'desconectado', 'fibra'],
        'Luz (Power encendida) Sola': ['power', 'apagado', 'falla electrica'],
        'Luz Pon (Intermitente)': ['pon', 'intermitente', 'sincronismo', 'provisioning'],
        'Sin Luces encendidas in la (ONT)': ['sin luz', 'apagado', 'power', 'electrico']
    },
    'estadoOnt': {
        'Offline': ['offline', 'caido', 'desconectado', 'sin señal'],
        'Autofind': ['autofind', 'configuracion', 'nueva', 'aprovisionar'],
        'Power Off': ['power', 'apagado', 'electrico'],
        'Conectado con pérdida de monitoreo': ['monitoreo', 'gestion', 'perdida', 'ping']
    },
    'tipoServicio': {
        'INTERNET': ['internet', 'navegacion', 'wifi', 'cable'],
        'TV HD': ['tv', 'television', 'hd', 'deco', 'canales'],
        'VOZ IP': ['voz', 'fono', 'telefono', 'llamadas'],
        'MUNDO GO': ['go', 'streaming', 'app', 'android'],
        '3 MUNDOS (Todos los servicios)': ['triple', '3 mundos', 'full']
    },
    'motivoComunicacion': {
        'Por servicio de internet': ['internet', 'navegacion', 'wifi'],
        'Por servicio de tv': ['tv', 'television', 'canales'],
        'Por servicio de fono': ['fono', 'voz', 'telefono'],
        'Incumplimiento visita': ['visita', 'incumplimiento', 'reclamo', 'tecnico']
    },
    'clienteConectadoPor': {
        'WIFI': ['wifi', 'inalambrico', 'señal'],
        'POR CABLE DE RED': ['cable', 'lan', 'ethernet']
    },
    'redesUnificadas': {
        'SI': ['unificada', 'bandsteering', 'smart'],
        'EL CLIENTE SOLICITA QUE SE LE DEJEN SEPARADAS': ['separar', '2.4', '5g', 'frecuencia']
    }
};

export class TemplateSuggestionModule {
    constructor() {
        this.init();
    }

    init() {
        window.analizarYSugerirPlantilla = this.analizarYSugerirPlantilla.bind(this);
        window.limpiarCampoSoporte = this.limpiarCampoSoporte.bind(this);
    }

    async analizarYSugerirPlantilla() {
        const tm = window.TemplatesModule;
        if (!tm || !tm.templates) {
            window.showToast("Sistema de plantillas no disponible.", "error");
            return;
        }

        let allTemplates = tm.templates;
        if (allTemplates.length === 0) {
            window.showToast("Cargando plantillas...", "info");
            await tm.init();
            // Refresh reference after init
            allTemplates = tm.templates;
        }

        // --- AI VISUAL EFFECT ---
        const btn = document.querySelector('.btn-info[title="Sugerir Plantilla IA"]');
        const originalHtml = btn?.innerHTML;
        if (btn) {
            btn.innerHTML = '<i class="material-icons rotating">auto_awesome</i> Analizando...';
            btn.disabled = true;
        }

        // Artificial delay for "AI feeling"
        await new Promise(r => setTimeout(r, 800));

        // 1. Collect ALL form data
        const formData = {};
        const allInputs = document.querySelectorAll('#genobsForm input, #genobsForm select, #genobsForm textarea');
        allInputs.forEach(i => {
            if (i.id && i.value && i.value !== 'Seleccione...' && i.value !== 'Seleccione') {
                formData[i.id] = i.value;
            }
        });

        if (Object.keys(formData).length < 2) {
            if (btn) { btn.innerHTML = originalHtml; btn.disabled = false; }
            window.showToast("Proporciona más información en el formulario para un mejor análisis.", "warning");
            return;
        }


        // 2. Build Keyword Set from Form
        let formKeywords = new Set();
        for (const [fieldId, value] of Object.entries(formData)) {
            // Add raw value words
            String(value).toLowerCase().split(/\s+/).forEach(w => {
                if (w.length > 3) formKeywords.add(w);
            });

            // Add mapped tags
            if (TAGS_MAPPING[fieldId] && TAGS_MAPPING[fieldId][value]) {
                TAGS_MAPPING[fieldId][value].forEach(tag => formKeywords.add(tag.toLowerCase()));
            }
        }

        // 3. Score Templates
        let scores = [];
        allTemplates.forEach(template => {
            if (template.isShortcut) return;

            let score = 0;
            let matches = [];

            // A. Tag Matching (High Weight)
            template.tags.forEach(tag => {
                const t = tag.toLowerCase();
                if (formKeywords.has(t)) {
                    score += 25;
                    matches.push(tag);
                }
            });

            // B. Category Matching
            const service = formData['tipoServicio'] || '';
            if ((service.includes('INTERNET') && template.category === 'Internet') ||
                (service.includes('TV') && template.category === 'Television') ||
                (service.includes('VOZ') && template.category === 'Telefonia')) {
                score += 30;
            }

            // C. Text Semantic Matching (Content Search)
            const content = template.content.toLowerCase();
            formKeywords.forEach(kw => {
                if (content.includes(kw)) {
                    score += 5; // Small bonus for each keyword found in body
                }
            });

            // D. Title Matching (Medium Weight)
            const title = template.title.toLowerCase();
            formKeywords.forEach(kw => {
                if (title.includes(kw)) score += 15;
            });

            if (score > 0) {
                scores.push({ template, score, matches });
            }
        });

        // Sort by score descending
        scores.sort((a, b) => b.score - a.score);

        // Reset UI
        if (btn) { btn.innerHTML = originalHtml; btn.disabled = false; }

        if (scores.length > 0) {
            const best = scores[0].template;
            const soporteField = document.getElementById('soporteGenerado');

            if (soporteField) {
                soporteField.value = best.content || best.observacion;
                soporteField.dispatchEvent(new Event('input', { bubbles: true }));

                // Show detailed info
                const infoContainer = document.getElementById('templateInfoContainer');
                const infoContent = document.getElementById('templateInfoContent');
                if (infoContainer && infoContent) {
                    const tip = best.tipificacion || {};
                    infoContainer.style.display = 'block';
                    infoContent.innerHTML = `
                        <div class="ai-reasoning">
                            <i class="material-icons" style="font-size:14px; color:var(--accent-primary)">psychology</i>
                            Sugerencia basada en: ${scores[0].matches.slice(0, 3).join(', ') || 'análisis de contexto'}
                        </div>
                        <div class="info-grid">
                            <div class="info-item"><strong>Tipo de tarea:</strong> ${tip.tipoTarea || 'N/A'}</div>
                            <div class="info-item"><strong>Motivo:</strong> ${tip.motivo || 'N/A'}</div>
                            <div class="info-item"><strong>Subvaloración:</strong> ${tip.subvaloracion || tip.submotivo || 'N/A'}</div>
                            <div class="info-item"><strong>Estado:</strong> ${tip.estado || 'N/A'}</div>
                        </div>
                    `;
                }
                window.showToast(`Sugerencia de AI aplicada: ${best.title}`, "success");
            }
        } else {
            window.showToast("No encontré una plantilla que encaje perfectamente. Intenta buscar manualmente con F2.", "info");
        }
    }

    limpiarCampoSoporte() {
        const field = document.getElementById('soporteGenerado');
        if (field) field.value = '';
        const info = document.getElementById('templateInfoContainer');
        if (info) info.style.display = 'none';
    }
}

// Instantiate
window.TemplateSuggestion = new TemplateSuggestionModule();

/**
 * Genera la URL para el formulario de cliente persistente (survey persiste)
 * @param {Object} formData - Datos del formulario
 * @returns {string} URL completa del formulario
 */
export function generateSurveyPersisteUrl(formData) {
    const baseUrl = "https://docs.google.com/forms/d/e/1FAIpQLSeJ0Cjz67sp2fBFQ0YdtRkXtP7bDyfkUdKlRcNlM/formResponse?usp=pp_url";

    const urlParams = new URLSearchParams();

    // Mapeo de campos del formulario a entry IDs del Google Form
    const fieldMapping = {
        "ID_CLIENTE": "entry.1796537453",
        "TIPO_SERVICIO": "entry.1834750652",
        "CLIENTE_CONECTADO_POR": "entry.288532483",
        "VELOCIDAD_INTERNET_ACTUAL": "entry.1020734800",
        "VELOCIDAD_INTERNET_PROMETIDA": "entry.1340059399",
        "PROBLEMA_PRESENTADO": "entry.610787582_other_option_response",
        "DESCRIPCION_PROBLEMA": "entry.610787582",
        "TIEMPO_FALLA": "entry.978502501" // Campo de fecha y hora
    };

    // Agregar cada campo al URL
    Object.entries(fieldMapping).forEach(([fieldName, entryId]) => {
        const value = formData[fieldName];
        if (value && value.trim() !== '') {
            urlParams.append(entryId, value.trim());
        }
    });

    // Manejo especial para el campo de fecha y hora 'TIEMPO_FALLA'
    const tiempoFallaValue = formData["TIEMPO_FALLA"];
    if (tiempoFallaValue) {
        // Convertir a objeto Date
        const fecha = new Date(tiempoFallaValue);

        // Validar que sea una fecha válida
        if (!isNaN(fecha.getTime())) {
            // Para cliente persistente, separar en componentes individuales como en legacy
            urlParams.append("entry.978502501_year", fecha.getFullYear());
            urlParams.append("entry.978502501_month", fecha.getMonth() + 1); // Mes es 0-indexed
            urlParams.append("entry.978502501_day", fecha.getDate());
            urlParams.append("entry.978502501_hour", fecha.getHours());
            urlParams.append("entry.978502501_minute", fecha.getMinutes());

            console.log(`Campo 'TIEMPO_FALLA' procesado: ${tiempoFallaValue} -> año:${fecha.getFullYear()}, mes:${fecha.getMonth() + 1}, día:${fecha.getDate()}, hora:${fecha.getHours()}, minuto:${fecha.getMinutes()}`);
        } else {
            console.warn("Fecha inválida para 'TIEMPO_FALLA':", tiempoFallaValue);
        }
    }

    return `${baseUrl}&${urlParams.toString()}`;
}
