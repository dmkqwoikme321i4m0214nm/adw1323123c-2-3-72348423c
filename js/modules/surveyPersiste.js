/**
 * TypifyPro 3.0 - Survey Persiste Module
 * Handles persistent client survey URL generation for Google Forms
 */

let formDataForSurveyPersiste = {};

/**
 * Collects survey persiste data from the main form and GenObs modal
 * @param {Object} externalData - Optional external data
 */
export function collectSurveyPersisteData(externalData = null) {
    const existingSondeoData = JSON.parse(localStorage.getItem("sondeoPersiste")) || {};
    const existingSurveyUrl = existingSondeoData.surveyUrl;

    const documentNumber = localStorage.getItem("documentNumber") || "";
    const val = (id) => externalData ? (externalData[id] || "") : (document.getElementById(id)?.value || "");

    console.log("🔍 DEBUG - CEDULA DEL EJECUTIVO:", documentNumber);

    formDataForSurveyPersiste = {
        "CEDULA DEL EJECUTIVO": documentNumber,
        NOMBRE: val("clienteNombre"),
        "ID_CLIENTE": val("clienteId"),
        RUT: val("clienteRUT"),
        Contrato: val("clienteContrato"),
        "SERVICIO CON LA FALLA": val("tipoServicioGeneral"),
        "TIENE PERDIDA DE MONITOREO?": val("perdidaMonitoreo"),
        TELÉFONO: val("clienteTelefono"),
        "DIRECCIÓN CLIENTE": val("clienteDireccion"),
        ONT: val("clienteONT"),
        OLT: val("clienteOLT"),
        TARJETA: val("clienteTarjeta"),
        PUERTO: val("clientePuerto"),
        NODO: val("clienteNodo"),
        SSSAF: val("clienteSSSAF"),
        "UNO EN CADA AREGLON": val("clienteUnoEnCadaArreglon"),
        "CLIENTE CONECTADO POR": val("clienteConectadoPor"),
        "Estado Luces": val("estadoLuces"),
        "Estado ONT Persiste": val("estadoOntPersiste"),
        "REDES UNIFICADAS": val("redesUnificadas"),
        "REDES UNIFICADAS OTROS": (() => {
            const redesValue = val("redesUnificadas");
            if (redesValue === "Otros:") {
                return val("redesUnificadasOtros");
            }
            return "";
        })(),
        "OBSERVACION :": val("observacionForm"),
        "CORREO": val("clienteCorreo"),
        "tiempoFalla": val("tiempoFalla")
    };

    console.log("🔍 DEBUG - New Fields Data:", {
        "CLIENTE CONECTADO POR": formDataForSurveyPersiste["CLIENTE CONECTADO POR"],
        "Estado ONT Persiste": formDataForSurveyPersiste["Estado ONT Persiste"],
        "REDES UNIFICADAS": formDataForSurveyPersiste["REDES UNIFICADAS"],
        "REDES UNIFICADAS OTROS": formDataForSurveyPersiste["REDES UNIFICADAS OTROS"]
    });

    if (existingSurveyUrl && !externalData) {
        formDataForSurveyPersiste.surveyUrl = existingSurveyUrl;
    }
}

/**
 * Builds the complete survey persiste URL with all parameters
 * @param {Object} externalData - Optional data source
 * @returns {string|null} The complete survey URL or null if validation fails
 */
export function buildSurveyPersisteUrl(externalData = null) {
    collectSurveyPersisteData(externalData);

    // Process observation for survey persiste (Add header like survey.js)
    let observacion = formDataForSurveyPersiste["OBSERVACION :"] || "";
    const nombre = formDataForSurveyPersiste["NOMBRE"];
    const idCliente = formDataForSurveyPersiste["ID_CLIENTE"];
    const telefono = formDataForSurveyPersiste["TELÉFONO"];
    const contrato = formDataForSurveyPersiste["Contrato"];
    const correo = formDataForSurveyPersiste["CORREO"];
    const direccion = formDataForSurveyPersiste["DIRECCIÓN CLIENTE"];

    // Build Full Observation text to match generator.js Preview exactly
    let fullText = "";

    // 1. Name
    if (nombre) fullText += `NOMBRE: ${nombre.trim().replace(/\n/g, "")}\n`;

    // 2. Tarjeta/Puerto (Combined)
    const tarjeta = formDataForSurveyPersiste["TARJETA"];
    const puerto = formDataForSurveyPersiste["PUERTO"];
    if (tarjeta || puerto) fullText += `TARJETA/PUERTO: ${tarjeta}/${puerto}\n`;

    // 3. Nodo
    const nodo = formDataForSurveyPersiste["NODO"];
    if (nodo) fullText += `NODO: ${nodo}\n`;

    // 4. Contact & Contract
    if (correo) fullText += `Correo: ${correo}\n`;
    if (contrato) fullText += `CONTRATO: ${contrato}\n`;
    const rut = formDataForSurveyPersiste["RUT"];
    if (rut) fullText += `RUT: ${rut}\n`;
    if (direccion) fullText += `DIRECCION: ${direccion}\n`;

    // 5. Tech Part 2
    const ont = formDataForSurveyPersiste["ONT"];
    if (ont) fullText += `ONT: ${ont}\n`;
    const olt = formDataForSurveyPersiste["OLT"];
    if (olt) fullText += `OLT: ${olt}\n`;

    // 6. OBS (With SOP line inside)
    // Build SOP Line
    const today = new Date();
    const formattedDate = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;

    let sopLine = `SOP ${formattedDate}`;
    if (idCliente) sopLine += ` ID: ${idCliente}`;
    if (telefono) sopLine += ` TEL: ${telefono}`;

    // Clean observation body (remove prefix if present)
    if (observacion) {
        observacion = observacion.replace(/^OBS:\s*(SOP|MOVIL|SAC).*\n?/gim, "");
        observacion = observacion.replace(/^(SOP|MOVIL|SAC)\s+\d{1,2}\/\d{1,2}\/\d{4}.*\n?/gim, "");
        observacion = observacion.replace(/^OBS:\s*/i, "");
    }

    fullText += `OBS: ${sopLine}\n`;
    if (observacion) {
        fullText += `${observacion}`;
    }

    // Assign to form data
    formDataForSurveyPersiste["OBSERVACION :"] = fullText;

    const selectedTypification = externalData ? (externalData.type || "Soporte") : localStorage.getItem("selectedTypification");
    let requiredFields = [];

    if (
        selectedTypification === "Transferencia (Soporte)" ||
        selectedTypification === "SAC" ||
        selectedTypification === "Movil"
    ) {
        requiredFields = ["RUT", "TELÉFONO", "Contrato"];
    } else {
        requiredFields = [
            "RUT",
            "SERVICIO CON LA FALLA",
            "ONT",
            "OLT",
            "Contrato",
            "TIENE PERDIDA DE MONITOREO?",
            "CLIENTE CONECTADO POR",
            "Estado Luces",
            "Estado ONT Persiste",
            "REDES UNIFICADAS",
        ];

        if (formDataForSurveyPersiste["REDES UNIFICADAS"] === "Otros:") {
            requiredFields.push("REDES UNIFICADAS OTROS");
        }
    }

    const missingFields = requiredFields.filter(
        (field) => !formDataForSurveyPersiste[field]
    );

    if (missingFields.length > 0) {
        const message = `Por favor, complete los siguientes campos antes de enviar el cliente persiste: ${missingFields.join(", ")}`;
        console.warn("Missing survey persiste fields:", message);
        if (window.showNotification) {
            window.showNotification(message, "error");
        }
        return null;
    }

    if (Object.keys(formDataForSurveyPersiste).length === 0) {
        const message = "No hay datos de formulario para enviar el cliente persiste. Por favor, genere la observación primero.";
        console.warn("No form data for survey persiste:", message);
        if (window.showNotification) {
            window.showNotification(message, "error");
        }
        return null;
    }

    const baseUrl = window.SURVEY_PERSISTE_BASE_URL;
    const urlParams = new URLSearchParams();

    const surveyFieldMappings = [
        { entryId: "entry.1279701728", formDataKey: "CEDULA DEL EJECUTIVO" },
        { entryId: "entry.737091952", formDataKey: "RUT" },
        { entryId: "entry.1796537453", formDataKey: "ID_CLIENTE" },
        { entryId: "entry.1274396", formDataKey: "SERVICIO CON LA FALLA" },
        { entryId: "entry.354392636", formDataKey: "Contrato" },
        { entryId: "entry.971510061", formDataKey: "ONT" },
        { entryId: "entry.2068363297", formDataKey: "OLT" },
        { entryId: "entry.16222912", formDataKey: "TIENE PERDIDA DE MONITOREO?" },
        { entryId: "entry.288532483", formDataKey: "CLIENTE CONECTADO POR" },
        { entryId: "entry.1848968622", formDataKey: "Estado Luces" },
        { entryId: "entry.763051468", formDataKey: "Estado ONT Persiste" },
        { entryId: "entry.1097538933", formDataKey: "REDES UNIFICADAS" },
        { entryId: "entry.1623308877", formDataKey: "OBSERVACION :" },
    ];

    surveyFieldMappings.forEach((mapping) => {
        const value = formDataForSurveyPersiste[mapping.formDataKey] || "";
        urlParams.append(mapping.entryId, value);

        if (["CLIENTE CONECTADO POR", "Estado ONT Persiste", "REDES UNIFICADAS"].includes(mapping.formDataKey)) {
            console.log(`🔍 DEBUG - Mapping ${mapping.formDataKey}:`, {
                entryId: mapping.entryId,
                value: value
            });
        }
    });

    // Special handling for "Otros:" option in REDES UNIFICADAS
    const redesUnificadasValue = formDataForSurveyPersiste["REDES UNIFICADAS"] || "";
    const redesUnificadasOtros = formDataForSurveyPersiste["REDES UNIFICADAS OTROS"] || "";

    if (redesUnificadasValue === "Otros:" && redesUnificadasOtros) {
        urlParams.set("entry.1097538933", "__other_option__");
        urlParams.append("entry.1097538933.other_option_response", redesUnificadasOtros);
        console.log("🔍 DEBUG - Otros option detected:", {
            mainEntry: "__other_option__",
            customText: redesUnificadasOtros
        });
    }

    // Special handling for date field
    const tiempoFalla = formDataForSurveyPersiste["tiempoFalla"];
    if (tiempoFalla) {
        const date = new Date(tiempoFalla);
        if (!isNaN(date.getTime())) {
            urlParams.append("entry.978502501_year", date.getFullYear());
            urlParams.append("entry.978502501_month", date.getMonth() + 1);
            urlParams.append("entry.978502501_day", date.getDate());
            urlParams.append("entry.978502501_hour", date.getHours());
            urlParams.append("entry.978502501_minute", date.getMinutes().toString().padStart(2, '0'));
        } else {
            console.warn("Invalid date for surveyPersiste:", tiempoFalla);
        }
    }

    const finalUrl = `${baseUrl}&${urlParams.toString()}`;
    console.log("Generated Survey Persiste URL:", finalUrl);
    return finalUrl;
}

/**
 * Saves survey persiste URL to history in localStorage
 * @param {string} url The survey URL to save
 */
export function saveSurveyPersisteUrlToHistory(url) {
    let history = JSON.parse(localStorage.getItem("surveyPersisteHistory")) || [];
    const timestamp = new Date().toLocaleString();
    history.unshift({ url: url, timestamp: timestamp });
    history = history.slice(0, 10);
    localStorage.setItem("surveyPersisteHistory", JSON.stringify(history));
}

/**
 * Configures survey persiste modal buttons with the generated URL
 * @param {string} urlToDisplay The survey URL to use
 */
export function construirYEnviarSondeoPersiste(urlToDisplay = null) {
    if (!urlToDisplay) {
        if (window.showNotification) {
            window.showNotification("No se proporcionó una URL para el cliente persiste.", "error");
        }
        return;
    }

    console.log("Configuring survey persiste modal with URL:", urlToDisplay);
    saveSurveyPersisteUrlToHistory(urlToDisplay);

    setTimeout(() => {
        const openSurveyPersisteLinkBtn = document.getElementById("openSurveyPersisteLinkBtn");
        const copySurveyPersisteLinkBtn = document.getElementById("copySurveyPersisteLinkBtn");
        const openAutoSendSurveyPersisteLinkBtn = document.getElementById("openAutoSendSurveyPersisteLinkBtn");
        const copyAutoSendSurveyPersisteLinkBtn = document.getElementById("copyAutoSendSurveyPersisteLinkBtn");

        if (openSurveyPersisteLinkBtn) {
            openSurveyPersisteLinkBtn.onclick = () => {
                try {
                    window.open(urlToDisplay, '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
                    if (window.showNotification) {
                        window.showNotification("¡Enlace de cliente persiste abierto en nueva ventana!", "success");
                    }
                    console.log("Survey persiste link opened:", urlToDisplay);
                } catch (err) {
                    console.error("Error al abrir el enlace de cliente persiste: ", err);
                    if (window.showNotification) {
                        window.showNotification("Error al abrir el enlace de cliente persiste.", "error");
                    }
                }
            };
        }

        if (copySurveyPersisteLinkBtn) {
            copySurveyPersisteLinkBtn.onclick = async () => {
                try {
                    await navigator.clipboard.writeText(urlToDisplay);
                    if (window.showNotification) {
                        window.showNotification("¡Enlace de cliente persiste copiado!", "success");
                    }
                    console.log("Survey persiste link copied:", urlToDisplay);
                } catch (err) {
                    console.error("Error al copiar el enlace de cliente persiste: ", err);
                    if (window.showNotification) {
                        window.showNotification("Error al copiar el enlace de cliente persiste.", "error");
                    }
                }
            };
        }

        const autoSendUrl = urlToDisplay.replace(
            "/viewform?usp=pp_url",
            "/formResponse?usp=pp_url"
        );

        if (openAutoSendSurveyPersisteLinkBtn) {
            openAutoSendSurveyPersisteLinkBtn.onclick = () => {
                try {
                    window.open(autoSendUrl, '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
                    if (window.showNotification) {
                        window.showNotification("¡Enlace de envío automático de cliente persiste abierto en nueva ventana!", "success");
                    }
                    console.log("Auto-send survey persiste link opened:", autoSendUrl);
                } catch (err) {
                    console.error("Error al abrir el enlace de envío automático de cliente persiste: ", err);
                    if (window.showNotification) {
                        window.showNotification("Error al abrir el enlace de envío automático de cliente persiste.", "error");
                    }
                }
            };
        }

        if (copyAutoSendSurveyPersisteLinkBtn) {
            copyAutoSendSurveyPersisteLinkBtn.onclick = async () => {
                try {
                    await navigator.clipboard.writeText(autoSendUrl);
                    if (window.showNotification) {
                        window.showNotification("¡Enlace de envío automático de cliente persiste copiado!", "success");
                    }
                    console.log("Auto-send survey persiste link copied:", autoSendUrl);
                } catch (err) {
                    console.error("Error al copiar el enlace de envío automático de cliente persiste: ", err);
                    if (window.showNotification) {
                        window.showNotification("Error al copiar el enlace de envío automático de cliente persiste.", "error");
                    }
                }
            };
        }
    }, 100);
}

// Expose functions globally
window.buildSurveyPersisteUrl = buildSurveyPersisteUrl;
window.construirYEnviarSondeoPersiste = construirYEnviarSondeoPersiste;
window.collectSurveyPersisteData = collectSurveyPersisteData;
window.saveSurveyPersisteUrlToHistory = saveSurveyPersisteUrlToHistory;
