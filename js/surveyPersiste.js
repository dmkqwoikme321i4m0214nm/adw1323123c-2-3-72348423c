export let formDataForSurveyPersiste = {}; // Variable global para los datos

export function collectSurveyPersisteData() {
  // Preserve the existing survey URL from localStorage before rebuilding the data object
  const existingSondeoData =
    JSON.parse(localStorage.getItem("sondeoPersiste")) || {};
  const existingSurveyUrl = existingSondeoData.surveyUrl;

  // Get and log the document number for debugging
  const documentNumber = localStorage.getItem("documentNumber") || "";
  console.log("🔍 DEBUG - CEDULA DEL EJECUTIVO:", documentNumber);
  console.log("🔍 DEBUG - All localStorage keys:", Object.keys(localStorage));

  // Data from the main form
  formDataForSurveyPersiste = {
    "CEDULA DEL EJECUTIVO": documentNumber, // Get user ID from localStorage
    "ID_CLIENTE": document.getElementById("clienteId")?.value || "", // Call ID from the form
    RUT: document.getElementById("clienteRUT")?.value || "",
    Contrato: document.getElementById("clienteContrato")?.value || "",
    "SERVICIO CON LA FALLA":
      document.getElementById("tipoServicioGeneral")?.value || "", // Ahora se obtiene de tipoServicioGeneral (Cliente Persiste)
    "TIENE PERDIDA DE MONITOREO?":
      document.getElementById("perdidaMonitoreo")?.value || "",
    TELÉFONO: (() => {
      const domValue = document.getElementById("clienteTelefono")?.value || "";
      localStorage.setItem("genobs_clienteTelefono", domValue);
      return domValue;
    })(),
    "DIRECCIÓN CLIENTE":
      document.getElementById("clienteDireccion")?.value || "",
    ONT: (() => {
      const domValue = document.getElementById("clienteONT")?.value || "";
      localStorage.setItem("genobs_clienteONT", domValue);
      return domValue;
    })(),
    OLT: (() => {
      const domValue = document.getElementById("clienteOLT")?.value || "";
      localStorage.setItem("genobs_clienteOLT", domValue);
      return domValue;
    })(),
    TARJETA: (() => {
      const domValue = document.getElementById("clienteTarjeta")?.value || "";
      localStorage.setItem("genobs_clienteTarjeta", domValue);
      return domValue;
    })(),
    PUERTO: (() => {
      const domValue = document.getElementById("clientePuerto")?.value || "";
      localStorage.setItem("genobs_clientePuerto", domValue);
      return domValue;
    })(),
    NODO: (() => {
      const domValue = document.getElementById("clienteNodo")?.value || "";
      localStorage.setItem("genobs_clienteNodo", domValue);
      return domValue;
    })(),
    SSSAF: (() => {
      const domValue = document.getElementById("clienteSSSAF")?.value || "";
      localStorage.setItem("genobs_clienteSSSAF", domValue);
      return domValue;
    })(),
    "UNO EN CADA AREGLON": (() => {
      const domValue =
        document.getElementById("clienteUnoEnCadaArreglon")?.value || "";
      localStorage.setItem("genobs_clienteUnoEnCadaArreglon", domValue);
      return domValue;
    })(),
    "CLIENTE CONECTADO POR":
      document.getElementById("clienteConectadoPor")?.value || "",
    "Estado Luces": document.getElementById("estadoLuces")?.value || "",
    "Estado ONT Persiste": document.getElementById("estadoOntPersiste")?.value || "",
    "REDES UNIFICADAS": document.getElementById("redesUnificadas")?.value || "",
    "REDES UNIFICADAS OTROS": (() => {
      const redesValue = document.getElementById("redesUnificadas")?.value || "";
      if (redesValue === "Otros:") {
        return document.getElementById("redesUnificadasOtros")?.value || "";
      }
      return "";
    })(),
    "OBSERVACION :":
      document.getElementById("observacionCompleta")?.value || "",
  };

  // Debug logging for new fields
  console.log("🔍 DEBUG - New Fields Data:", {
    "CLIENTE CONECTADO POR": formDataForSurveyPersiste["CLIENTE CONECTADO POR"],
    "Estado ONT Persiste": formDataForSurveyPersiste["Estado ONT Persiste"],
    "REDES UNIFICADAS": formDataForSurveyPersiste["REDES UNIFICADAS"],
    "REDES UNIFICADAS OTROS": formDataForSurveyPersiste["REDES UNIFICADAS OTROS"]
  });

  // Debug logging for DOM element values
  console.log("🔍 DEBUG - DOM Element Values:", {
    "clienteConectadoPor": document.getElementById("clienteConectadoPor")?.value,
    "estadoOntPersiste": document.getElementById("estadoOntPersiste")?.value,
    "redesUnificadas": document.getElementById("redesUnificadas")?.value,
    "redesUnificadasOtros": document.getElementById("redesUnificadasOtros")?.value
  });

  // Preserve the existing survey URL if it exists
  formDataForSurveyPersiste.surveyUrl = existingSurveyUrl;
}

/**
 * Esta función construye la URL COMPLETA con todos los parámetros
 * y la devuelve. No abre ninguna ventana ni modal.
 */
export function buildSurveyPersisteUrl() {
  collectSurveyPersisteData(); // Recopila los datos más recientes

  // Eliminar partes no deseadas de la observación para el sondeo
  let observacion = formDataForSurveyPersiste["OBSERVACION :"] || "";

  // Remove "NODO:" and its value if it's already present in the observation field to avoid duplication
  if (observacion) {
    observacion = observacion.replace(/NODO:\s*[^ \n]*/g, "").trim();
    // Remove "Desde Cuando Presenta la Falla:" and its value if it's already present in the observation field
    observacion = observacion
      .replace(/Desde Cuando Presenta la Falla:\s*[^ \n]*/g, "")
      .trim();

    // Remove redundant fields that are already sent as separate parameters
    observacion = observacion.replace(/CONTRATO:.*(\n|$)/g, "").trim();
    observacion = observacion.replace(/RUT:.*(\n|$)/g, "").trim();
    observacion = observacion.replace(/DIRECCIÓN CLIENTE:.*(\n|$)/g, "").trim();
    observacion = observacion.replace(/ONT:.*(\n|$)/g, "").trim();
    observacion = observacion.replace(/OLT:.*(\n|$)/g, "").trim();
  }

  const contrato = formDataForSurveyPersiste["Contrato"] || "";
  const nodo = formDataForSurveyPersiste["NODO"] || ""; // Keep this variable for the URL parameter mapping
  const tarjeta = formDataForSurveyPersiste["TARJETA"] || "";
  const direccion = formDataForSurveyPersiste["DIRECCIÓN CLIENTE"] || "";
  const perdidaMonitoreo =
    formDataForSurveyPersiste["TIENE PERDIDA DE MONITOREO?"] || "";
  const sssaf = formDataForSurveyPersiste["SSSAF"] || "";
  const unoEnCadaArreglon =
    formDataForSurveyPersiste["UNO EN CADA AREGLON"] || "";
  const suministroElectrico =
    formDataForSurveyPersiste["Suministro Eléctrico"] || "";

  // Construct the observation string with newlines for separation, ensuring NODO is not duplicated in the text
  // observacion = `Contrato: ${contrato}\nNODO: ${nodo}\nTARJETA: ${tarjeta}\nDIRECCIÓN: ${direccion}\n¿Tiene perdida de monitoreo?:${perdidaMonitoreo}\n${unoEnCadaArreglon}\n${observacion}`;

  // Since we are now capturing the full observation from the DOM, we might not need to reconstruct it entirely.
  // However, the user might want to ensure specific fields are present.
  // For now, let's trust the captured "OBSERVACION :" but ensure we don't duplicate if the user manually edited it.

  // Actually, the previous logic was constructing it from partials because it wasn't capturing the full text.
  // Now that we capture `document.getElementById("observacionCompleta").textContent`, we should use that.
  // But we should still apply the cleanups if needed, or just trust the main generation.

  // Let's keep the cleanups but skip the reconstruction if we have a full observation.
  if (observacion) {
    // Apply specific cleanups for the URL if necessary, but generally the main observation should be ready.
    // The previous code was doing a lot of replacements. Let's keep them if they are for URL safety or specific formatting.

    // Remove multiple newlines and trim
    observacion = observacion.replace(/\n\s*\n/g, "\n").trim();

    // Removals (Legacy cleanups, might still be useful)
    observacion = observacion.replace("obs: ", "").replace("OBS:", "");
    observacion = observacion.replace(
      "Tiene Luces en que estado ?: Luces Verdes (sin intermitencia)",
      ""
    );
    observacion = observacion.replace("Estado ONT: Conectado", "");
    observacion = observacion.replace(/SSSAF:\s*[^ \n]*/g, "").trim(); // Remove SSSAF and its value

    // Clean up spaces and commas, and ensure "NODO" is correctly spelled
    observacion = observacion.replace(/NO DO:/g, "NODO:");
    observacion = observacion.replace(/, ,/g, ",").replace(/  +/g, " ").trim();

    formDataForSurveyPersiste["OBSERVACION :"] = observacion;
  }

  const selectedTypification = localStorage.getItem("selectedTypification");

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
    const message = `Por favor, complete los siguientes campos antes de enviar el cliente persiste: ${missingFields.join(
      ", "
    )}`;
    console.warn("Missing survey persiste fields:", message);
    window.showNotification(message, "error");
    return null; // Return null if required fields are missing
  }

  if (Object.keys(formDataForSurveyPersiste).length === 0) {
    const message =
      "No hay datos de formulario para enviar el cliente persiste. Por favor, genere la observación primero.";
    console.warn("No form data for survey persiste:", message);
    window.showNotification(message, "error");
    return null; // Return null if no form data
  }

  // Define la URL base para el formulario de sondeo persistente.
  const baseUrl = window.SURVEY_PERSISTE_BASE_URL; // Placeholder URL

  const urlParams = new URLSearchParams();

  // 1. Se mapean los datos recopilados (formDataForSurveyPersiste) a los parámetros de entrada ('entry')
  //    esperados por el formulario de Google. Cada 'entry.XXXXXXX' corresponde a un campo específico en el formulario.
  // Define un mapeo de los campos del formulario a los IDs de entrada de Google Forms.
  // Cada objeto contiene el 'entryId' de Google Forms y la clave correspondiente en 'formDataForSurveyPersiste'.
  const surveyFieldMappings = [
    { entryId: "entry.1279701728", formDataKey: "CEDULA DEL EJECUTIVO" }, // CEDULA DEL EJECUTIVO
    { entryId: "entry.737091952", formDataKey: "RUT" }, // RUT
    { entryId: "entry.1796537453", formDataKey: "ID_CLIENTE" }, // (ID) DE LA LLAMADA ACTUAL
    { entryId: "entry.1274396", formDataKey: "SERVICIO CON LA FALLA" }, // SERVICIO CON LA FALLA
    { entryId: "entry.354392636", formDataKey: "Contrato" }, // CÓDIGO DE CONTRATO
    { entryId: "entry.971510061", formDataKey: "ONT" }, // ONT
    { entryId: "entry.2068363297", formDataKey: "OLT" }, // OLT
    { entryId: "entry.16222912", formDataKey: "TIENE PERDIDA DE MONITOREO?" }, // TIENE PERDIDA DE MONITOREO
    { entryId: "entry.288532483", formDataKey: "CLIENTE CONECTADO POR" }, // EL CLIENTE SE ENCUENTRA CONECTADO POR (WIFI/CABLE/AMBOS)
    { entryId: "entry.1848968622", formDataKey: "Estado Luces" }, // TIENE LUCES EN QUE ESTADO
    { entryId: "entry.763051468", formDataKey: "Estado ONT Persiste" }, // ¿QUE ESTADO PRESENTA LA ONT? (CONECTADO/DESCONOCIDO/AUTOFIND/OFFLINE/POWEROFF/LOS)
    { entryId: "entry.1097538933", formDataKey: "REDES UNIFICADAS" }, // ¿REDES UNIFICADAS? (SI/NO/Sin texto)
    { entryId: "entry.1623308877", formDataKey: "OBSERVACION :" }, // OBSERVACION COMPLETA (campo de texto largo)
  ];

  // Itera sobre el mapeo y añade los parámetros a la URL.
  surveyFieldMappings.forEach((mapping) => {
    const value = formDataForSurveyPersiste[mapping.formDataKey] || "";
    urlParams.append(mapping.entryId, value);

    // Debug logging for new fields
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
    // For Google Forms, when "Otros:" is selected:
    // 1. Send __other_option__ to mark the "Otros:" checkbox
    urlParams.set("entry.1097538933", "__other_option__");
    // 2. Send the custom text to the .other_option_response field
    urlParams.append("entry.1097538933.other_option_response", redesUnificadasOtros);

    console.log("🔍 DEBUG - Otros option detected:", {
      mainEntry: "__other_option__",
      customText: redesUnificadasOtros
    });
  }

  // Manejo especial para el campo de fecha y hora 'Desde Cuando Presenta la Falla'.
  const tiempoFalla =
    formDataForSurveyPersiste["Desde Cuando Presenta la Falla"];
  if (tiempoFalla) {
    const date = new Date(tiempoFalla);
    urlParams.append("entry.978502501_year", date.getFullYear());
    urlParams.append("entry.978502501_month", date.getMonth() + 1);
    urlParams.append("entry.978502501_day", date.getDate());
    urlParams.append("entry.978502501_hour", date.getHours());
    urlParams.append("entry.978502501_minute", date.getMinutes());
  }

  // 2. Se construye la URL final COMPLETA concatenando la URL base con los parámetros de sondeo.
  const finalUrl = `${baseUrl}&${urlParams.toString()}`;
  console.log("Generated Survey Persiste URL:", finalUrl);
  return finalUrl;
}

/**
 * Guarda la URL del cliente persiste en el historial de localStorage.
 * @param {string} url La URL del cliente persiste a guardar.
 */
export function saveSurveyPersisteUrlToHistory(url) {
  let history = JSON.parse(localStorage.getItem("surveyPersisteHistory")) || [];
  const timestamp = new Date().toLocaleString();
  history.unshift({ url: url, timestamp: timestamp }); // Add to the beginning
  // Keep only the last 10 entries to prevent excessive storage
  history = history.slice(0, 10);
  localStorage.setItem("surveyPersisteHistory", JSON.stringify(history));
}

/**
 * Configura los botones de la modal de cliente persiste con la URL generada.
 * @param {string} urlToDisplay La URL del cliente persiste a utilizar.
 */
export function construirYEnviarSondeoPersiste(urlToDisplay = null) {
  if (!urlToDisplay) {
    window.showNotification(
      "No se proporcionó una URL para el cliente persiste.",
      "error"
    );
  }

  console.log("Configuring survey persiste modal with URL:", urlToDisplay);
  saveSurveyPersisteUrlToHistory(urlToDisplay); // Save the URL to history

  // Wait a bit for the modal to be in the DOM if it was just created
  setTimeout(() => {
    const openSurveyPersisteLinkBtn = document.getElementById(
      "openSurveyPersisteLinkBtn"
    );
    const copySurveyPersisteLinkBtn = document.getElementById(
      "copySurveyPersisteLinkBtn"
    );
    const openAutoSendSurveyPersisteLinkBtn = document.getElementById(
      "openAutoSendSurveyPersisteLinkBtn"
    );
    const copyAutoSendSurveyPersisteLinkBtn = document.getElementById(
      "copyAutoSendSurveyPersisteLinkBtn"
    );

    console.log("Configuring modal elements:", {
      openSurveyPersisteLinkBtn,
      copySurveyPersisteLinkBtn,
      openAutoSendSurveyPersisteLinkBtn,
      copyAutoSendSurveyPersisteLinkBtn,
    });

    // Open pre-filled link in popup
    if (openSurveyPersisteLinkBtn) {
      openSurveyPersisteLinkBtn.onclick = () => {
        try {
          window.open(urlToDisplay, '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
          window.showNotification("¡Enlace de cliente persiste abierto en nueva ventana!", "success");
          console.log("Survey persiste link opened:", urlToDisplay);
        } catch (err) {
          console.error("Error al abrir el enlace de cliente persiste: ", err);
          window.showNotification(
            "Error al abrir el enlace de cliente persiste.",
            "error"
          );
        }
      };
    } else {
      console.error(
        "Error: openSurveyPersisteLinkBtn not found in DOM when trying to attach event listener."
      );
    }

    // Copy pre-filled link
    if (copySurveyPersisteLinkBtn) {
      copySurveyPersisteLinkBtn.onclick = async () => {
        try {
          await navigator.clipboard.writeText(urlToDisplay);
          window.showNotification(
            "¡Enlace de cliente persiste copiado!",
            "success"
          );
          console.log("Survey persiste link copied:", urlToDisplay);
        } catch (err) {
          console.error("Error al copiar el enlace de cliente persiste: ", err);
          window.showNotification(
            "Error al copiar el enlace de cliente persiste.",
            "error"
          );
        }
      };
    } else {
      console.error(
        "Error: copySurveyPersisteLinkBtn not found in DOM when trying to attach event listener."
      );
    }

    const autoSendUrl = urlToDisplay.replace(
      "/viewform?usp=pp_url",
      "/formResponse?usp=pp_url"
    );

    // Open auto-send link in popup
    if (openAutoSendSurveyPersisteLinkBtn) {
      openAutoSendSurveyPersisteLinkBtn.onclick = () => {
        try {
          window.open(autoSendUrl, '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
          window.showNotification("¡Enlace de envío automático de cliente persiste abierto en nueva ventana!", "success");
          console.log("Auto-send survey persiste link opened:", autoSendUrl);
        } catch (err) {
          console.error("Error al abrir el enlace de envío automático de cliente persiste: ", err);
          window.showNotification(
            "Error al abrir el enlace de envío automático de cliente persiste.",
            "error"
          );
        }
      };
    } else {
      console.error(
        "Error: openAutoSendSurveyPersisteLinkBtn not found in DOM when trying to attach event listener."
      );
    }

    // Copy auto-send link
    if (copyAutoSendSurveyPersisteLinkBtn) {
      copyAutoSendSurveyPersisteLinkBtn.onclick = async () => {
        try {
          await navigator.clipboard.writeText(autoSendUrl);
          window.showNotification(
            "¡Enlace de envío automático de cliente persiste copiado!",
            "success"
          );
          console.log("Auto-send survey persiste link copied:", autoSendUrl);
        } catch (err) {
          console.error(
            "Error al copiar el enlace de envío automático de cliente persiste: ",
            err
          );
          window.showNotification(
            "Error al copiar el enlace de envío automático de cliente persiste.",
            "error"
          );
        }
      };
    } else {
      console.error(
        "Error: copyAutoSendSurveyPersisteLinkBtn not found in DOM when trying to attach event listener."
      );
    }
  }, 100); // Wait 100ms for the modal to be ready
}
