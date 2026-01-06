/**
 * TypifyPro 3.0 - Tools Module
 * Handles Speedtest, TMO, Templates, and Alarm modals
 */

// Modal Control
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// Speedtest Functions
function openSpeedtestModal() {
    openModal('speedtestModal');
    // Reset
    document.getElementById('speedtestId').value = '';
    document.getElementById('speedtestResult').style.display = 'none';
}

function generateSpeedtestUrl() {
    const testId = document.getElementById('speedtestId').value.trim();
    const resultDiv = document.getElementById('speedtestResult');
    const link = document.getElementById('speedtestLink');

    if (testId && /^\d+$/.test(testId)) {
        const url = `https://www.speedtest.net/result/${testId}+`;
        link.href = url;
        link.textContent = url;
        resultDiv.style.display = 'block';
        resultDiv.dataset.url = url;

        if (window.showToast) {
            window.showToast('Enlace de Speedtest generado', 'success');
        }
    } else {
        if (window.showToast) {
            window.showToast('Por favor, ingrese un ID numérico válido', 'error');
        } else {
            alert('Por favor, ingrese un ID de test válido.');
        }
    }
}

function copySpeedtestUrl() {
    const url = document.getElementById('speedtestResult').dataset.url;
    if (url) {
        navigator.clipboard.writeText(url).then(() => {
            if (window.showToast) {
                window.showToast('Enlace copiado al portapapeles', 'success');
            } else {
                alert('URL copiada al portapapeles');
            }
        }).catch(err => {
            console.error('Error al copiar:', err);
            if (window.showToast) {
                window.showToast('Error al copiar el enlace', 'error');
            }
        });
    }
}

// TMO Functions
function openTmoModal() {
    window.location.href = 'tmo.html';
}

// Search Filtering
function filterTools() {
    const input = document.getElementById('toolSearch');
    const filter = input.value.toLowerCase().trim();
    const container = document.getElementById('toolsGrid');
    const cards = container.getElementsByClassName('tool-card');
    const searchStats = document.getElementById('searchStats');
    const searchStatsText = document.getElementById('searchStatsText');

    let visibleCount = 0;
    let totalCount = cards.length;

    // Remove existing no-results message
    const existingNoResults = container.querySelector('.no-results');
    if (existingNoResults) existingNoResults.remove();

    Array.from(cards).forEach(card => {
        const title = card.querySelector('h4').textContent.toLowerCase();
        const desc = card.querySelector('p:last-of-type').textContent.toLowerCase();

        if (filter === '' || title.includes(filter) || desc.includes(filter)) {
            card.style.display = 'block';
            card.style.animation = 'fadeIn 0.3s ease';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });

    // Show search statistics
    if (filter !== '') {
        searchStats.style.display = 'block';
        if (visibleCount === 0) {
            searchStatsText.textContent = `No se encontraron resultados para "${input.value}"`;
            searchStatsText.style.color = 'var(--danger-color)';
        } else if (visibleCount === totalCount) {
            searchStatsText.textContent = `Mostrando todas las herramientas (${totalCount})`;
            searchStatsText.style.color = 'var(--success-color)';
        } else {
            searchStatsText.textContent = `Mostrando ${visibleCount} de ${totalCount} herramientas`;
            searchStatsText.style.color = 'var(--accent-primary)';
        }
    } else {
        searchStats.style.display = 'none';
    }

    // Show enhanced no-results message
    if (visibleCount === 0 && filter !== '') {
        const noResults = document.createElement('div');
        noResults.className = 'no-results';
        noResults.style.cssText = `
            grid-column: 1 / -1;
            text-align: center;
            padding: 3rem 2rem;
            background: rgba(255,255,255,0.02);
            border: 2px dashed var(--glass-border);
            border-radius: 16px;
            animation: fadeIn 0.3s ease;
        `;
        noResults.innerHTML = `
            <span class="material-icons" style="font-size: 64px; color: var(--text-secondary); opacity: 0.5; margin-bottom: 1rem; display: block;">search_off</span>
            <p style="font-size: 1.1rem; color: var(--text-primary); margin: 0 0 0.5rem 0;">No se encontraron herramientas</p>
            <p style="font-size: 0.9rem; color: var(--text-secondary); margin: 0;">Intenta con otros términos de búsqueda</p>
        `;
        container.appendChild(noResults);
    }
}

// Expose to global scope
window.openSpeedtestModal = openSpeedtestModal;
window.generateSpeedtestUrl = generateSpeedtestUrl;
window.copySpeedtestUrl = copySpeedtestUrl;
window.closeModal = closeModal;
window.openTmoModal = openTmoModal;
window.filterTools = filterTools;
