// Function to handle tab switching for the Genobs modal
export const setupGenobsTabs = (modalId) => {
  const modal = document.querySelector(`#${modalId}.genobs-feature`);
  if (!modal) return;

  const tabButtons = modal.querySelectorAll(".genobs-tab-button");
  const tabContents = modal.querySelectorAll(".genobs-tab-content");
  const limpiarPreguntasBtn = document.getElementById("limpiarPreguntasBtn");

  // Function to update button visibility
  const updateButtonVisibility = (targetTab) => {
    if (limpiarPreguntasBtn) {
      if (targetTab === "preguntas") {
        limpiarPreguntasBtn.style.display = "flex";
      } else {
        limpiarPreguntasBtn.style.display = "none";
      }
    }
  };

  // Show button initially if on preguntas tab
  const activeButton = modal.querySelector(".genobs-tab-button.active");
  if (activeButton) {
    updateButtonVisibility(activeButton.dataset.tab);
  }

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const targetTab = button.dataset.tab;

      // Deactivate all tab buttons and contents
      tabButtons.forEach((btn) => btn.classList.remove("active"));
      tabContents.forEach((content) => content.classList.remove("active"));

      // Activate the clicked tab button and its corresponding content
      button.classList.add("active");
      document.getElementById(`${targetTab}-tab`).classList.add("active");

      // Update button visibility
      updateButtonVisibility(targetTab);
    });
  });
};

// Function to update questions based on service type
export const actualizarPreguntas = () => {
  const tipoServicioElement = document.getElementById("tipoServicio");
  if (!tipoServicioElement) return;

  const tipoServicio = tipoServicioElement.value;
  const tvQuestions = document.getElementById("tvQuestions");
  const tresMundosSwitch = document.getElementById("tresMundosSwitchContainer");

  // Only proceed if elements exist
  if (!tvQuestions || !tresMundosSwitch) return;

  // Hide all conditional sections by default
  tvQuestions.style.display = "none";
  tresMundosSwitch.style.display = "none";

  if (tipoServicio === "TV HD") {
    tvQuestions.style.display = "block";
    const commonTvQuestions = document.getElementById("commonTvQuestions");
    const extendedTvQuestions = document.getElementById("extendedTvQuestions");
    if (commonTvQuestions) commonTvQuestions.style.display = "block";
    if (extendedTvQuestions) {
      extendedTvQuestions.style.display = "none";
      // Clear extended fields
      const extendedFields = [
        "decodificador",
        "reinicioElectrico",
        "cableHDMIAV",
        "observacionTV",
      ];
      extendedFields.forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.value = "";
      });
    }
  } else if (tipoServicio === "Peliculas") {
    tvQuestions.style.display = "block";
    const commonTvQuestions = document.getElementById("commonTvQuestions");
    const extendedTvQuestions = document.getElementById("extendedTvQuestions");
    if (commonTvQuestions) commonTvQuestions.style.display = "block";
    if (extendedTvQuestions) extendedTvQuestions.style.display = "block";
  } else if (
    tipoServicio === "3 MUNDOS (Todos los servicios)" ||
    tipoServicio === "MUNDO GO"
  ) {
    tresMundosSwitch.style.display = "block";
    // Also check the switch state in case it was already checked
    toggleTvQuestions();
  }
};

// Function to toggle TV questions based on switch
export const toggleTvQuestions = () => {
  const tipoServicio = document.getElementById("tipoServicio").value;
  const tvQuestionsContainer = document.getElementById("tvQuestions");
  const fallaTvSwitch = document.getElementById("fallaTvSwitch");
  const commonTvQuestions = document.getElementById("commonTvQuestions");
  const extendedTvQuestions = document.getElementById("extendedTvQuestions");

  if (!tvQuestionsContainer || !fallaTvSwitch) return;

  if (fallaTvSwitch.checked) {
    if (tipoServicio === "3 MUNDOS (Todos los servicios)") {
      tvQuestionsContainer.style.display = "block";
      if (commonTvQuestions) commonTvQuestions.style.display = "block";
      if (extendedTvQuestions) extendedTvQuestions.style.display = "block";
    } else if (tipoServicio === "MUNDO GO") {
      tvQuestionsContainer.style.display = "block";
      if (commonTvQuestions) commonTvQuestions.style.display = "block";
      if (extendedTvQuestions) {
        extendedTvQuestions.style.display = "none";
        // Clear extended fields
        const extendedFields = [
          "decodificador",
          "reinicioElectrico",
          "cableHDMIAV",
          "observacionTV",
        ];
        extendedFields.forEach((id) => {
          const el = document.getElementById(id);
          if (el) el.value = "";
        });
      }
    } else {
      tvQuestionsContainer.style.display = "none";
      // Clear all TV fields if container is hidden
      const allTvFields = [
        "controlRemoto",
        "cambioPilas",
        "pruebaCruzada",
        "decodificador",
        "reinicioElectrico",
        "cableHDMIAV",
        "observacionTV",
      ];
      allTvFields.forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.value = "";
      });
    }
  } else {
    tvQuestionsContainer.style.display = "none";
    // Clear all TV fields if switch is off
    const allTvFields = [
      "controlRemoto",
      "cambioPilas",
      "pruebaCruzada",
      "decodificador",
      "reinicioElectrico",
      "cableHDMIAV",
      "observacionTV",
    ];
    allTvFields.forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.value = "";
    });
  }
};

// Function to toggle Motivo Comunicacion Otros input
export const toggleMotivoComunicacionOtros = () => {
  const motivoSelect = document.getElementById("motivoComunicacion");
  const otrosContainer = document.getElementById("motivoComunicacionOtrosContainer");
  const otrosInput = document.getElementById("motivoComunicacionOtros");

  if (motivoSelect && otrosContainer && otrosInput) {
    if (motivoSelect.value === "Otros:") {
      otrosContainer.style.display = "block";
    } else {
      otrosContainer.style.display = "none";
      otrosInput.value = ""; // Clear input when hidden
    }
  }
};

// Function to clear Genobs fields
export const limpiarGenobsCampos = () => {
  console.log("Limpiar Genobs Campos clicked");
  // Clear fields in the genobs modal
  const fieldsToClear = [
    "suministroElectrico", "generadorElectrico", "tiempoFalla", "tipoServicio", "tipoServicioGeneral",
    "motivoComunicacion", "motivoComunicacionOtros", // Added new fields
    "estadoOnt", "clienteMasiva", "fallaMasiva", "visitaTecnica",
    "soporteGenerado", "instalacionReparacion", "estadoLuces",
    "controlRemoto", "cambioPilas", "pruebaCruzada", "clienteReincidente",
    "fallaRespuestaGenobs", "decodificador", "reinicioElectrico", "cableHDMIAV", "observacionTV"
  ];

  fieldsToClear.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });

  document.getElementById("extraPreguntas").innerHTML = ""; // Clear dynamic questions (if any remain)

  // Reset borders
  const fieldsToResetBorder = [
    ...fieldsToClear,
    "perdidaMonitoreo"
  ];

  fieldsToResetBorder.forEach((fieldId) => {
    const field = document.getElementById(fieldId);
    if (field) {
      field.style.border = "";
    }
  });

  // Hide conditional TV questions
  const tvQuestions = document.getElementById("tvQuestions");
  if (tvQuestions) tvQuestions.style.display = "none";

  const tresMundosSwitch = document.getElementById("tresMundosSwitchContainer");
  if (tresMundosSwitch) tresMundosSwitch.style.display = "none";

  const fallaTvSwitch = document.getElementById("fallaTvSwitch");
  if (fallaTvSwitch) {
    fallaTvSwitch.checked = false;
  }

  // Hide Motivo Comunicacion Otros container
  const motivoOtrosContainer = document.getElementById("motivoComunicacionOtrosContainer");
  if (motivoOtrosContainer) {
    motivoOtrosContainer.style.display = "none";
  }
};

// Function to validate the Genobs modal form fields
export const validateGenobsForm = () => {
  const requiredFields = [
    "suministroElectrico",
    "generadorElectrico",
    "tiempoFalla",
    "tipoServicio",
    "tipoServicioGeneral",
    "motivoComunicacion", // Added new field
    "instalacionReparacion",
    "clienteReincidente",
    "estadoLuces",
    "estadoOnt",
    "clienteMasiva",
    "fallaMasiva",
    "visitaTecnica",
    "soporteGenerado",
    "perdidaMonitoreo",
    "clienteConectadoPor",
    "estadoOntPersiste",
    "redesUnificadas",
    "fallaRespuestaGenobs",
  ];

  let allFieldsFilled = true;
  let firstEmptyField = null;

  requiredFields.forEach((fieldId) => {
    const field = document.getElementById(fieldId);
    if (field) {
      // Always validate these fields, regardless of current tab visibility
      if (field.value === "" || field.value === "Seleccione") {
        allFieldsFilled = false;
        if (!firstEmptyField) {
          firstEmptyField = field;
        }
        field.style.border = "2px solid var(--danger-color)"; // Highlight empty field
      } else {
        field.style.border = ""; // Reset border if filled
      }
    }
  });

  // Conditional validation for Motivo Comunicacion -> Otros
  const motivoComunicacion = document.getElementById("motivoComunicacion");
  const motivoComunicacionOtros = document.getElementById("motivoComunicacionOtros");
  if (
    motivoComunicacion &&
    motivoComunicacion.value === "Otros:" &&
    motivoComunicacionOtros
  ) {
    if (motivoComunicacionOtros.value.trim() === "") {
      allFieldsFilled = false;
      if (!firstEmptyField) {
        firstEmptyField = motivoComunicacionOtros;
      }
      motivoComunicacionOtros.style.border = "2px solid var(--danger-color)";
    } else {
      motivoComunicacionOtros.style.border = "";
    }
  }

  // Conditional validation for Redes Unificadas -> Otros
  const redesUnificadas = document.getElementById("redesUnificadas");
  const redesUnificadasOtros = document.getElementById("redesUnificadasOtros");
  if (
    redesUnificadas &&
    redesUnificadas.value === "Otros:" &&
    redesUnificadasOtros
  ) {
    if (
      redesUnificadasOtros.value.trim() === "" ||
      redesUnificadasOtros.value === "Seleccione"
    ) {
      allFieldsFilled = false;
      if (!firstEmptyField) {
        firstEmptyField = redesUnificadasOtros;
      }
      redesUnificadasOtros.style.border = "2px solid var(--danger-color)";
    } else {
      redesUnificadasOtros.style.border = "";
    }
  }

  // Always check conditional TV questions if the service type implies them
  const tipoServicio = document.getElementById("tipoServicio").value;
  const tvQuestionsContainer = document.getElementById("tvQuestions");

  if (
    tipoServicio === "TV HD" ||
    tipoServicio === "Peliculas" ||
    (tipoServicio === "3 MUNDOS (Todos los servicios)" &&
      tvQuestionsContainer.style.display === "block") ||
    (tipoServicio === "MUNDO GO" &&
      tvQuestionsContainer.style.display === "block")
  ) {
    // Common fields are always required if TV questions are shown
    const commonTvRequiredFields = [
      "controlRemoto",
      "cambioPilas",
      "pruebaCruzada",
    ];

    commonTvRequiredFields.forEach((fieldId) => {
      const field = document.getElementById(fieldId);
      if (field) {
        if (field.value === "" || field.value === "Seleccione") {
          allFieldsFilled = false;
          if (!firstEmptyField) {
            firstEmptyField = field;
          }
          field.style.border = "2px solid var(--danger-color)";
        } else {
          field.style.border = "";
        }
      }
    });

    // Extended fields are only required if NOT MUNDO GO (or if we decide MUNDO GO needs them later)
    // Actually, based on logic: MUNDO GO hides extended questions, so we shouldn't validate them if hidden.
    const extendedTvQuestions = document.getElementById("extendedTvQuestions");
    if (extendedTvQuestions && extendedTvQuestions.style.display !== "none") {
      const extendedTvRequiredFields = [
        "decodificador",
        "reinicioElectrico",
        "cableHDMIAV",
        "observacionTV",
      ];
      extendedTvRequiredFields.forEach((fieldId) => {
        const field = document.getElementById(fieldId);
        if (field) {
          if (field.value === "" || field.value === "Seleccione") {
            allFieldsFilled = false;
            if (!firstEmptyField) {
              firstEmptyField = field;
            }
            field.style.border = "2px solid var(--danger-color)";
          } else {
            field.style.border = "";
          }
        }
      });
    }
  }

  if (!allFieldsFilled) {
    window.showNotification(
      "Por favor, complete todos los campos obligatorios.",
      "error"
    );
    if (firstEmptyField) {
      firstEmptyField.focus(); // Focus on the first empty field
    }
  }
  return allFieldsFilled;
};

// Expose functions to global scope
window.actualizarPreguntas = actualizarPreguntas;
window.toggleTvQuestions = toggleTvQuestions;
window.limpiarGenobsCampos = limpiarGenobsCampos;
window.validateGenobsForm = validateGenobsForm;
window.toggleMotivoComunicacionOtros = toggleMotivoComunicacionOtros;
