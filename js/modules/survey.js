/**
 * TypifyPro 3.0 - Survey Module
 * Handles survey (sondeo) URL generation for Google Forms
 */

let formDataForSurvey = {};

/**
 * Collects survey data from the main form and GenObs modal
 * @param {Object} externalData - Optional data object to use instead of DOM
 */
export function collectSurveyData(externalData = null) {
    // Preserve the existing survey URL from localStorage before rebuilding the data object
    const existingSondeoData = JSON.parse(localStorage.getItem("sondeo")) || {};
    const existingSurveyUrl = existingSondeoData.surveyUrl;

    // Clear all existing properties from formDataForSurvey to ensure a fresh start
    for (const key in formDataForSurvey) {
        delete formDataForSurvey[key];
    }

    const val = (id) => externalData ? (externalData[id] || "") : (document.getElementById(id)?.value || "");

    // Data from the main form
    Object.assign(formDataForSurvey, {
        RUT: val("clienteRUT"),
        NOMBRE: val("clienteNombre"),
        "SERVICIO CON LA FALLA": val("tipoServicio"),
        CONTRATO: val("clienteContrato"),
        ID_CLIENTE: val("clienteId"),
        CEDULA_EJECUTIVO: localStorage.getItem("documentNumber") || "",
        TELÉFONO: val("clienteTelefono"),
        "DIRECCIÓN CLIENTE": val("clienteDireccion"),
        ONT: val("clienteONT"),
        OLT: val("clienteOLT"),
        TARJETA: val("clienteTarjeta"),
        PUERTO: val("clientePuerto"),
        NODO: val("clienteNodo"),
        "OBSERVACIÓN CON INFORMACIÓN COMPLETA EN LA VARIBALE SONDEO": val("observacionForm"),
        CORREO: val("clienteCorreo"),
    });

    // Data from the genobs modal
    const genobsModalFields = {
        "PERDIDA DE MONITOREO": val("perdidaMonitoreo"),
        "tiempoFalla": val("tiempoFalla"),
        "Suministro Eléctrico": val("suministroElectrico"),
        "Generador Eléctrico": val("generadorElectrico"),
        "Tipo de servicio": val("tipoServicio"),
        "Tipo de servicio General": val("tipoServicioGeneral"),
        "motivoComunicacion": val("motivoComunicacion"),
        "motivoComunicacionOtros": (() => {
            const motivoValue = val("motivoComunicacion");
            if (motivoValue === "Otros:") {
                return val("motivoComunicacionOtros");
            }
            return "";
        })(),
        "Inconvenientes Instalación/Reparación": val("instalacionReparacion"),
        "El cliente es reincidente": val("clienteReincidente"),
        "Estado Luces": val("estadoLuces"),
        "Estado ONT": val("estadoOnt"),
        "Cliente Masiva": val("clienteMasiva"),
        "Falla Masiva": val("fallaMasiva"),
        "Visita Técnica": val("visitaTecnica"),
        "Soporte Generado": val("soporteGenerado"),
        "Falla Respuesta Genobs": val("fallaRespuestaGenobs"),
        "Control Remoto": val("controlRemoto"),
        "Cambio Pilas": val("cambioPilas"),
        "Prueba Cruzada": val("pruebaCruzada"),
        Decodificador: val("decodificador"),
        "Reinicio Eléctrico": val("reinicioElectrico"),
        "Cable HDMI/AV": val("cableHDMIAV"),
        "Observacion TV": val("observacionTV"),
    };

    Object.assign(formDataForSurvey, genobsModalFields);

    // If a survey URL was previously generated and stored, re-assign it to the new data object (ONLY IF NOT EXTERNAL)
    if (existingSurveyUrl && !externalData) {
        formDataForSurvey.surveyUrl = existingSurveyUrl;
    }
}

/**
 * Builds the complete survey URL with all parameters
 * @param {Object} externalData - Optional external data source
 * @returns {string|null} The complete survey URL or null if validation fails
 */
export function buildSurveyUrl(externalData = null) {
    collectSurveyData(externalData);
    // If external data provided, try to infer typification type or fallback
    const selectedTypification = externalData ? (externalData.type || "Soporte") : localStorage.getItem("selectedTypification");

    // Process observation for survey
    let observacion = formDataForSurvey["OBSERVACIÓN CON INFORMACIÓN COMPLETA EN LA VARIBALE SONDEO"];
    const perdidaMonitoreo = formDataForSurvey["PERDIDA DE MONITOREO"];
    const contrato = formDataForSurvey["CONTRATO"];
    const tiempoFalla = formDataForSurvey["tiempoFalla"];
    const correo = formDataForSurvey["CORREO"];
    const clienteID = formDataForSurvey["ID_CLIENTE"];
    const nombre = formDataForSurvey["NOMBRE"];
    const tarjeta = formDataForSurvey["TARJETA"];
    const puerto = formDataForSurvey["PUERTO"];
    const direccion = formDataForSurvey["DIRECCIÓN CLIENTE"];
    const telefono = formDataForSurvey["TELÉFONO"];

    // Build Full Observation text to match generator.js Preview exactly
    let fullText = "";

    // 1. Name
    if (nombre) fullText += `NOMBRE: ${nombre.trim().replace(/\n/g, "")}\n`;

    // 2. Tarjeta/Puerto (Combined)
    if (tarjeta || puerto) fullText += `TARJETA/PUERTO: ${tarjeta}/${puerto}\n`;

    // 3. Nodo
    const nodo = formDataForSurvey["NODO"];
    if (nodo) fullText += `NODO: ${nodo}\n`;

    // 4. Contact & Contract
    if (correo) fullText += `Correo: ${correo}\n`;
    if (contrato) fullText += `CONTRATO: ${contrato}\n`;
    const rut = formDataForSurvey["RUT"];
    if (rut) fullText += `RUT: ${rut}\n`;
    if (direccion) fullText += `DIRECCION: ${direccion}\n`;

    // 5. Tech Part 2
    const ont = formDataForSurvey["ONT"];
    if (ont) fullText += `ONT: ${ont}\n`;
    const olt = formDataForSurvey["OLT"];
    if (olt) fullText += `OLT: ${olt}\n`;

    // 6. OBS (With SOP line inside)
    // Build SOP Line
    const today = new Date();
    const formattedDate = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;

    let sopPrefix = "SOP";
    if (selectedTypification === "Movil") sopPrefix = "MOVIL";
    else if (selectedTypification === "SAC") sopPrefix = "SAC";

    let sopLine = `${sopPrefix} ${formattedDate}`;
    if (clienteID) sopLine += ` ID: ${clienteID}`;
    if (telefono) sopLine += ` TEL: ${telefono}`;

    // Clean observation body
    if (observacion) {
        // Remove duplicate SOP/MOVIL/SAC line from body to avoid redundancy
        observacion = observacion.replace(/^OBS:\s*(SOP|MOVIL|SAC).*\n?/gim, "");
        observacion = observacion.replace(/^(SOP|MOVIL|SAC)\s+\d{1,2}\/\d{1,2}\/\d{4}.*\n?/gim, "");
        observacion = observacion.replace(/^OBS:\s*/i, ""); // Remove "OBS:" prefix
    }

    fullText += `OBS: ${sopLine}\n`;
    if (observacion) {
        fullText += `${observacion}`;
    }

    // Assign to form data
    formDataForSurvey["OBSERVACIÓN CON INFORMACIÓN COMPLETA EN LA VARIBALE SONDEO"] = fullText;

    // Validate required fields
    let requiredFields = [];

    if (
        selectedTypification === "Transferencia (Soporte)" ||
        selectedTypification === "SAC" ||
        selectedTypification === "Movil"
    ) {
        requiredFields = ["RUT", "TELÉFONO", "CONTRATO"];
    } else {
        requiredFields = [
            "RUT",
            "SERVICIO CON LA FALLA",
            "TELÉFONO",
            "DIRECCIÓN CLIENTE",
            "ONT",
            "OLT",
            "TARJETA",
            "PUERTO",
            "NODO",
            "CONTRATO",
        ];
    }

    const missingFields = requiredFields.filter(
        (field) => !formDataForSurvey[field]
    );

    if (missingFields.length > 0) {
        const message = `Por favor, complete los siguientes campos antes de enviar el sondeo: ${missingFields.join(", ")}`;
        console.warn("Missing survey fields:", message);
        if (window.showNotification) {
            window.showNotification(message, "error");
        }
        return null;
    }

    if (Object.keys(formDataForSurvey).length === 0) {
        const message = "No hay datos de formulario para enviar el sondeo. Por favor, genere la observación primero.";
        console.warn("No form data for survey:", message);
        if (window.showNotification) {
            window.showNotification(message, "error");
        }
        return null;
    }

    // Build URL
    const baseUrl = window.SURVEY_BASE_URL;
    const urlParams = new URLSearchParams();

    // Field mappings for Google Forms
    const surveyFieldMappings = [
        { entryId: "entry.5694922", formDataKey: "CEDULA_EJECUTIVO" },
        { entryId: "entry.955460218", formDataKey: "RUT" },
        { entryId: "entry.213109764", formDataKey: "SERVICIO CON LA FALLA" },
        { entryId: "entry.216870845", formDataKey: "TELÉFONO" },
        { entryId: "entry.575117188", formDataKey: "DIRECCIÓN CLIENTE" },
        { entryId: "entry.977079435", formDataKey: "ONT" },
        { entryId: "entry.789181094", formDataKey: "OLT" },
        { entryId: "entry.415672825", formDataKey: "TARJETA" },
        { entryId: "entry.44152504", formDataKey: "PUERTO" },
        { entryId: "entry.137275158", formDataKey: "NODO" },
        { entryId: "entry.1907905929", formDataKey: "Inconvenientes Instalación/Reparación" },
        { entryId: "entry.932424681", formDataKey: "motivoComunicacion" },
        { entryId: "entry.2011962965", formDataKey: "Suministro Eléctrico" },
        { entryId: "entry.704266693", formDataKey: "Generador Eléctrico" },
        { entryId: "entry.1566836783", formDataKey: "Estado Luces" },
        { entryId: "entry.2120037146", formDataKey: "El cliente es reincidente" },
        { entryId: "entry.1163287562", formDataKey: "OBSERVACIÓN CON INFORMACIÓN COMPLETA EN LA VARIBALE SONDEO" },
    ];

    surveyFieldMappings.forEach((mapping) => {
        let value = formDataForSurvey[mapping.formDataKey] || "";
        if (mapping.formDataKey === "CEDULA_EJECUTIVO") {
            value = localStorage.getItem("documentNumber") || "";
        }
        urlParams.append(mapping.entryId, value);
    });

    // Special handling for "Otros:" option in motivoComunicacion
    const motivoComunicacionValue = formDataForSurvey["motivoComunicacion"] || "";
    const motivoComunicacionOtros = formDataForSurvey["motivoComunicacionOtros"] || "";

    if (motivoComunicacionValue === "Otros:" && motivoComunicacionOtros) {
        urlParams.set("entry.932424681", "__other_option__");
        urlParams.append("entry.932424681.other_option_response", motivoComunicacionOtros);
        console.log("🔍 DEBUG - Otros option detected for Motivo Comunicacion:", {
            mainEntry: "__other_option__",
            customText: motivoComunicacionOtros
        });
    }

    // Special handling for date field - Send complete datetime with 24h format to Google Form
    if (tiempoFalla) {
        // entry.2142598155 expects format: YYYY-MM-DD HH:MM (24-hour format)
        const date = new Date(tiempoFalla);
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');

        const formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}`;
        urlParams.append("entry.2142598155", formattedDateTime);

        console.log(`Campo 'Desde Cuando Presenta la Falla' procesado:`);
        console.log(`  Valor original: ${tiempoFalla}`);
        console.log(`  Fecha y hora formateada (YYYY-MM-DD HH:MM): ${formattedDateTime}`);
    }

    const finalUrl = `${baseUrl}&${urlParams.toString()}`;
    console.log("Generated Survey URL:", finalUrl);
    return finalUrl;
}

/**
 * Saves survey URL to history in localStorage
 * @param {string} url The survey URL to save
 */
export function saveSurveyUrlToHistory(url) {
    let history = JSON.parse(localStorage.getItem("surveyHistory")) || [];
    const timestamp = new Date().toLocaleString();
    history.unshift({ url: url, timestamp: timestamp });
    history = history.slice(0, 10);
    localStorage.setItem("surveyHistory", JSON.stringify(history));
}

/**
 * Configures survey modal buttons with the generated URL
 * @param {string} urlToDisplay The survey URL to use
 */
export function construirYEnviarSondeo(urlToDisplay = null) {
    if (!urlToDisplay) {
        if (window.showNotification) {
            window.showNotification("No se proporcionó una URL para el sondeo.", "error");
        }
        return;
    }

    console.log("Configuring survey modal with URL:", urlToDisplay);
    saveSurveyUrlToHistory(urlToDisplay);

    setTimeout(() => {
        const copySurveyLinkBtn = document.getElementById("copySurveyLinkBtn");
        const openSurveyLinkBtn = document.getElementById("openSurveyLinkBtn");
        const copyAutoSendSurveyLinkBtn = document.getElementById("copyAutoSendSurveyLinkBtn");
        const openAutoSendSurveyLinkBtn = document.getElementById("openAutoSendSurveyLinkBtn");

        if (copySurveyLinkBtn) {
            copySurveyLinkBtn.onclick = async () => {
                try {
                    await navigator.clipboard.writeText(urlToDisplay);
                    if (window.showNotification) {
                        window.showNotification("¡Enlace de sondeo copiado!", "success");
                    }
                    console.log("Survey link copied:", urlToDisplay);
                } catch (err) {
                    console.error("Error al copiar el enlace de sondeo: ", err);
                    if (window.showNotification) {
                        window.showNotification("Error al copiar el enlace de sondeo.", "error");
                    }
                }
            };
        }

        if (openSurveyLinkBtn) {
            openSurveyLinkBtn.onclick = () => {
                window.open(urlToDisplay, "_blank", "width=800,height=600,scrollbars=yes,resizable=yes");
                console.log("Survey link opened:", urlToDisplay);
            };
        }

        if (copyAutoSendSurveyLinkBtn) {
            copyAutoSendSurveyLinkBtn.onclick = async () => {
                const autoSendUrl = urlToDisplay.replace(
                    "/viewform?usp=pp_url",
                    "/formResponse?usp=pp_url"
                );
                try {
                    await navigator.clipboard.writeText(autoSendUrl);
                    if (window.showNotification) {
                        window.showNotification("¡Enlace de envío automático copiado!", "success");
                    }
                    console.log("Auto-send survey link copied:", autoSendUrl);
                } catch (err) {
                    console.error("Error al copiar el enlace de envío automático: ", err);
                    if (window.showNotification) {
                        window.showNotification("Error al copiar el enlace de envío automático.", "error");
                    }
                }
            };
        }

        if (openAutoSendSurveyLinkBtn) {
            openAutoSendSurveyLinkBtn.onclick = () => {
                const autoSendUrl = urlToDisplay.replace(
                    "/viewform?usp=pp_url",
                    "/formResponse?usp=pp_url"
                );
                window.open(autoSendUrl, "_blank", "width=800,height=600,scrollbars=yes,resizable=yes");
                console.log("Auto-send survey link opened:", autoSendUrl);
            };
        }
    }, 100);
}

// Expose functions globally
window.buildSurveyUrl = buildSurveyUrl;
window.construirYEnviarSondeo = construirYEnviarSondeo;
window.collectSurveyData = collectSurveyData;
window.saveSurveyUrlToHistory = saveSurveyUrlToHistory;
