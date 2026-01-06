
// Template Search Popup Module (F2 Shortcut)
// Ported and adapted from legacy project

let currentSearchQuery = '';
let selectedIndex = -1;
let filteredResults = [];

// Create the search popup HTML
export function createTemplateSearchPopup() {
    if (document.getElementById('templateSearchPopup')) return;

    const popupHTML = `
        <div id="templateSearchPopup" class="template-search-popup" style="display: none;">
            <div class="template-search-container">
                <div class="template-search-header">
                    <i class="material-icons" style="font-size: 18px; color: var(--accent-primary);">search</i>
                    <input 
                        type="text" 
                        id="templateSearchInput" 
                        placeholder="Buscar plantillas y atajos..."
                        autocomplete="off"
                    />
                    <span class="template-search-close" onclick="window.closeTemplateSearchPopup()">
                        <i class="material-icons">close</i>
                    </span>
                </div>
                
                <!-- Category Tabs -->
                <div class="template-search-categories" id="templateSearchCategories">
                    <button class="category-tab active" data-category="all">
                        <i class="material-icons">apps</i>
                        <span>Todas</span>
                    </button>
                </div>
                
                <div class="template-search-results" id="templateSearchResults">
                    <div class="template-search-empty">
                        <i class="material-icons">keyboard</i>
                        <p>Escribe para buscar plantillas y atajos</p>
                    </div>
                </div>
                <div class="template-search-footer">
                   <div class="template-search-hint">
                        <span><kbd>↑</kbd> <kbd>↓</kbd> navegar</span>
                        <span><kbd>↵</kbd> seleccionar</span>
                        <span><kbd>Esc</kbd> cerrar</span>
                   </div>
                </div>
            </div>
        </div>
    `;

    const container = document.createElement('div');
    container.innerHTML = popupHTML;
    document.body.appendChild(container.firstElementChild);

    // Add styles
    addTemplateSearchStyles();

    // Setup event listeners
    setupTemplateSearchListeners();
}

// Add CSS styles for the popup
function addTemplateSearchStyles() {
    if (document.getElementById('templateSearchStyles')) return;

    const style = document.createElement('style');
    style.id = 'templateSearchStyles';
    style.textContent = `
        .template-search-popup {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(4px);
            z-index: 10000;
            display: flex;
            align-items: flex-start;
            justify-content: center;
            padding-top: 100px;
            animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        .template-search-container {
            background: var(--bg-primary, #1e1e2d);
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            width: 90%;
            max-width: 600px;
            max-height: 70vh;
            display: flex;
            flex-direction: column;
            animation: slideDown 0.3s ease;
            border: 1px solid var(--input-border, #3f4254);
            color: var(--text-primary, #fff);
        }

        @keyframes slideDown {
            from {
                transform: translateY(-20px);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }

        .template-search-header {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 16px 20px;
            border-bottom: 1px solid var(--input-border, #3f4254);
        }

        .template-search-header input {
            flex: 1;
            border: none;
            background: transparent;
            color: var(--text-primary, #fff);
            font-size: 16px;
            outline: none;
        }

        .template-search-header input::placeholder {
            color: var(--text-secondary, #b5b5c3);
        }

        .template-search-close {
            cursor: pointer;
            color: var(--text-secondary, #b5b5c3);
            display: flex;
            align-items: center;
            transition: color 0.2s;
        }

        .template-search-close:hover {
            color: var(--danger-color, #f64e60);
        }

        .template-search-results {
            overflow-y: auto;
            max-height: calc(70vh - 120px);
            padding: 8px;
        }

        .template-search-empty {
            text-align: center;
            padding: 40px 20px;
            color: var(--text-secondary, #b5b5c3);
        }

        .template-search-empty i {
            font-size: 48px;
            opacity: 0.5;
            margin-bottom: 12px;
        }

        .template-search-empty p {
            margin: 0;
            font-size: 14px;
        }

        .template-result-item {
            padding: 12px 16px;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s;
            border: 1px solid transparent;
            margin-bottom: 6px;
        }

        .template-result-item.selected {
            background: var(--bg-tertiary, #2b2b40);
            border-color: var(--accent-primary, #3699ff);
        }

        .template-result-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 6px;
        }

        .template-result-title {
            font-weight: 600;
            color: var(--text-primary, #fff);
            font-size: 14px;
        }

        .template-result-category {
            background: var(--accent-primary, #3699ff);
            color: #fff;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 10px;
            font-weight: 600;
        }

        .template-result-preview {
            color: var(--text-secondary, #b5b5c3);
            font-size: 12px;
            line-height: 1.4;
            max-height: 40px;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
        }

        .template-search-footer {
            padding: 12px 20px;
            border-top: 1px solid var(--input-border, #3f4254);
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 12px;
            color: var(--text-secondary, #b5b5c3);
        }
        
        .template-search-hint {
            display: flex;
            gap: 16px;
        }
        
        .template-search-hint span {
            display: flex;
            align-items: center;
            gap: 4px;
        }

        .template-search-hint kbd {
            background: var(--bg-tertiary, #2b2b40);
            padding: 2px 6px;
            border-radius: 4px;
            font-family: monospace;
            font-size: 11px;
            border: 1px solid var(--input-border, #3f4254);
        }
        
        /* Category Tabs Styles - Single line with horizontal scroll */
        .template-search-categories {
            display: flex;
            gap: 8px;
            padding: 16px 20px 12px 20px;
            border-bottom: 1px solid var(--input-border, #3f4254);
            flex-wrap: nowrap;
            overflow-x: auto;
            overflow-y: hidden;
            background: var(--bg-secondary, #151521);
            scrollbar-width: thin;
            scrollbar-color: var(--accent-primary, #3699ff) var(--bg-tertiary, #2b2b40);
        }
        
        .template-search-categories::-webkit-scrollbar {
            height: 6px;
        }
        
        .template-search-categories::-webkit-scrollbar-track {
            background: var(--bg-tertiary, #2b2b40);
            border-radius: 3px;
        }
        
        .template-search-categories::-webkit-scrollbar-thumb {
            background: var(--accent-primary, #3699ff);
            border-radius: 3px;
        }
        
        .category-tab {
            background: var(--bg-tertiary, #2b2b40);
            border: 2px solid var(--input-border, #3f4254);
            color: var(--text-secondary, #b5b5c3);
            padding: 10px 18px;
            border-radius: 24px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 8px;
            white-space: nowrap;
            min-width: fit-content;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
            flex-shrink: 0;
        }
        
        .category-tab:hover {
            border-color: var(--accent-primary, #3699ff);
            color: var(--accent-primary, #3699ff);
            background: rgba(54, 153, 255, 0.15);
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(54, 153, 255, 0.2);
        }
        
        .category-tab.active {
            background: var(--accent-primary, #3699ff);
            color: white;
            border-color: var(--accent-primary, #3699ff);
            box-shadow: 0 4px 12px rgba(54, 153, 255, 0.4);
            transform: translateY(-1px);
        }
        
        .category-tab .material-icons {
            font-size: 18px;
        }
        
        /* Ensure proper spacing and visibility */
        .template-search-header {
            padding: 20px 20px 16px 20px;
        }
        
        .template-search-results {
            padding: 12px 20px 8px 20px;
            max-height: calc(70vh - 200px);
        }
    `;
    document.head.appendChild(style);
}

// Setup event listeners
function setupTemplateSearchListeners() {
    const searchInput = document.getElementById('templateSearchInput');
    const popup = document.getElementById('templateSearchPopup');

    if (searchInput) {
        // Search input
        searchInput.addEventListener('input', (e) => {
            currentSearchQuery = e.target.value;
            performSearch(currentSearchQuery);
        });

        // Keyboard navigation
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                selectedIndex = Math.min(selectedIndex + 1, filteredResults.length - 1);
                updateSelection();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                selectedIndex = Math.max(selectedIndex - 1, -1);
                updateSelection();
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (selectedIndex >= 0 && filteredResults[selectedIndex]) {
                    applySelectedTemplate(filteredResults[selectedIndex]);
                }
            } else if (e.key === 'Escape') {
                e.preventDefault();
                closeTemplateSearchPopup();
            }
        });
    }

    // Close on background click
    if (popup) {
        popup.addEventListener('click', (e) => {
            if (e.target === popup) {
                closeTemplateSearchPopup();
            }
        });
    }
}

// Perform search
function performSearch(query) {
    // Use window.TemplatesModule instead of window.templateManager
    if (!window.TemplatesModule || !window.TemplatesModule.templates) {
        return;
    }

    const templates = window.TemplatesModule.templates;
    const q = query.toLowerCase();

    // Get active category
    const activeCategoryBtn = document.querySelector('.category-tab.active');
    const activeCategory = activeCategoryBtn ? activeCategoryBtn.dataset.category : 'all';

    // Filter logic
    let results = templates;
    
    // Apply category filter first
    if (activeCategory !== 'all') {
        results = results.filter(t => t.category === activeCategory);
    }

    // Apply search query
    if (q) {
        results = results.filter(t => {
            return t.title.toLowerCase().includes(q) ||
                t.content.toLowerCase().includes(q) ||
                (t.tags && t.tags.some(tag => tag.toLowerCase().includes(q)));
        });
    }

    // Checking for forced category filter (if needed in future)
    const popup = document.getElementById('templateSearchPopup');
    if (popup && popup.dataset.forcedCategory) {
        const category = popup.dataset.forcedCategory.toLowerCase();
        results = results.filter(t => t.category.toLowerCase() === category);
    }

    // Limit results
    filteredResults = results.slice(0, 50);

    selectedIndex = -1;
    renderSearchResults(filteredResults, query);
}

// Render category tabs
function renderCategoryTabs() {
    const categoriesContainer = document.getElementById('templateSearchCategories');
    if (!categoriesContainer || !window.TemplatesModule || !window.TemplatesModule.templates) {
        return;
    }

    // Get unique categories
    const categories = ['Todas', ...new Set(window.TemplatesModule.templates.map(t => t.category))].sort();
    
    // Clear existing tabs except "Todas"
    const existingTabs = categoriesContainer.querySelectorAll('.category-tab:not([data-category="all"])');
    existingTabs.forEach(tab => tab.remove());

    // Ensure "Todas" button exists and has click event
    let allTab = categoriesContainer.querySelector('[data-category="all"]');
    if (!allTab) {
        allTab = document.createElement('button');
        allTab.className = 'category-tab active';
        allTab.dataset.category = 'all';
        allTab.innerHTML = `
            <i class="material-icons">apps</i>
            <span>Todas</span>
        `;
        categoriesContainer.insertBefore(allTab, categoriesContainer.firstChild);
    }

    // Add click event to "Todas" button
    allTab.addEventListener('click', () => {
        // Update active state
        document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
        allTab.classList.add('active');
        
        // Perform search with "all" category filter
        performSearch(currentSearchQuery);
    });

    // Add category tabs with better styling
    categories.forEach((category, index) => {
        if (category === 'Todas') return; // Skip "Todas" as it's already handled
        
        const tab = document.createElement('button');
        tab.className = 'category-tab';
        tab.dataset.category = category;
        
        // Use appropriate icons for different categories
        let icon = 'folder';
        const lowerCategory = category.toLowerCase();
        if (lowerCategory.includes('internet')) icon = 'wifi';
        else if (lowerCategory.includes('tv') || lowerCategory.includes('televisión')) icon = 'tv';
        else if (lowerCategory.includes('teléfono') || lowerCategory.includes('voz')) icon = 'phone';
        else if (lowerCategory.includes('soporte')) icon = 'support_agent';
        else if (lowerCategory.includes('transferencia')) icon = 'swap_horiz';
        else if (lowerCategory.includes('general')) icon = 'category';
        
        tab.innerHTML = `
            <i class="material-icons">${icon}</i>
            <span>${category}</span>
        `;
        
        // Add click event
        tab.addEventListener('click', () => {
            // Update active state
            document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Perform search with new category filter
            performSearch(currentSearchQuery);
        });
        
        // Add hover effects
        tab.addEventListener('mouseenter', () => {
            if (!tab.classList.contains('active')) {
                tab.style.transform = 'translateY(-2px)';
            }
        });
        
        tab.addEventListener('mouseleave', () => {
            if (!tab.classList.contains('active')) {
                tab.style.transform = 'translateY(0)';
            }
        });
        
        categoriesContainer.appendChild(tab);
    });
    
    // Ensure the container is visible and properly sized
    categoriesContainer.style.display = 'flex';
    categoriesContainer.style.visibility = 'visible';
}

// Render search results
function renderSearchResults(results, query) {
    const resultsContainer = document.getElementById('templateSearchResults');
    if (!resultsContainer) return;

    if (results.length === 0) {
        resultsContainer.innerHTML = `
            <div class="template-search-empty">
                <i class="material-icons">search_off</i>
                <p>No se encontraron resultados</p>
            </div>
        `;
        return;
    }

    const highlightText = (text, query) => {
        if (!query) return text;
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark style="background: var(--accent-primary); color: #fff; padding: 0 2px; border-radius: 2px;">$1</mark>');
    };

    resultsContainer.innerHTML = results.map((template, index) => `
        <div class="template-result-item ${index === selectedIndex ? 'selected' : ''}" data-index="${index}">
            <div class="template-result-header">
                <div class="template-result-title">${highlightText(template.title || template.nombre, query)}</div>
                <div class="template-result-category">${template.category}</div>
            </div>
            <div class="template-result-preview">${highlightText(template.content || template.observacion, query)}</div>
        </div>
    `).join('');

    // Add click listeners
    document.querySelectorAll('.template-result-item').forEach((item, index) => {
        item.addEventListener('click', () => {
            applySelectedTemplate(results[index]);
        });
        item.addEventListener('mouseenter', () => {
            selectedIndex = index;
            updateSelection();
        });
    });
}

// Update selection highlighting
function updateSelection() {
    document.querySelectorAll('.template-result-item').forEach((item, index) => {
        if (index === selectedIndex) {
            item.classList.add('selected');
            item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        } else {
            item.classList.remove('selected');
        }
    });
}

// Apply selected template
function applySelectedTemplate(template) {
    if (!template) return;

    // Determine target textarea.
    // If popup was triggered while focusing a specific element, we should respect that?
    // For now we check GenObs field first, then Main form.

    // Check which element was focused or if we are in GenObs context
    const suporteGenerado = document.getElementById('soporteGenerado');
    const observacionForm = document.getElementById('observacionForm');

    let target = null;

    // Simple heuristic: if GenObs modal is visible (which supports Soporte Generado)
    const genObsModal = document.getElementById('genobsModal');
    if (genObsModal && genObsModal.style.display !== 'none' && suporteGenerado && suporteGenerado.offsetParent !== null) {
        target = suporteGenerado;
    } else if (observacionForm && observacionForm.offsetParent !== null) {
        target = observacionForm;
    }

    if (target) {
        const text = template.content || template.observacion || "";
        const current = target.value;
        // Append or substitute? Usually append with newline
        target.value = current ? current + "\n" + text : text;

        // Trigger input event to resize or validate
        target.dispatchEvent(new Event('input', { bubbles: true }));
        target.focus();

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

        if (window.showNotification) window.showNotification(`Plantilla "${template.title || template.nombre}" aplicada`, 'success');
    }

    closeTemplateSearchPopup();
}

// Open the search popup
export function openTemplateSearchPopup(categoryFilter = null) {
    if (!document.getElementById('templateSearchPopup')) {
        createTemplateSearchPopup();
    }

    // Ensure data is loaded
    if (window.TemplatesModule && window.TemplatesModule.init) {
        window.TemplatesModule.init().then(() => {
            showPopup(categoryFilter);
        });
    } else {
        showPopup(categoryFilter);
    }
}

function showPopup(categoryFilter) {
    const popup = document.getElementById('templateSearchPopup');
    const searchInput = document.getElementById('templateSearchInput');

    if (popup) {
        popup.style.display = 'flex';
        if (categoryFilter) {
            popup.dataset.forcedCategory = categoryFilter;
        } else {
            delete popup.dataset.forcedCategory;
        }

        currentSearchQuery = '';
        selectedIndex = -1;

        if (searchInput) {
            searchInput.value = '';
            searchInput.focus();
        }

        // Render category tabs and perform initial search
        renderCategoryTabs();
        performSearch('');
    }
}

// Close the search popup
export function closeTemplateSearchPopup() {
    const popup = document.getElementById('templateSearchPopup');
    if (popup) {
        popup.style.display = 'none';
        // Remove focus logic here to avoid jumping if not desired
    }
}

// Initialize listeners on textareas
export function initializeTemplateSearchShortcut() {
    const targets = [
        document.getElementById('soporteGenerado'),
        document.getElementById('observacionForm')
    ];

    targets.forEach(el => {
        if (el && !el.dataset.f2Init) {
            el.addEventListener('keydown', (e) => {
                if (e.key === 'F2') {
                    e.preventDefault();
                    console.log('F2 pressed on', el.id);
                    openTemplateSearchPopup();
                }
            });
            el.dataset.f2Init = 'true';
        }
    });
}

// Expose global
window.openTemplateSearchPopup = openTemplateSearchPopup;
window.closeTemplateSearchPopup = closeTemplateSearchPopup;
window.initializeTemplateSearchShortcut = initializeTemplateSearchShortcut;

// Init on load
document.addEventListener('DOMContentLoaded', () => {
    // Wait for DOM
    setTimeout(initializeTemplateSearchShortcut, 1000);
});
