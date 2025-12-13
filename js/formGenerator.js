import { handleShortcut } from "./tags.js";

let lastSelectedTypification = null; // Variable to store the last selected typification

export function renderFormFields(tipoTipificacion) {
  const formContenido = document.getElementById("formContenido");
  if (!formContenido) {
    console.error("Element with ID 'formContenido' not found.");
    return;
  }

  // Always clear existing content before rendering new fields
  formContenido.innerHTML = "";
  lastSelectedTypification = tipoTipificacion; // Update the last selected typification

  // Define common fields
  const commonFields = [
    {
      id: "clienteId",
      label: 'ID: <span style="color: var(--danger-color);">*</span>',
      type: "text",
      required: true,
      placeholder: "Ej: 123456789",
    },
    {
      id: "clienteNombre",
      label: 'Nombre Cliente: <span style="color: var(--danger-color);">*</span>',
      type: "text",
      required: true,
      placeholder: "Ej: Juan Pérez",
    },
    {
      id: "clienteContrato",
      label: 'Contrato: <span style="color: var(--danger-color);">*</span>',
      type: "text",
      required: true,
      placeholder: "Ej:MTC24/152465",
    },
    {
      id: "clienteRUT",
      label: 'RUT Cliente: <span style="color: var(--danger-color);">*</span>',
      type: "text",
      required: true,
      placeholder: "Ej: 12.345.678-9",
    },
    {
      id: "clienteTelefono",
      label: 'Teléfono Cliente: <span style="color: var(--danger-color);">*</span>',
      type: "tel",
      required: true,
      placeholder: "Ej: +56912345678",
    },
    {
      id: "clienteCorreo",
      label: 'Correo: <span style="color: var(--danger-color);">*</span>',
      type: "email",
      required: true,
      placeholder: "Ej: correo@ejemplo.com",
    },
    {
      id: "clienteDireccion",
      label: 'Dirección Cliente: <span style="color: var(--danger-color);">*</span>',
      type: "text",
      required: true,
      placeholder: "Ej: Calle Falsa 123, Comuna, Ciudad",
    },
    {
      id: "clienteONT",
      label: 'ONT: <span style="color: var(--danger-color);">*</span>',
      type: "text",
      required: true,
      placeholder: "Ej: ABC123456789",
    },
    {
      id: "clienteOLT",
      label: 'OLT: <span style="color: var(--danger-color);">*</span>',
      type: "text",
      required: true,
      placeholder: "Ej: OLT-01",
    },
    {
      id: "clienteTarjeta",
      label: 'Tarjeta: <span style="color: var(--danger-color);">*</span>',
      type: "text",
      required: true,
      placeholder: "Ej: Tarjeta 1",
    },
    {
      id: "clientePuerto",
      label: 'Puerto: <span style="color: var(--danger-color);">*</span>',
      type: "text",
      required: true,
      placeholder: "Ej: Puerto 5",
    },
    {
      id: "clienteNodo",
      label: 'Nodo: <span style="color: var(--danger-color);">*</span>',
      type: "text",
      required: true,
      placeholder: "Ej: NODO-XYZ",
    },
  ];

  let fieldsToRender = [];

  // Define minimal fields for most typification types
  const minimalFields = [
    {
      id: "clienteId",
      label: 'ID: <span style="color: var(--danger-color);">*</span>',
      type: "text",
      required: true,
      placeholder: "Ej: 123456789",
    },
    {
      id: "clienteNombre",
      label: 'Nombre Cliente: <span style="color: var(--danger-color);">*</span>',
      type: "text",
      required: true,
      placeholder: "Ej: Juan Pérez",
    },
    {
      id: "clienteContrato",
      label: 'Contrato: <span style="color: var(--danger-color);">*</span>',
      type: "text",
      required: true,
      placeholder: "Contrato",
    },
    {
      id: "clienteRUT",
      label: 'RUT Cliente: <span style="color: var(--danger-color);">*</span>',
      type: "text",
      required: true,
      placeholder: "Ej: 12.345.678-9",
    },
    {
      id: "clienteTelefono",
      label: 'Teléfono Cliente: <span style="color: var(--danger-color);">*</span>',
      type: "tel",
      required: true,
      placeholder: "Ej: +56912345678",
    },
    {
      id: "clienteCorreo",
      label: 'Correo: <span style="color: var(--danger-color);">*</span>',
      type: "email",
      required: true,
      placeholder: "Ej: correo@ejemplo.com",
    },
  ];

  switch (tipoTipificacion) {
    case "Movil":
    case "SAC":
    case "Transferencia (Soporte)":
      fieldsToRender = minimalFields;
      break;
    case "Soporte":
      fieldsToRender = commonFields; // "Soporte" now requires all common fields
      break;
    default:
      fieldsToRender = minimalFields; // Fallback to minimal fields if type is not recognized
      break;
  }

  // Add the "Observación" field to all typification types
  const observacionField = {
    id: "observacionForm", // Changed ID to match main.js
    label: 'Observación: <span style="color: var(--danger-color);">*</span>',
    type: "textarea",
    required: true,
    placeholder: "Escribe aquí la observación completa...", // Add placeholder for observation field
  };
  fieldsToRender.push(observacionField);

  fieldsToRender.forEach((field) => {
    const formGroup = document.createElement("div");
    formGroup.className = "form-group";

    const label = document.createElement("label");
    label.htmlFor = field.id;
    label.innerHTML = field.label;
    formGroup.appendChild(label);

    if (field.type === "textarea") {
      const textarea = document.createElement("textarea");
      textarea.id = field.id;
      textarea.name = field.id;
      if (field.required) {
        textarea.required = true;
      }
      if (field.id === "observacionForm" && tipoTipificacion === "Soporte") {
        textarea.readOnly = true;
        textarea.placeholder =
          "Selecciona el botón de lápiz para editar este campo";
      } else if (
        field.id === "observacionForm" &&
        (tipoTipificacion === "Movil" ||
          tipoTipificacion === "SAC")
      ) {
        textarea.placeholder = "Escribe aquí la observación completa...";
      } else if (
        field.id === "observacionForm" &&
        tipoTipificacion === "Transferencia (Soporte)"
      ) {
        textarea.placeholder = "Presiona F2 para buscar plantillas...";
      } else if (field.placeholder) {
        textarea.placeholder = field.placeholder;
      }

      if (field.id === "observacionForm") {
        const observationWrapper = document.createElement("div");
        observationWrapper.className = "observation-field-wrapper";

        observationWrapper.appendChild(textarea);

        // Add shortcut listener to observacionForm for specific typifications
        if (
          tipoTipificacion === "Soporte" ||
          tipoTipificacion === "Transferencia (Soporte)"
        ) {
          textarea.addEventListener("keydown", handleShortcut);

          // Add F2 listener for template search
          textarea.addEventListener("keydown", (e) => {
            if (e.key === "F2" && !e.ctrlKey && !e.altKey && !e.shiftKey && !e.metaKey) {
              e.preventDefault();
              let categoryFilter = null;
              if (tipoTipificacion === "Transferencia (Soporte)") {
                categoryFilter = "Transferencia";
              }
              if (window.openTemplateSearchPopup) {
                window.openTemplateSearchPopup(categoryFilter);
              }
            }
          });
        }

        if (tipoTipificacion === "Soporte") {
          // Changed from "Cliente Persistente" to "Soporte"
          const button = document.createElement("button");
          button.id = "observacion-modal-button";
          button.type = "button";
          button.className = "observacion-modal-button";
          button.innerHTML = '<span class="material-icons">edit</span>';
          button.title = "Generar Observación Completa";
          button.onclick = () => {
            const genobsModal = document.getElementById("genobs");
            if (genobsModal) {
              genobsModal.style.display = "flex";
            }
          };
          observationWrapper.appendChild(button);
        } else if (tipoTipificacion === "Transferencia (Soporte)") {
          // Add buttons for Transferencia (Soporte)
          const controlsContainer = document.createElement("div");
          controlsContainer.style.display = "flex";
          controlsContainer.style.gap = "5px";
          controlsContainer.style.position = "absolute";
          controlsContainer.style.right = "5px";
          controlsContainer.style.top = "5px";

          // Clear Button
          const clearButton = document.createElement("button");
          clearButton.type = "button";
          clearButton.className = "observacion-modal-button";
          clearButton.innerHTML = '<span class="material-icons">backspace</span>';
          clearButton.title = "Limpiar Campo";
          clearButton.style.position = "static";
          clearButton.onclick = () => {
            textarea.value = "";
            textarea.focus();
            window.showNotification("Campo limpiado", "success");
          };
          controlsContainer.appendChild(clearButton);

          observationWrapper.appendChild(controlsContainer);
          observationWrapper.style.position = "relative";
        }
        formGroup.appendChild(observationWrapper);
      } else {
        formGroup.appendChild(textarea);
      }
    } else if (field.type === "select") {
      const select = document.createElement("select");
      select.id = field.id;
      select.name = field.id;
      if (field.required) {
        select.required = true;
      }
      field.options.forEach((optionValue) => {
        const option = document.createElement("option");
        option.value = optionValue;
        option.textContent = optionValue;
        select.appendChild(option);
      });
      formGroup.appendChild(select);
    } else {
      const input = document.createElement("input");
      input.type = field.type;
      input.id = field.id;
      input.name = field.id;
      if (field.required) {
        input.required = true;
      }
      if (field.placeholder) {
        input.placeholder = field.placeholder;
      }
      formGroup.appendChild(input);
    }

    formContenido.appendChild(formGroup);
  });
}
