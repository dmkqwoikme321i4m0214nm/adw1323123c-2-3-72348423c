export const ShortcutsModule = {
    shortcuts: [],
    globalEnabled: true,

    init() {
        this.shortcuts = JSON.parse(localStorage.getItem('shortcuts')) || [];
        // Dispatch event so other modules can react (e.g. main execution)
        document.dispatchEvent(new CustomEvent('shortcutsLoaded', { detail: this.shortcuts }));

        // Listen for updates from other tabs/windows
        window.addEventListener('storage', (e) => {
            if (e.key === 'shortcuts') {
                this.shortcuts = JSON.parse(e.newValue) || [];
                document.dispatchEvent(new CustomEvent('shortcutsUpdated', { detail: this.shortcuts }));
                if (window.location.pathname.includes('shortcuts.html')) {
                    this.renderTable();
                }
            }
        });

        // Initialize temporary content if redirected from dashboard
        const tempContent = localStorage.getItem('temp_shortcut_content');
        if (tempContent && window.location.pathname.includes('shortcuts.html')) {
            localStorage.removeItem('temp_shortcut_content');
            setTimeout(() => {
                this.openModal();
                document.getElementById('shortcutTemplate').value = tempContent;
                document.getElementById('modalTitle').textContent = 'Guardar Plantilla Rápida';
                document.getElementById('shortcutName').focus();
            }, 500);
        }

        // Initial render if on shortcuts page
        if (window.location.pathname.includes('shortcuts.html')) {
            this.renderTable();
        }

        // GLOBAL DELEGATION: Attach listener to document
        document.addEventListener('keydown', this.boundHandleShortcut);
    },

    getShortcuts() {
        return this.shortcuts;
    },

    addShortcut(shortcut) {
        this.shortcuts.push(shortcut);
        this.save();
    },

    updateShortcut(index, shortcut) {
        if (index >= 0 && index < this.shortcuts.length) {
            this.shortcuts[index] = shortcut;
            this.save();
        }
    },

    deleteShortcut(index) {
        if (index >= 0 && index < this.shortcuts.length) {
            this.shortcuts.splice(index, 1);
            this.save();
        }
    },

    save() {
        localStorage.setItem('shortcuts', JSON.stringify(this.shortcuts));
        document.dispatchEvent(new CustomEvent('shortcutsUpdated', { detail: this.shortcuts }));
    },

    toggleGlobalListening(enabled) {
        this.globalEnabled = enabled;
        console.log(`Shortcut listening: ${enabled ? 'ENABLED' : 'DISABLED'}`);
    },

    // UI Functions for shortcuts.html
    formLoaded: false,

    async loadForm() {
        if (this.formLoaded) return;
        const bodyContainer = document.getElementById('shortcutModalBody');
        if (!bodyContainer) return;

        try {
            const response = await fetch('templates/shortcut-form.html');
            const html = await response.text();
            bodyContainer.innerHTML = html;
            this.formLoaded = true;
            this.setupFormListeners();
        } catch (error) {
            console.error('Error loading shortcut form:', error);
            bodyContainer.innerHTML = '<p style="color:red; padding:2rem;">Error al cargar el formulario. Por favor reintenta.</p>';
        }
    },

    setupFormListeners() {
        // Any specific post-injection setup if needed
    },

    toggleShortcutMode(isCombination) {
        const textInput = document.getElementById('textInputArea');
        const keyboardCapture = document.getElementById('keyboardCapture');
        const toggle = document.getElementById('shortcutTypeToggle');
        const keyInput = document.getElementById('shortcutKey'); // Added to handle focus

        if (toggle) toggle.checked = isCombination;

        if (isCombination) {
            if (textInput) textInput.style.display = 'none';
            if (keyboardCapture) {
                keyboardCapture.style.display = 'flex';
                keyboardCapture.classList.add('active');
            }
            window.addEventListener('keydown', this.boundHandleCombinationCapture);
        } else {
            if (textInput) textInput.style.display = 'block';
            if (keyboardCapture) {
                keyboardCapture.style.display = 'none';
                keyboardCapture.classList.remove('active');
            }
            window.removeEventListener('keydown', this.boundHandleCombinationCapture);
            if (keyInput) keyInput.focus();
        }
    },

    handleCombinationCapture(e) {
        const modal = document.getElementById('shortcutModal');
        const toggle = document.getElementById('shortcutTypeToggle');
        if (!modal || modal.style.display === 'none' || !toggle || !toggle.checked) return;

        // SKIP CAPTURE: If user is typing in another input or textarea
        const activeEl = document.activeElement;
        if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
            // But only if it's NOT the hidden input if we ever used it, 
            // mainly we care about Name and Template
            if (activeEl.id === 'shortcutName' || activeEl.id === 'shortcutTemplate' || activeEl.id === 'shortcutKey') {
                return;
            }
        }

        // Prevent default only if we are actually capturing
        if (e.ctrlKey || e.altKey || e.shiftKey || e.metaKey) {
            e.preventDefault();
        }

        const keysVisualList = document.getElementById('keysVisualList');
        const hiddenInput = document.getElementById('shortcutKeyHidden');
        if (!keysVisualList || !hiddenInput) return;

        const mods = [];
        if (e.ctrlKey) mods.push("Ctrl");
        if (e.altKey) mods.push("Alt");
        if (e.shiftKey) mods.push("Shift");

        // Main key (avoid capturing modifier keys alone as a main key)
        const isModKey = ["Control", "Alt", "Shift", "Meta"].includes(e.key);
        let mainKey = "";
        if (!isModKey) {
            mainKey = e.key.length === 1 ? e.key.toUpperCase() : e.key;
        }

        if (mods.length === 0 && !mainKey) return;

        // Build Visuals
        keysVisualList.innerHTML = '';
        mods.forEach(m => {
            const kbd = document.createElement('div');
            kbd.className = 'premium-key modifier';
            kbd.innerHTML = `<span>${m}</span>`;
            keysVisualList.appendChild(kbd);

            const plus = document.createElement('span');
            plus.className = 'key-plus';
            plus.textContent = '+';
            keysVisualList.appendChild(plus);
        });

        if (mainKey) {
            const kbd = document.createElement('div');
            kbd.className = 'premium-key main-key';
            kbd.innerHTML = `<span>${mainKey}</span>`;
            keysVisualList.appendChild(kbd);

            // Build hidden value: "Ctrl+Alt+S"
            const finalCombo = mods.length > 0 ? mods.join('+') + '+' + mainKey : mainKey;
            hiddenInput.value = finalCombo;
        } else {
            // Only modifiers pressed
            const waitSpan = document.createElement('span');
            waitSpan.style.color = 'var(--text-secondary)';
            waitSpan.style.fontSize = '0.75rem';
            waitSpan.textContent = ' (PULSA UNA TECLA)';
            keysVisualList.appendChild(waitSpan);
            hiddenInput.value = '';
        }
    },

    renderTable(filter = '') {
        const tableBody = document.querySelector('#shortcutsTable tbody');
        if (!tableBody) return;

        tableBody.innerHTML = '';
        const lowerFilter = filter.toLowerCase();

        const filtered = this.shortcuts.filter(s =>
            (s.name && s.name.toLowerCase().includes(lowerFilter)) ||
            (s.key && s.key.toLowerCase().includes(lowerFilter)) ||
            (s.category && s.category.toLowerCase().includes(lowerFilter))
        );

        if (filtered.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 3rem; color: var(--text-secondary);">No se encontraron atajos que coincidan con la búsqueda.</td></tr>';
            return;
        }

        filtered.forEach((s, index) => {
            const originalIndex = this.shortcuts.indexOf(s);
            const tr = document.createElement('tr');

            const categoryClass = `category-${(s.category || 'General').toLowerCase()}`;
            const categoryIcon = s.category === 'Soporte' ? 'support' :
                s.category === 'Técnico' ? 'settings' :
                    s.category === 'Ventas' ? 'shopping_cart' : 'label';

            tr.innerHTML = `
                <td>
                    <div style="display: flex; flex-direction: column;">
                        <span style="font-weight: 600; color: var(--text-primary);">${s.name || 'Sin nombre'}</span>
                    </div>
                </td>
                <td>
                    <span class="category-badge ${categoryClass}">
                        <span class="material-icons" style="font-size: 14px;">${categoryIcon}</span>
                        ${s.category || 'General'}
                    </span>
                </td>
                <td>
                    <div class="premium-kbd-container">
                        ${this.renderVisualKeys(s.key)}
                    </div>
                </td>
                <td>
                    <div class="template-preview" title="${s.template || ''}">
                        ${s.template || ''}
                    </div>
                </td>
                <td>
                    <div class="action-btn-group">
                        <button class="btn-icon-circle" onclick="window.ShortcutsModule.viewUI(${originalIndex})" title="Ver Detalle">
                            <span class="material-icons" style="font-size: 18px;">visibility</span>
                        </button>
                        <button class="btn-icon-circle" onclick="window.ShortcutsModule.editUI(${originalIndex})" title="Editar">
                            <span class="material-icons" style="font-size: 18px;">edit</span>
                        </button>
                        <button class="btn-icon-circle delete" onclick="window.ShortcutsModule.deleteUI(${originalIndex})" title="Eliminar">
                            <span class="material-icons" style="font-size: 18px;">delete_outline</span>
                        </button>
                    </div>
                </td>
            `;
            tableBody.appendChild(tr);
        });
    },

    async editUI(index) {
        const shortcut = this.shortcuts[index];
        if (!shortcut) return;

        await this.openModal(true);

        // Populate Modal
        document.getElementById('shortcutId').value = index;
        document.getElementById('shortcutName').value = shortcut.name;
        document.getElementById('shortcutCategory').value = shortcut.category || 'General';
        document.getElementById('shortcutTemplate').value = shortcut.template;

        const isCombination = (shortcut.type === 'combination');
        document.getElementById('shortcutTypeToggle').checked = isCombination;
        this.toggleShortcutMode(isCombination);

        if (isCombination) {
            this.renderVisualKeysToElement(shortcut.key, document.getElementById('keysVisualList'));
            document.getElementById('shortcutKeyHidden').value = shortcut.key;
        } else {
            document.getElementById('shortcutKey').value = shortcut.key;
        }

        document.getElementById('modalTitle').textContent = 'Editar Atajo';
    },

    viewUI(index) {
        const s = this.shortcuts[index];
        if (!s) return;

        const modal = document.getElementById('shortcutViewModal');
        if (!modal) return;

        document.getElementById('viewShortcutName').textContent = s.name || 'Sin Nombre';
        document.getElementById('viewShortcutCategory').textContent = s.category || 'General';
        document.getElementById('viewShortcutCategory').className = `category-badge category-${(s.category || 'General').toLowerCase()}`;

        const keyContainer = document.getElementById('viewShortcutKey');
        this.renderVisualKeysToElement(s.key, keyContainer);

        document.getElementById('viewShortcutTemplate').textContent = s.template || '';

        // Setup edit button from view modal
        const editBtn = document.getElementById('viewEditBtn');
        editBtn.onclick = () => {
            modal.style.display = 'none';
            this.editUI(index);
        };

        modal.style.display = 'flex';
    },

    deleteUI(index) {
        this.showConfirm('¿Estás seguro de eliminar este atajo? Esta acción no se puede deshacer.', () => {
            this.deleteShortcut(index);
            this.renderTable(document.getElementById('searchInput')?.value || '');
        });
    },

    showConfirm(message, onConfirm) {
        const modal = document.getElementById('confirmModal');
        const msgEl = document.getElementById('confirmMessage');
        const btn = document.getElementById('confirmBtn');

        if (!modal || !msgEl || !btn) {
            if (confirm(message)) onConfirm();
            return;
        }

        msgEl.textContent = message;
        modal.style.display = 'flex';

        // Re-setup listener to avoid accumulation
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        newBtn.addEventListener('click', () => {
            onConfirm();
            modal.style.display = 'none';
        });
    },

    async openModal(isEdit = false) {
        document.getElementById('shortcutModal').style.display = 'flex';
        await this.loadForm();
        if (!isEdit) {
            this.resetForm();
            // Default to text mode
            this.toggleShortcutMode(false);
        }
    },

    closeModal() {
        document.getElementById('shortcutModal').style.display = 'none';
        window.removeEventListener('keydown', this.boundHandleCombinationCapture);
        this.resetForm();
    },

    resetForm() {
        const form = document.getElementById('shortcutForm');
        if (form) form.reset();
        const idInput = document.getElementById('shortcutId');
        if (idInput) idInput.value = '';
        const title = document.getElementById('modalTitle');
        if (title) title.textContent = 'Crear Nuevo Atajo';

        const keysVisualList = document.getElementById('keysVisualList');
        const hiddenInput = document.getElementById('shortcutKeyHidden');
        if (keysVisualList) {
            keysVisualList.innerHTML = '<span style="color: var(--text-secondary); font-size: 0.8rem;">PULSA UNA COMBINACIÓN...</span>';
        }
        if (hiddenInput) hiddenInput.value = "";
    },

    // Form handler
    handleSave(event) {
        event.preventDefault();
        const id = document.getElementById('shortcutId').value;
        const name = document.getElementById('shortcutName').value.trim();
        const category = document.getElementById('shortcutCategory').value;
        const template = document.getElementById('shortcutTemplate').value;
        const isCombination = document.getElementById('shortcutTypeToggle').checked;
        const type = isCombination ? 'combination' : 'text';

        let key = "";
        if (isCombination) {
            key = document.getElementById('shortcutKeyHidden').value;
        } else {
            key = document.getElementById('shortcutKey').value.trim();
        }

        if (!name && !key) {
            alert('Debe tener Nombre o Tecla');
            return;
        }

        const data = { name, key, category, template, type };

        if (id) {
            this.updateShortcut(parseInt(id), data);
        } else {
            this.addShortcut(data);
        }

        this.closeModal();
        this.renderTable(document.getElementById('searchInput')?.value || '');
    },

    renderVisualKeys(keyString) {
        if (!keyString) return '-';

        // If it's a text shortcut like /saludo
        if (keyString.startsWith('/')) {
            return `<code class="shortcut-key-badge">${keyString}</code>`;
        }

        const parts = keyString.split('+');
        return parts.map((part, index) => {
            const isLast = index === parts.length - 1;
            const isModifier = !isLast || ["Ctrl", "Alt", "Shift"].includes(part);
            const className = isModifier ? 'premium-key modifier' : 'premium-key main-key';

            // Note: We use smaller versions here for the table if needed, or stick to the size
            // For the table, let's use a scale or inline styles to make them fit
            return `<div class="${className}" style="display:inline-flex; min-width:35px; height:30px; font-size:0.75rem; vertical-align:middle; margin-bottom: 2px;"><span>${part}</span></div>`;
        }).join('<span class="key-plus" style="margin: 0 4px; font-size:1rem;">+</span>');
    },

    renderVisualKeysToElement(keyString, container) {
        if (!container) return;
        container.innerHTML = '';
        if (!keyString) {
            container.innerHTML = '<span style="color: var(--text-secondary); font-size: 0.8rem;">PULSA UNA COMBINACIÓN...</span>';
            return;
        }

        const parts = keyString.split('+');
        parts.forEach((part, index) => {
            const isLast = index === parts.length - 1;
            const kbd = document.createElement('div');
            // If it's a combination with +, last part is main key, others are modifiers
            // But if it's a single key, it's main key.
            const isModifier = !isLast || ["Ctrl", "Alt", "Shift"].includes(part);

            kbd.className = isModifier ? 'premium-key modifier' : 'premium-key main-key';
            kbd.innerHTML = `<span>${part}</span>`;
            container.appendChild(kbd);

            if (!isLast) {
                const plus = document.createElement('span');
                plus.className = 'key-plus';
                plus.textContent = '+';
                container.appendChild(plus);
            }
        });
    },

    async guardarPlantillaRapida() {
        let textarea = document.getElementById('soporteGenerado');
        if (!textarea || !textarea.value.trim()) {
            textarea = document.getElementById('outputPreview');
        }

        if (!textarea) {
            window.showToast?.('No se encontró el campo de texto para guardar.', 'error');
            return;
        }

        const content = textarea.value.trim();
        if (!content) {
            window.showToast?.('Por favor, escribe algo antes de guardar.', 'warning');
            return;
        }

        // Open modal if it exists (standalone page or integrated)
        const modal = document.getElementById('shortcutModal');
        if (modal) {
            await this.openModal();
            const templateEl = document.getElementById('shortcutTemplate');
            const titleEl = document.getElementById('modalTitle');
            if (templateEl) templateEl.value = content;
            if (titleEl) titleEl.textContent = 'Guardar Plantilla Rápida';
            setTimeout(() => document.getElementById('shortcutName')?.focus(), 100);
        } else {
            // Redirect to shortcuts manager with the content
            window.showToast?.('Redirigiendo al Gestor de Atajos...', 'info');
            localStorage.setItem('temp_shortcut_content', content);
            setTimeout(() => {
                window.location.href = 'shortcuts.html';
            }, 800);
        }
    },

    handleShortcut(e) {
        if (this.globalEnabled === false) return;

        // GUARD: Only process text inputs and textareas
        const target = e.target;
        if (!target || (target.tagName !== 'TEXTAREA' && (target.tagName !== 'INPUT' || target.type !== 'text'))) {
            return;
        }

        // GUARD: Avoid expanding shortcuts in the shortcut editor itself
        if (target.id === 'shortcutTemplate' || target.id === 'shortcutName' || target.id === 'shortcutKey') {
            return;
        }

        // 1. Combinations
        if (e.ctrlKey || e.altKey || e.shiftKey) {
            if (["Control", "Alt", "Shift"].includes(e.key)) return;

            let keyParts = [];
            if (e.ctrlKey) keyParts.push("Ctrl");
            if (e.altKey) keyParts.push("Alt");
            if (e.shiftKey) keyParts.push("Shift");
            keyParts.push(e.key.toUpperCase());
            const keyString = keyParts.join("+");

            const found = this.shortcuts.find(s => s.key && s.key.toLowerCase() === keyString.toLowerCase() && s.type === 'combination');

            if (found) {
                e.preventDefault();
                const start = target.selectionStart;
                const text = target.value;
                target.value = text.substring(0, start) + found.template + text.substring(start);
                target.selectionStart = target.selectionEnd = start + found.template.length;
                return;
            }
        }

        // 2. Text Shortcuts
        if (e.key === "Enter") {
            const currentText = target.value;
            const textBeforeCursor = currentText.substring(0, target.selectionStart);
            const lastWordMatch = textBeforeCursor.match(/(\/\w+)$/);

            if (lastWordMatch) {
                const shortcutKey = lastWordMatch[1];
                const found = this.shortcuts.find(s => s.key === shortcutKey && s.type !== 'combination');

                if (found) {
                    e.preventDefault();
                    const textAfterCursor = currentText.substring(target.selectionStart);
                    const newText = textBeforeCursor.replace(lastWordMatch[0], found.template) + textAfterCursor;
                    const newCursorPos = textBeforeCursor.length - lastWordMatch[0].length + found.template.length;
                    target.value = newText;
                    target.selectionStart = target.selectionEnd = newCursorPos;
                }
            }
        }
    },

    applyListeners(container = document) {
        // Redundant due to global delegation in init()
    },

    boundHandleShortcut: null
};

// Bind the handlers
ShortcutsModule.boundHandleShortcut = ShortcutsModule.handleShortcut.bind(ShortcutsModule);
ShortcutsModule.boundHandleCombinationCapture = ShortcutsModule.handleCombinationCapture.bind(ShortcutsModule);

// Auto-init
ShortcutsModule.init();

// Export globally
window.ShortcutsModule = ShortcutsModule;
window.guardarPlantillaRapida = ShortcutsModule.guardarPlantillaRapida.bind(ShortcutsModule);
