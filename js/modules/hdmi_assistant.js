/**
 * HDMI Chat Assistant Module
 * Implements a conversational interface for finding HDMI configuration steps.
 */

const brandsData = [

    {
        keywords: ['samsung', 'samung', 'sansung', 'smasung'],
        name: 'Samsung',
        logo: 'assets/brands/samsung.svg',
        remote: 'assets/remotes/samsung.svg',
        response: `Para configurar un <strong>Samsung Smart TV</strong> (Tizen OS):
        <br><br>
        Samsung llama a esta función "Input Signal Plus" en modelos nuevos y "UHD Color" en los antiguos.
        <ol class="chat-step-list">
            <li>Presiona el botón <strong>Inicio (Casa)</strong> en tu One Remote.</li>
            <li>Navega hacia la izquierda hasta el ícono de <strong>Configuración (Engranaje)</strong>.</li>
            <li>Ve a <strong>General</strong> > <strong>Administrador de dispositivos externos</strong>.</li>
            <li>Entra en <strong>Input Signal Plus</strong> (o HDMI UHD Color).</li>
            <li>Verás unos círculos al lado de cada HDMI. Asegúrate de que el círculo de tu puerto esté <strong>Activado (Azul)</strong>.</li>
        </ol>`,
        steps: ['btn-home', 'btn-settings', 'btn-ok', 'btn-ok', 'btn-back']
    },
    {
        keywords: ['sony', 'bravia'],
        name: 'Sony',
        logo: 'assets/brands/sony.svg',
        remote: 'assets/remotes/sony.svg',
        response: `Para televisores <strong>Sony Bravia</strong>:
        <ol class="chat-step-list">
            <li>Presiona <strong>HOME</strong> y selecciona <strong>Configuración</strong>.</li>
            <li>Entra en <strong>Canales y Entradas</strong> > <strong>Entradas externas</strong>.</li>
            <li>Selecciona <strong>Formato de señal HDMI</strong>.</li>
            <li>Cambia el puerto a <strong>Formato mejorado</strong>.</li>
        </ol>`,
        steps: ['btn-home', 'btn-settings', 'btn-ok', 'btn-ok']
    },
    {
        keywords: ['xiaomi', 'mi tv'],
        name: 'Xiaomi',
        logo: 'assets/brands/android.svg',
        remote: 'assets/remotes/default.svg',
        response: `Para <strong>Xiaomi / Mi TV</strong> (Android TV):
        <ol class="chat-step-list">
            <li>Ve a <strong>Configuración</strong> > <strong>Preferencias del dispositivo</strong>.</li>
            <li>Entra en <strong>Entradas</strong>.</li>
            <li>En <strong>Versión de HDMI</strong>, selecciona <strong>HDMI 2.0</strong> o 2.1.</li>
        </ol>`,
        steps: ['btn-settings', 'btn-down', 'btn-ok']
    },
    {
        keywords: ['tcl', 'roku'],
        name: 'TCL',
        logo: 'assets/brands/tcl.svg',
        remote: 'assets/remotes/default.svg',
        response: `Para <strong>TCL</strong> (Roku/Android):
        <ol class="chat-step-list">
            <li>Presiona <strong>* (Opciones)</strong> o Configuración.</li>
            <li>Ve a <strong>Entradas de TV</strong> > <strong>Modo HDMI</strong>.</li>
            <li>Cambia de "Auto" a <strong>HDMI 2.0</strong>.</li>
        </ol>`,
        steps: ['btn-settings', 'btn-ok', 'btn-ok']
    },
    {
        keywords: ['android', 'google', 'google tv', 'android tv'],
        name: 'Android TV',
        logo: 'assets/brands/android.svg',
        remote: 'assets/remotes/default.svg',
        response: `Si usas <strong>Android TV / Google TV</strong>:
        <ol class="chat-step-list">
            <li>Ve a <strong>Configuración</strong> (engranaje).</li>
            <li>Entra en <strong>Canales y Entradas</strong> > <strong>Entradas externas</strong>.</li>
            <li>Busca <strong>Formato de señal HDMI</strong>.</li>
            <li>Selecciona el puerto y cámbialo a <strong>Formato mejorado</strong>.</li>
        </ol>`,
        steps: ['btn-settings', 'btn-down', 'btn-ok', 'btn-ok']
    },
    {
        keywords: ['hisense', 'hisen'],
        name: 'Hisense',
        logo: 'assets/brands/hisense.svg',
        remote: 'assets/remotes/default.svg',
        response: `Para <strong>Hisense</strong> (Vidaa/Android):
        <ol class="chat-step-list">
            <li>Presiona el botón <strong>Menú</strong> (cuadrado o hamburguesa).</li>
            <li>Ve a <strong>Configuración</strong> > <strong>Sistema</strong> (o Imagen).</li>
            <li>Busca <strong>Función HDMI</strong> o <strong>Formato HDMI</strong>.</li>
            <li>Cambia de "Estándar" a <strong>Formato Mejorado</strong> (Enhanced).</li>
        </ol>`,
        steps: ['btn-settings', 'btn-down', 'btn-ok']
    },
    {
        keywords: ['philips', 'ambilight'],
        name: 'Philips',
        logo: 'assets/brands/philips.svg',
        remote: 'assets/remotes/default.svg',
        response: `Para <strong>Philips</strong>:
        <ol class="chat-step-list">
            <li>Ajustes > <strong>Todos los ajustes</strong> > <strong>General</strong>.</li>
            <li>Entra en <strong>HDMI Ultra HD</strong>.</li>
            <li>Selecciona <strong>Óptimo</strong>.</li>
        </ol>`,
        steps: ['btn-settings', 'btn-down', 'btn-ok']
    },
    {
        keywords: ['toshiba', 'fire tv'],
        name: 'Toshiba',
        logo: 'assets/brands/android.svg',
        remote: 'assets/remotes/default.svg',
        response: `Para <strong>Toshiba Fire TV</strong>:
        <ol class="chat-step-list">
            <li>Mantén presionado el botón <strong>Home</strong> > <strong>Configuración</strong>.</li>
            <li>Ve a <strong>Pantalla y Sonido</strong> > <strong>Entradas</strong>.</li>
            <li>Cambia el formato HDMI a <strong>Mejorado (Enhanced)</strong>.</li>
        </ol>`,
        steps: ['btn-home', 'btn-down', 'btn-ok']
    },
    {
        keywords: ['jvc'],
        name: 'JVC',
        logo: 'assets/brands/android.svg',
        remote: 'assets/remotes/default.svg',
        response: `Para <strong>JVC</strong> (Modelos Android/Roku):
        <ol class="chat-step-list">
            <li>Ve a <strong>Settings (Configuración)</strong> > <strong>Picture (Imagen)</strong>.</li>
            <li>Entra en <strong>Additional Settings</strong>.</li>
            <li>Busca <strong>HDMI ULTRA HD Deep Color</strong> y actívalo.</li>
        </ol>`,
        steps: ['btn-settings', 'btn-down', 'btn-ok']
    },
    {
        keywords: ['rca'],
        name: 'RCA',
        logo: 'assets/brands/android.svg',
        remote: 'assets/remotes/default.svg',
        response: `Para <strong>RCA</strong>:
        <ol class="chat-step-list">
            <li>Presiona <strong>Menu</strong> y ve a <strong>Function</strong> (Función).</li>
            <li>Busca el menú <strong>HDMI EDID</strong>.</li>
            <li>Cambia de 1.4 a <strong>EDID 2.0</strong>.</li>
        </ol>`,
        steps: ['btn-settings', 'btn-down', 'btn-ok']
    },
    {
        keywords: ['sharp', 'aquos'],
        name: 'Sharp',
        logo: 'assets/brands/android.svg',
        remote: 'assets/remotes/default.svg',
        response: `Para <strong>Sharp Aquos</strong>:
        <ol class="chat-step-list">
            <li>Presiona <strong>Menu</strong> o <strong>Input</strong>.</li>
            <li>Selecciona el puerto activo.</li>
            <li>Busca "<strong>Change HDMI EDID version</strong>".</li>
            <li>Selecciona <strong>HDMI 2.1</strong> o <strong>Enhanced</strong>.</li>
        </ol>`,
        steps: ['btn-settings', 'btn-ok', 'btn-ok']
    },
    {
        keywords: ['insignia'],
        name: 'Insignia',
        logo: 'assets/brands/android.svg',
        remote: 'assets/remotes/default.svg',
        response: `Para <strong>Insignia</strong> (Fire TV Edition):
        <ol class="chat-step-list">
            <li>Mantén el botón <strong>Home</strong> y ve a <strong>Configuración</strong>.</li>
            <li>Ve a <strong>Display & Sounds</strong> > <strong>HDMI Input Mode</strong>.</li>
            <li>Cámbialo a <strong>Mode 2 (2.0)</strong>.</li>
        </ol>`,
        steps: ['btn-home', 'btn-down', 'btn-ok']
    },
    {
        keywords: ['hitachi'],
        name: 'Hitachi',
        logo: 'assets/brands/android.svg',
        remote: 'assets/remotes/default.svg',
        response: `Para <strong>Hitachi</strong>:
        <ol class="chat-step-list">
            <li>Menú > <strong>Picture (Imagen)</strong> o <strong>Advanced Settings</strong>.</li>
            <li>Busca <strong>HDMI ULTRA HD Deep Color</strong>.</li>
            <li>Actívalo para el puerto HDMI correspondiente.</li>
        </ol>`,
        steps: ['btn-settings', 'btn-down', 'btn-ok']
    },
    {
        keywords: ['element'],
        name: 'Element',
        logo: 'assets/brands/android.svg',
        remote: 'assets/remotes/default.svg',
        response: `Para <strong>Element</strong>:
        <ol class="chat-step-list">
            <li>Menú > <strong>TV Settings</strong> > <strong>General</strong>.</li>
            <li>Busca <strong>HDMI Mode</strong> o <strong>EDID</strong>.</li>
            <li>Selecciona <strong>Graphic</strong> o <strong>HDMI 2.0</strong>.</li>
        </ol>`,
        steps: ['btn-settings', 'btn-down', 'btn-ok']
    }
];

const fallbackResponses = [
    "No estoy seguro de qué marca es esa. ¿Podrías intentar con Samsung, LG, Sony o Android?",
    "Intenta escribir solo la marca, por ejemplo: 'Samsung' o 'LG'.",
    "Aún estoy aprendiendo sobre nuevas marcas. 😅 Revisa si tu TV tiene Android TV, en ese caso los pasos de Android pueden servirte."
];

class HdmiChat {
    constructor() {
        this.chatHistory = document.getElementById('chatHistory');
        this.chatInput = document.getElementById('chatInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.suggestionsContainer = document.getElementById('brandSuggestions');
        this.typingIndicator = document.getElementById('typingIndicator');

        this.isTyping = false;

        this.init();
    }

    init() {
        this.sendBtn.addEventListener('click', () => this.handleUserMessage());
        this.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleUserMessage();
        });

        const clearBtn = document.getElementById('clearChatBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearChat());
        }

        const viewBrandsBtn = document.getElementById('viewBrandsBtn');
        if (viewBrandsBtn) {
            viewBrandsBtn.addEventListener('click', () => this.showBrandsList());
        }

        this.renderSuggestions();
        setTimeout(() => this.chatInput.focus(), 500);
    }

    clearChat() {
        // Keep only the welcome message
        const welcomeMsg = this.chatHistory.firstElementChild;
        this.chatHistory.innerHTML = '';
        if (welcomeMsg) this.chatHistory.appendChild(welcomeMsg);

        // Or re-create the welcome message if the user wants a full reset
        if (!this.chatHistory.hasChildNodes()) {
            // Re-add default greeting if everything is wiped
            this.chatHistory.innerHTML = `
                <div class="message bot">
                    <div class="avatar"><img src="assets/user.png" alt="AI" style="width: 100%; height: 100%; object-fit: cover;"></div>
                    <div class="msg-sender">AI Assistant</div>
                    <div class="msg-bubble">
                        ¡Hola! 👋 Soy el asistente que te ayudará a gestionar la configuración de HDMI con tu cliente.
                        <br><br>
                        <strong>¿Qué marca de TV tiene?</strong> (Ej: Samsung, Sony, LG...)
                    </div>
                </div>`;
        }
    }

    showBrandsList() {
        const brandsList = brandsData.map(brand => `\u003cstrong\u003e${brand.name}\u003c/strong\u003e`).join(', ');
        const message = `
            \u003cstrong\u003e📺 Marcas Soportadas:\u003c/strong\u003e
            \u003cbr\u003e\u003cbr\u003e
            ${brandsList}
            \u003cbr\u003e\u003cbr\u003e
            \u003cem style=\"color: var(--text-secondary); font-size: 0.9rem;\"\u003eHaz clic en cualquier marca de arriba o escribe su nombre para ver los pasos de configuración.\u003c/em\u003e
        `;
        this.addRichMessage(message, null, null, false);
    }

    renderSuggestions() {
        this.suggestionsContainer.innerHTML = brandsData.slice(0, 7).map(brand => `
            <div class="chip" onclick="window.hdmiChat.sendQuery('${brand.name}')">
                ${brand.logo ? `<img src="${brand.logo}" alt="${brand.name}">` : ''}
                ${brand.name}
            </div>
        `).join('');
    }

    scrollToBottom() {
        this.chatHistory.scrollTop = this.chatHistory.scrollHeight;
    }

    showTyping() {
        this.typingIndicator.style.display = 'flex';
        this.scrollToBottom();
        this.isTyping = true;
    }

    hideTyping() {
        this.typingIndicator.style.display = 'none';
        this.isTyping = false;
    }

    // New unified message adder
    addRichMessage(text, remoteUrl = null, steps = null, isUser = false) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${isUser ? 'user' : 'bot'}`;

        // Remove 80% max-width restriction for rich messages to allow side-by-side
        if (remoteUrl) msgDiv.style.maxWidth = '100%';

        const avatarHtml = isUser ? '' : `<div class="avatar"><img src="assets/user.png" alt="AI" style="width: 100%; height: 100%; object-fit: cover;"></div>`;
        const senderName = isUser ? 'Tú' : 'AI Assistant';

        let contentHtml = `<div class="msg-bubble">${text}</div>`;

        // If we have a remote, we wrap content in a row
        if (remoteUrl) {
            contentHtml = `
            <div class="message-row">
                <div class="msg-bubble" style="flex: 1;">${text}</div>
                <div class="msg-bubble" style="background: transparent; border: none; padding: 0;">
                    <div class="remote-placeholder" style="width: 140px; height: 380px;"></div>
                </div>
            </div>`;
        }

        msgDiv.innerHTML = `
            ${avatarHtml}
            ${!isUser ? `<div class="msg-sender">${senderName}</div>` : ''}
            ${contentHtml}
        `;

        this.chatHistory.appendChild(msgDiv);
        this.scrollToBottom();

        // Load Remote if present
        if (remoteUrl) {
            this.loadRemoteSVG(msgDiv.querySelector('.remote-placeholder'), remoteUrl, steps);
        }
    }

    async handleUserMessage() {
        const text = this.chatInput.value.trim();
        if (!text || this.isTyping) return;

        this.addRichMessage(text, null, null, true);
        this.chatInput.value = '';

        this.showTyping();

        const delay = Math.random() * 500 + 400;
        await new Promise(r => setTimeout(r, delay));

        this.hideTyping();
        const responseData = this.generateResponse(text);

        this.addRichMessage(responseData.text, responseData.remote, responseData.steps, false);
    }

    sendQuery(text) {
        this.chatInput.value = text;
        this.handleUserMessage();
    }

    generateResponse(inputText) {
        const normalized = inputText.toLowerCase().trim();

        // Check for greetings - use word boundaries to avoid matching "hi" in "hisense"
        if (normalized.match(/^(hola|buenos dias|hey|hello|hi)(\s|$)/)) {
            return { text: "¡Hola! 👋 Soy el asistente que te ayudará a gestionar la configuración de HDMI con tu cliente. ¿Qué marca de TV tiene?" };
        }

        const foundBrand = brandsData.find(b => b.keywords.some(k => normalized.includes(k)));

        if (foundBrand) {
            return {
                text: foundBrand.response,
                steps: foundBrand.steps,
                remote: foundBrand.remote || 'assets/remotes/default.svg'
            };
        }

        return {
            text: "No reconozco esa marca, pero la mayoría de TV modernos usan Android TV o sistemas similares. <br><br>Te sugiero intentar con la configuración de <strong>Android TV</strong>, ya que suele funcionar para muchas marcas genéricas."
        };
    }

    async loadRemoteSVG(container, remoteUrl, steps) {
        if (!container) return;
        try {
            const resp = await fetch(remoteUrl);
            const svgText = await resp.text();

            container.innerHTML = svgText;

            const svgRoot = container.querySelector('svg');
            const badgesLayer = svgRoot.getElementById('badges_layer');
            const arrowsLayer = svgRoot.getElementById('arrows_layer');

            if (svgRoot && badgesLayer && steps) {
                const points = [];

                steps.forEach((btnClass, index) => {
                    const btnGroup = svgRoot.querySelector(`.${btnClass}`);
                    if (!btnGroup) return;

                    let x, y;
                    const bbox = btnGroup.getBBox();

                    x = bbox.x + bbox.width / 2;
                    y = bbox.y + bbox.height / 2;

                    const circle = btnGroup.querySelector('circle');
                    if (circle) {
                        x = parseFloat(circle.getAttribute('cx')) || x;
                        y = parseFloat(circle.getAttribute('cy')) || y;
                    }

                    // Apply active Transforms
                    let elem = btnGroup;
                    while (elem && elem !== svgRoot) {
                        const tr = elem.getAttribute('transform');
                        if (tr) {
                            const match = tr.match(/translate\(([^,]+)(?:,\s*([^)]+))?\)/);
                            if (match) {
                                x += parseFloat(match[1] || 0);
                                y += parseFloat(match[2] || 0);
                            }
                        }
                        elem = elem.parentElement;
                    }

                    points.push({ x, y });

                    const badge = document.createElementNS("http://www.w3.org/2000/svg", "g");
                    badge.setAttribute("class", "step-badge");
                    badge.setAttribute("style", `animation-delay: ${index * 0.4}s`);

                    const badgeCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                    badgeCircle.setAttribute("cx", x);
                    badgeCircle.setAttribute("cy", y);
                    badgeCircle.setAttribute("r", "9");

                    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
                    text.setAttribute("x", x);
                    text.setAttribute("y", y + 1);
                    text.setAttribute("text-anchor", "middle");
                    text.setAttribute("dominant-baseline", "middle");
                    text.textContent = (index + 1).toString();

                    badge.appendChild(badgeCircle);
                    badge.appendChild(text);
                    badgesLayer.appendChild(badge);
                });

                if (arrowsLayer && points.length > 1) {
                    let pathD = `M ${points[0].x} ${points[0].y}`;
                    for (let i = 1; i < points.length; i++) {
                        pathD += ` L ${points[i].x} ${points[i].y}`;
                    }

                    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
                    path.setAttribute("d", pathD);
                    path.setAttribute("class", "flow-arrow");
                    arrowsLayer.appendChild(path);
                }
            }
        } catch (e) {
            console.error("Error loading remote SVG", e);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.hdmiChat = new HdmiChat();
});
