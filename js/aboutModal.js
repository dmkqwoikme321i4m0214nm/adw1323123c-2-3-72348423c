// Function to initialize the about modal
export function initializeAboutModal() {
  const aboutModalLogo = document.getElementById("aboutModalLogo");
  const developerNameSpan = document.getElementById("developerName");
  const appVersionSpan = document.getElementById("appVersion");
  const correctionList = document.getElementById("correctionList");

  // Get the about modal's content area
  const aboutModal = document.getElementById("aboutModal"); // Assuming the modal itself has this ID
  let modalContent = null;
  if (aboutModal) {
    modalContent = aboutModal.querySelector(".modal-content");
  }

  // Set about modal title and logo
  if (aboutModalLogo) {
    const img = document.createElement("img");
    img.src = "assets/logo.svg"; // Main logo is always logo.svg
    img.alt = "Logo";
    img.style.width = "200px"; // Adjust size as needed
    img.style.height = "auto";
    img.style.display = "block";
    img.style.margin = "0 auto";
    aboutModalLogo.appendChild(img);
  }

  // Create logos container
  const logosContainer = document.createElement("div");
  logosContainer.style.display = "flex";
  logosContainer.style.alignItems = "center";
  logosContainer.style.justifyContent = "center";
  logosContainer.style.marginTop = "10px";

  const mundoImg = document.createElement("img");
  mundoImg.src = "assets/mundo.svg";
  mundoImg.alt = "Logo Mundo";
  mundoImg.style.width = "100px";
  mundoImg.style.height = "auto";
  mundoImg.style.marginRight = "5px";
  logosContainer.appendChild(mundoImg);

  const xSpan = document.createElement("span");
  xSpan.textContent = "X";
  xSpan.style.fontSize = "24px";
  xSpan.style.fontWeight = "bold";
  xSpan.style.marginRight = "5px";
  logosContainer.appendChild(xSpan);

  const konectaImg = document.createElement("img");
  konectaImg.src = "assets/konecta.svg";
  konectaImg.alt = "Logo Konecta";
  konectaImg.style.width = "100px";
  konectaImg.style.height = "auto";
  logosContainer.appendChild(konectaImg);

  // Append logos container to the modal content, not the logo area
  if (modalContent) {
    modalContent.appendChild(logosContainer);
  } else {
    // Fallback if modalContent is not found, append to aboutModalLogo as before
    if (aboutModalLogo) {
      aboutModalLogo.appendChild(logosContainer);
    }
  }

  // Set developer name and app version
  if (developerNameSpan) {
    developerNameSpan.textContent = "Team Edward"; // Or fetch dynamically if needed
  }
  if (appVersionSpan) {
    appVersionSpan.textContent = "3.0.0"; // Or fetch dynamically if needed
  }

  // Define combined correction data
  const allCorrections = [
    "Se añade un nuevo tema moderno.",
    "Se agregan funciones de plantillas predefinidas y sugerencias de plantillas.",
    "Se agrega modo navideño.",
    "Se agrega exportación a XLS.",
    "Se agrega función de detalle de observaciones.",
    "Se agrega función de abrir ventanas al enviar un formulario.",
    "Se agregan funciones de cliente persiste, incluyendo la adición de preguntas y actualización a Persiste v2."
  ];

  // Populate the combined correction list
  if (correctionList) {
    allCorrections.forEach((correction) => {
      const p = document.createElement("p");
      p.textContent = correction;
      correctionList.appendChild(p);
    });
  }
}

// Function to open the about modal (already exists in main.js, but good to have here for context)
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = "block";
  }
}

// Function to close the about modal (already exists in main.js, but good to have here for context)
function cerrarModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = "none";
  }
}
