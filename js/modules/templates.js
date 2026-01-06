/**
 * TypifyPro 3.0 - Templates Module
 * Handles template searching and application using SheetJS (XLSX)
 */

class TemplatesModule {
    constructor() {
        this.templates = [];
        this.listId = 'templatesList';
        this.searchId = 'templateSearch';
        this.modalId = 'templatesModal';
        this.categoriesId = 'templateCategories';
    }

    async init(context = 'All') {
        this.context = context; // Store context for search/filtering
        // Only load if empty
        if (this.templates.length === 0) {
            await this.loadTemplates();
        }
        this.renderCategories(context);
        this.renderList(this.templates, context);
    }

    async loadTemplates() {
        try {
            // 1. Fetch file list
            const response = await fetch('templates/templates.json');
            if (!response.ok) throw new Error("Failed to load templates.json");

            const fileList = await response.json();
            // Expected fileList: ["templates/plantillas.xlsx", ...] directly or just ["plantillas.xlsx"] if relative

            let allTemplates = [];

            // 2. Process each file
            for (let filePath of fileList) {
                // Adjust path if needed. Assuming json contains "plantillas.xlsx", we prefix "templates/"
                const fullPath = filePath.startsWith('templates/') ? filePath : `templates/${filePath}`;

                try {
                    const fileRes = await fetch(fullPath);
                    const arrayBuffer = await fileRes.arrayBuffer();

                    // 3. Parse with SheetJS
                    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
                    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                    const jsonData = XLSX.utils.sheet_to_json(firstSheet);

                    // 4. Map to internal structure
                    const mapped = jsonData.map((row, index) => ({
                        id: row.id || `row-${index}`,
                        title: row.nombre || "Sin Título",
                        category: row.categoria === 'Otros' ? 'General' : (row.categoria || 'General'), // Normalize 'Otros'
                        tags: row.tags ? String(row.tags).split(',').map(s => s.trim()) : [],
                        content: row.observacion || "",
                        // Optional extra fields
                        tipificacion: {
                            tipoTarea: row.tipoTarea,
                            motivo: row.motivo,
                            subvaloracion: row.subvaloracion,
                            estado: row.estado
                        }
                    })).filter(t => t.title && t.content); // Basic validation

                    allTemplates = [...allTemplates, ...mapped];

                } catch (err) {
                    console.error(`Error loading file ${filePath}:`, err);
                }
            }

            this.templates = allTemplates;
            console.log(`Loaded ${this.templates.length} templates.`);

        } catch (error) {
            console.error("Error initializing templates:", error);
            // Fallback empty or specific error state
        }
    }

    renderCategories(context) {
        const container = document.getElementById(this.categoriesId);
        if (!container) return;

        // If context is Transferencia, HIDE the categories tabs as requested
        if (context === 'Transferencia') {
            container.style.display = 'none';
            container.innerHTML = '';
            // Ensure any styling offset is handled if needed
            return;
        } else {
            container.style.display = 'flex'; // Restore if previously hidden
        }

        let categories = ['Todas', ...new Set(this.templates.map(t => t.category))].sort();

        container.innerHTML = categories.map(cat => `
            <span class="tag ${cat === 'Todas' ? 'active' : ''}" 
                  onclick="window.TemplatesModule.filterByCategory('${cat}', this)">
                ${cat}
            </span>
        `).join('');
    }

    renderList(items, context = 'All') {
        const container = document.getElementById(this.listId);
        if (!container) return;

        // Use stored context if argument is 'All' (default) but we have a specific stored context
        const effectiveContext = (context === 'All' && this.context) ? this.context : context;

        let filteredItems = items;

        if (effectiveContext === 'Transferencia') {
            filteredItems = items.filter(t =>
                t.category.toLowerCase().includes('transferencia') ||
                t.tags.some(tag => tag.toLowerCase().includes('transferencia'))
            );
        }

        if (filteredItems.length === 0) {
            container.innerHTML = '<div class="empty-state">No se encontraron plantillas.</div>';
            return;
        }

        container.innerHTML = filteredItems.map(t => `
            <div class="template-card" onclick="window.TemplatesModule.apply('${t.id}')">
                <div class="template-header">
                    <h4>${t.title}</h4>
                    <span class="badge badge-${this.getBadgeClass(t.category)}">${t.category}</span>
                </div>
                <div class="template-preview">${t.content.substring(0, 100)}...</div>
                <div class="template-tags">
                    ${t.tags.map(tag => `<span class="mini-tag">#${tag}</span>`).join('')}
                </div>
            </div>
        `).join('');
    }

    internalRenderList(items) {
        const container = document.getElementById(this.listId);
        if (!container) return;
        if (items.length === 0) {
            container.innerHTML = '<div class="empty-state">No se encontraron plantillas.</div>';
            return;
        }
        container.innerHTML = items.map(t => `
            <div class="template-card" onclick="window.TemplatesModule.apply('${t.id}')">
                <div class="template-header">
                    <h4>${t.title}</h4>
                    <span class="badge badge-${this.getBadgeClass(t.category)}">${t.category}</span>
                </div>
                <div class="template-preview">${t.content.substring(0, 100)}...</div>
                <div class="template-tags">
                    ${t.tags.map(tag => `<span class="mini-tag">#${tag}</span>`).join('')}
                </div>
            </div>
        `).join('');
    }

    getBadgeClass(category) {
        // Simple mapping to styles
        const low = category.toLowerCase();
        if (low.includes('soporte')) return 'soporte';
        if (low.includes('transferencia')) return 'transferencia';
        if (low.includes('agenda') || low.includes('visita')) return 'agenda';
        return 'default';
    }

    filterByCategory(category, element) {
        // UI update
        const tags = document.getElementById(this.categoriesId).querySelectorAll('.tag');
        tags.forEach(t => t.classList.remove('active'));
        if (element) element.classList.add('active');

        // Filter
        if (category === 'Todas') {
            this.search(document.getElementById(this.searchId).value);
        } else {
            const query = document.getElementById(this.searchId).value.toLowerCase();
            const filtered = this.templates.filter(t =>
                t.category === category &&
                (t.title.toLowerCase().includes(query) || t.tags.some(tag => tag.toLowerCase().includes(query)))
            );
            // Re-use internal renderList but without context restriction (user clicked a specific category)
            // But wait, if context is Transferencia, renderCategories only showed Transferencia tags anyway.
            this.internalRenderList(filtered);
        }
    }

    search(query) {
        const q = query.toLowerCase();
        // Check active category
        const activeCatBtn = document.getElementById(this.categoriesId)?.querySelector('.tag.active');
        const activeCat = activeCatBtn ? activeCatBtn.innerText.trim() : 'Todas';

        const filtered = this.templates.filter(t => {
            const matchQuery = t.title.toLowerCase().includes(q) ||
                t.content.toLowerCase().includes(q) ||
                t.tags.some(tag => tag.toLowerCase().includes(q));

            let matchCat = activeCat === 'Todas' || t.category === activeCat;

            // Apply Context Strict Filter
            if (this.context === 'Transferencia') {
                const isTransfer = t.category.toLowerCase().includes('transferencia') ||
                    t.tags.some(tag => tag.toLowerCase().includes('transferencia'));
                if (!isTransfer) return false;
            }

            return matchQuery && matchCat;
        });

        this.internalRenderList(filtered);
    }

    apply(id) {
        const template = this.templates.find(t => t.id === id);
        if (!template) return;

        // Check if we are in GenObs context (Support tab)
        const suporteGenerado = document.getElementById('soporteGenerado');
        const observacionForm = document.getElementById('observacionForm');

        let target = null;
        const genObsModal = document.getElementById('genobsModal');

        if (genObsModal && genObsModal.style.display !== 'none' && suporteGenerado && suporteGenerado.offsetParent !== null) {
            target = suporteGenerado;
        } else if (observacionForm) {
            target = observacionForm;
        }

        if (target) {
            const current = target.value;
            target.value = current ? current + "\n\n" + template.content : template.content;

            // SHOW TEMPLATE INFO (Typification)
            if (target.id === 'soporteGenerado') {
                const infoContainer = document.getElementById('templateInfoContainer');
                const infoContent = document.getElementById('templateInfoContent');
                if (infoContainer && infoContent) {
                    const tip = template.tipificacion || {};
                    infoContainer.style.display = 'block';
                    infoContent.innerHTML = `
                        <div class="info-grid">
                            <div class="info-item"><strong>Tipo de tarea:</strong> ${tip.tipoTarea || 'N/A'}</div>
                            <div class="info-item"><strong>Motivo:</strong> ${tip.motivo || 'N/A'}</div>
                            <div class="info-item"><strong>Subvaloración:</strong> ${tip.subvaloracion || tip.submotivo || 'N/A'}</div>
                            <div class="info-item"><strong>Estado:</strong> ${tip.estado || 'N/A'}</div>
                        </div>
                    `;
                }
            }

            // Log
            console.log(`Plantilla aplicada: ${template.title}`);
            window.closeModal(this.modalId);
        }
    }

    open(context = 'All') {
        const modal = document.getElementById(this.modalId);
        if (modal) modal.style.display = 'flex';

        // Always try to init/refresh if empty
        this.init(context);

        const searchInput = document.getElementById(this.searchId);
        if (searchInput) searchInput.focus();
    }
}

window.TemplatesModule = new TemplatesModule();
