export const loginModalContent = `
<div class="login-modal">
  <div class="login-content">
    <div class="logo-container" id="loginLogo">
      <img src="assets/logo.svg" alt="Logo de Inicio de Sesión" style="max-width: 200px; height: auto;">
    </div>
    <h2>Iniciar Sesión</h2>
    <p>
      Ingrese su tipo y número de documento para acceder al sistema.
    </p>
    <p class="login-subtitle">
      Este dato se solicita para la función de envío de sondeo.
    </p>
    <form id="loginForm">
      <div class="form-group">
        <label for="documentType">Tipo de Documento:</label>
        <select id="documentType" name="documentType" required>
          <option value="">Seleccione</option>
          <option value="Cédula">Cédula</option>
          <option value="Pasaporte">Pasaporte</option>
        </select>
      </div>
      <div class="form-group password-container">
        <label for="documentNumber">Número de Documento:</label>
        <input
          type="password"
          id="documentNumber"
          name="documentNumber"
          placeholder="Ingrese su número de documento"
          maxlength="20"
          required
        />
        <span class="material-icons toggle-password" onclick="window.togglePasswordVisibility()">visibility</span>
      </div>
      <div id="loginMessage" class="login-message error" style="display: none;"></div>
      <button type="submit">Ingresar</button>
    </form>
    <div style="display: flex; align-items: center; justify-content: center; margin-top: 20px;">
      <img id="mundo-logo" src="assets/mundo.svg" alt="Logo Mundo" style="max-width: 100px; height: auto; margin-right: 5px;">
      <span style="font-size: 24px; font-weight: bold; margin-right: 5px;">X</span>
      <img id="konecta-logo" src="assets/konecta.svg" alt="Logo Konecta" style="max-width: 100px; height: auto;">
    </div>
  </div>
</div>`;
