/**
 * TypifyPro 3.0 - History Module
 * Handles persistence, management, and export of typification history
 */

class HistoryModule {
    constructor() {
        this.storageKey = 'typify_history';
        this.tableBodyId = 'historyTableBody';
    }

    // --- Core Data Methods ---

    load() {
        try {
            const raw = localStorage.getItem(this.storageKey);
            // Fallback for legacy key 'historial' if new key is empty
            if (!raw) {
                const legacy = localStorage.getItem('historial');
                if (legacy) {
                    const parsed = JSON.parse(legacy);
                    this.save(parsed); // Migrate to new key
                    return parsed;
                }
                return [];
            }
            return JSON.parse(raw);
        } catch (e) {
            console.error("Error loading history:", e);
            return [];
        }
    }

    save(data) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(data));
        } catch (e) {
            console.error("Error saving history:", e);
            alert("Error al guardar en historial. Puede que el almacenamiento esté lleno.");
        }
    }

    add(item) {
        const history = this.load();
        // Add ID if missing
        if (!item.id) item.id = Date.now().toString(36) + Math.random().toString(36).substr(2);
        // Ensure date exists
        if (!item.date) item.date = new Date().toISOString();

        history.unshift(item); // Add to top
        this.save(history);
        this.render(); // If we are on history page context, this updates UI
    }

    delete(id) {
        this.showConfirm("¿Estás seguro de eliminar este registro?", () => {
            const history = this.load();
            const newHistory = history.filter(item => item.id !== id && item.date !== id);
            this.save(newHistory);
            this.render();
        });
    }

    clear() {
        this.showConfirm("¿Estás seguro de borrar TODO el historial? Esta acción no se puede deshacer.", () => {
            localStorage.removeItem(this.storageKey);
            localStorage.removeItem('historial');
            this.render();
        });
    }

    showConfirm(message, onConfirm) {
        const modal = document.getElementById('confirmModal');
        const msgEl = document.getElementById('confirmMessage');
        const btn = document.getElementById('confirmBtn');

        if (!modal || !msgEl || !btn) {
            if (confirm(message)) onConfirm(); // Fallback
            return;
        }

        msgEl.textContent = message;
        modal.style.display = 'flex';

        const handleConfirm = () => {
            onConfirm();
            modal.style.display = 'none';
            btn.removeEventListener('click', handleConfirm);
        };

        // Remove old listeners (simplistic way)
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        newBtn.addEventListener('click', handleConfirm);
    }

    // --- Import / Export ---

    exportJSON() {
        const history = this.load();
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(history, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `typify_backup_${new Date().toISOString().slice(0, 10)}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    }

    importJSON(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                if (!Array.isArray(importedData)) throw new Error("Formato inválido: debe ser un arreglo.");

                // Merge strategy: Append? Replace? 
                // Let's ask via confirm or just Replace/Merge. 
                // Plan said "Import", usually implies restore or merge.
                // Let's merge unique items by ID, or just unshift.
                // To avoid complex merging UI, let's just add them.

                const current = this.load();
                // Avoid exact duplicates if ID matches
                const currentIds = new Set(current.map(c => c.id));
                let addedCount = 0;

                importedData.forEach(item => {
                    if (!item.id || !currentIds.has(item.id)) {
                        // If no ID (legacy), we might dupe, but better safe.
                        // Ideally generate ID if missing
                        if (!item.id) item.id = Date.now().toString(36) + Math.random().toString(36).substr(2);
                        current.push(item);
                        addedCount++;
                    }
                });

                // Sort by date desc
                current.sort((a, b) => new Date(b.date) - new Date(a.date));

                this.save(current);
                this.render();
                alert(`Importación completada. Se agregaron ${addedCount} registros.`);

            } catch (err) {
                console.error(err);
                alert("Error al importar: El archivo no tiene un formato válido.");
            }
        };
        reader.readAsText(file);
    }

    importExcel(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);

                const current = this.load();
                let addedCount = 0;

                jsonData.forEach(row => {
                    // Generate unique ID
                    const id = Date.now().toString(36) + Math.random().toString(36).substr(2);

                    // Reconstruct formData from row
                    const formData = {
                        clienteRUT: row.RUT || '',
                        clienteNombre: row.Nombre || '',
                        clienteTelefono: row.Telefono || '',
                        clienteCorreo: row.Correo || '',
                        clienteContrato: row.Contrato || '',
                        clienteId: row.ID_Cliente || '',
                        clienteDireccion: row.Direccion || '',
                        clienteONT: row.ONT || '',
                        clienteOLT: row.OLT || '',
                        clienteTarjeta: row.Tarjeta || '',
                        clientePuerto: row.Puerto || '',
                        clienteNodo: row.Nodo || '',
                        tipoServicio: row.Tipo_Servicio || '',
                        tiempoFalla: row.Tiempo_Falla || '',
                        estadoOnt: row.Estado_ONT || '',
                        estadoLuces: row.Estado_Luces || '',
                        clienteMasiva: row.Cliente_Masiva || '',
                        fallaMasiva: row.Falla_Masiva || '',
                        visitaTecnica: row.Visita_Tecnica || ''
                    };

                    const newItem = {
                        id: id,
                        date: row.Fecha ? new Date(row.Fecha).toISOString() : new Date().toISOString(),
                        type: row.Tipo || 'Soporte',
                        rut: row.RUT || '',
                        nombre: row.Nombre || '',
                        telefono: row.Telefono || '',
                        contrato: row.Contrato || '',
                        text: row.Observacion || '',
                        observation: row.Observacion || '',
                        formData: formData,
                        urlSondeo: row.URL_Sondeo || '',
                        urlPersiste: row.URL_Persiste || ''
                    };

                    current.push(newItem);
                    addedCount++;
                });

                // Sort by date
                current.sort((a, b) => new Date(b.date) - new Date(a.date));
                this.save(current);
                this.render();

                if (window.showToast) {
                    window.showToast(`Importación completada. Se agregaron ${addedCount} registros.`, 'success');
                } else {
                    alert(`Importación Excel completada. Se agregaron ${addedCount} registros.`);
                }

            } catch (err) {
                console.error(err);
                if (window.showToast) {
                    window.showToast(`Error al importar Excel: ${err.message}`, 'error');
                } else {
                    alert("Error al importar Excel: " + err.message);
                }
            }
        };
        reader.readAsArrayBuffer(file);
    }

    importTXT(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target.result;

                // Split by separator and filter empty entries
                const entries = text.split('----------------------------------------')
                    .map(s => s.trim())
                    .filter(s => s && s !== 'HISTORIAL DE TIPIFICACIONES');

                const current = this.load();
                let addedCount = 0;

                entries.forEach(entry => {
                    if (!entry) return;

                    // Extract tipo de tipificación
                    const tipoMatch = entry.match(/Tipo de Tipificación:\s*(.+)/);
                    const tipo = tipoMatch ? tipoMatch[1].trim() : 'Soporte';

                    // Extract observación (everything between "Observación:" and "URL FORMULARIO SONDEO:" or "URL Persiste:" or end)
                    const obsMatch = entry.match(/Observación:\s*([\s\S]*?)(?=\n\nURL FORMULARIO SONDEO:|URL Persiste:|$)/);
                    const observacion = obsMatch ? obsMatch[1].trim() : '';

                    // Extract URLs
                    const urlSondeoMatch = entry.match(/URL FORMULARIO SONDEO:\s*(.+)/);
                    const urlSondeo = urlSondeoMatch ? urlSondeoMatch[1].trim() : '';

                    const urlPersisteMatch = entry.match(/URL Persiste:\s*(.+)/);
                    const urlPersiste = urlPersisteMatch ? urlPersisteMatch[1].trim() : '';

                    // Try to extract basic info from observación
                    const nombreMatch = observacion.match(/NOMBRE:\s*([^\n]+)/);
                    const rutMatch = observacion.match(/RUT:\s*([^\n]+)/);
                    const contratoMatch = observacion.match(/CONTRATO:\s*([^\n]+)/);
                    const telefonoMatch = observacion.match(/TEL:\s*([^\n]+)/);

                    const newItem = {
                        id: Date.now().toString(36) + Math.random().toString(36).substr(2),
                        date: new Date().toISOString(),
                        type: tipo,
                        rut: rutMatch ? rutMatch[1].trim() : 'N/A',
                        nombre: nombreMatch ? nombreMatch[1].trim() : 'N/A',
                        telefono: telefonoMatch ? telefonoMatch[1].trim() : '',
                        contrato: contratoMatch ? contratoMatch[1].trim() : '',
                        text: observacion,
                        observation: observacion,
                        urlSondeo: urlSondeo,
                        urlPersiste: urlPersiste,
                        formData: {}
                    };

                    current.push(newItem);
                    addedCount++;
                });

                current.sort((a, b) => new Date(b.date) - new Date(a.date));
                this.save(current);
                this.render();

                if (window.showToast) {
                    window.showToast(`Importación TXT completada. Se agregaron ${addedCount} registros.`, 'success');
                } else {
                    alert(`Importación TXT completada. Se agregaron ${addedCount} registros.`);
                }

            } catch (err) {
                console.error(err);
                if (window.showToast) {
                    window.showToast(`Error al importar TXT: ${err.message}`, 'error');
                } else {
                    alert("Error al importar TXT: " + err.message);
                }
            }
        };
        reader.readAsText(file);
    }

    exportExcel() {
        const history = this.load();
        if (!history.length) return alert("Sin datos para exportar");

        // Flatten for Excel with detailed columns
        const flatData = history.map(h => {
            const formData = h.formData || {};

            return {
                Fecha: new Date(h.date).toLocaleString('es-ES'),
                Tipo: h.type || 'Soporte',
                RUT: h.rut || formData.clienteRUT || 'N/A',
                Nombre: h.nombre || formData.clienteNombre || 'N/A',
                Telefono: h.telefono || formData.clienteTelefono || 'N/A',
                Correo: formData.clienteCorreo || 'N/A',
                Contrato: h.contrato || formData.clienteContrato || 'N/A',
                ID_Cliente: formData.clienteId || 'N/A',
                Direccion: formData.clienteDireccion || 'N/A',
                ONT: formData.clienteONT || 'N/A',
                OLT: formData.clienteOLT || 'N/A',
                Tarjeta: formData.clienteTarjeta || 'N/A',
                Puerto: formData.clientePuerto || 'N/A',
                Nodo: formData.clienteNodo || 'N/A',
                Tipo_Servicio: formData.tipoServicio || formData.tipoServicioGeneral || 'N/A',
                Tiempo_Falla: formData.tiempoFalla || 'N/A',
                Estado_ONT: formData.estadoOnt || formData.estadoOntPersiste || 'N/A',
                Estado_Luces: formData.estadoLuces || 'N/A',
                Cliente_Masiva: formData.clienteMasiva || 'N/A',
                Falla_Masiva: formData.fallaMasiva || 'N/A',
                Visita_Tecnica: formData.visitaTecnica || 'N/A',
                Observacion: h.text || h.observation || '',
                URL_Sondeo: h.urlSondeo || h.url || '',
                URL_Sondeo_AutoEnvio: h.urlSondeo ? h.urlSondeo.replace('/viewform?usp=pp_url', '/formResponse?usp=pp_url') : (h.url ? h.url.replace('/viewform?usp=pp_url', '/formResponse?usp=pp_url') : ''),
                URL_Persiste: h.urlPersiste || '',
                URL_Persiste_AutoEnvio: h.urlPersiste ? h.urlPersiste.replace('/viewform?usp=pp_url', '/formResponse?usp=pp_url') : ''
            };
        });

        const ws = XLSX.utils.json_to_sheet(flatData);

        // Set column widths for better readability
        const columnWidths = [
            { wch: 18 }, // Fecha
            { wch: 12 }, // Tipo
            { wch: 12 }, // RUT
            { wch: 25 }, // Nombre
            { wch: 12 }, // Telefono
            { wch: 25 }, // Correo
            { wch: 12 }, // Contrato
            { wch: 12 }, // ID_Cliente
            { wch: 30 }, // Direccion
            { wch: 15 }, // ONT
            { wch: 15 }, // OLT
            { wch: 10 }, // Tarjeta
            { wch: 10 }, // Puerto
            { wch: 15 }, // Nodo
            { wch: 20 }, // Tipo_Servicio
            { wch: 18 }, // Tiempo_Falla
            { wch: 15 }, // Estado_ONT
            { wch: 20 }, // Estado_Luces
            { wch: 12 }, // Cliente_Masiva
            { wch: 12 }, // Falla_Masiva
            { wch: 12 }, // Visita_Tecnica
            { wch: 50 }, // Observacion
            { wch: 60 }, // URL_Sondeo
            { wch: 60 }, // URL_Sondeo_AutoEnvio
            { wch: 60 }, // URL_Persiste
            { wch: 60 }  // URL_Persiste_AutoEnvio
        ];
        ws['!cols'] = columnWidths;

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Historial");
        XLSX.writeFile(wb, `Historial_${new Date().toISOString().slice(0, 10)}.xlsx`);
    }

    exportTXT() {
        const history = this.load();
        if (!history.length) return alert("Sin datos para exportar");

        const lines = history.map(entry => {
            const tipo = entry.type || 'Soporte';
            const observacion = entry.text || entry.observation || 'N/A';
            const urlSondeo = entry.urlSondeo || entry.url || '';
            const urlPersiste = entry.urlPersiste || '';

            let block = `----------------------------------------\n`;
            block += `Tipo de Tipificación: ${tipo}\n`;
            block += `Observación: ${observacion}\n`;

            if (urlSondeo) {
                block += `\nURL FORMULARIO SONDEO: ${urlSondeo}\n`;
            }

            if (urlPersiste) {
                block += `URL Persiste: ${urlPersiste}\n`;
            }

            return block;
        });

        const content = `HISTORIAL DE TIPIFICACIONES\n${lines.join('')}----------------------------------------`;
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Historial_${new Date().toISOString().slice(0, 10)}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // --- UI Methods ---

    render(filter = '') {
        const tbody = document.getElementById('historyTableBody');
        if (!tbody) return;

        const history = this.load();
        const query = filter.toLowerCase().trim();

        const fromDate = document.getElementById('filterDateFrom')?.value;
        const toDate = document.getElementById('filterDateTo')?.value;

        const filtered = history.filter(entry => {
            const entryDate = new Date(entry.date);
            const rawText = entry.text || entry.observation || '';
            const rut = entry.rut || '';
            const nombre = entry.nombre || entry.clienteNombre || '';

            // Text search
            const matchesText = rawText.toLowerCase().includes(query) ||
                rut.toLowerCase().includes(query) ||
                nombre.toLowerCase().includes(query);

            if (!matchesText) return false;

            // Date filtering
            if (fromDate) {
                const start = new Date(fromDate);
                start.setHours(0, 0, 0, 0);
                if (entryDate < start) return false;
            }
            if (toDate) {
                const end = new Date(toDate);
                end.setHours(23, 59, 59, 999);
                if (entryDate > end) return false;
            }

            return true;
        });

        tbody.innerHTML = '';
        filtered.forEach(entry => {
            const tr = document.createElement('tr');
            tr.style.borderBottom = '1px solid var(--glass-border)';

            const dateStr = new Date(entry.date).toLocaleString();
            const rutStr = entry.rut || 'N/A';
            const category = entry.type || 'Soporte';
            const categoryClass = category.toLowerCase().includes('soporte') ? 'category-soporte' :
                category.toLowerCase().includes('técnico') ? 'category-tecnico' :
                    category.toLowerCase().includes('venta') ? 'category-ventas' : 'category-general';

            const rawText = entry.text || entry.observation || '';
            const previewText = rawText.length > 80 ? rawText.substring(0, 80) + '...' : rawText;
            const id = entry.id || entry.date;

            const safeRut = this.escapeHtml(rutStr);
            const safePreview = this.escapeHtml(previewText);

            // Quick Links Button (Consolidated)
            let surveyButtons = '';
            if (category !== 'Transferencia') {
                surveyButtons = `
                    <button class="btn-icon-circle" title="Enlaces de Gestión" 
                        onclick="window.HistoryModule.showQuickLinks('${id}')"
                        style="color: #3b82f6;">
                        <span class="material-icons" style="font-size: 18px;">link</span>
                    </button>
                `;
            }

            tr.innerHTML = `
                <td style="padding: 16px 12px; white-space: nowrap; width: 15%; font-size: 0.85em; color: var(--text-secondary);">
                    <div style="display: flex; align-items: center; gap: 6px;">
                        <span class="material-icons" style="font-size: 14px; color: var(--accent-primary);">calendar_today</span>
                        ${dateStr}
                    </div>
                </td>
                <td style="padding: 16px 12px; width: 12%; font-weight: 500;">${safeRut}</td>
                <td style="padding: 16px 12px; width: 10%;">
                    <span class="category-badge ${categoryClass}" style="font-size: 0.7em;">${category}</span>
                </td>
                <td style="padding: 16px 12px; width: 45%; color: var(--text-secondary); font-size: 0.9em; line-height: 1.4;" title="${this.escapeHtml(rawText)}">
                    ${safePreview}
                </td>
                <td style="padding: 16px 12px; width: 18%;">
                    <div class="action-btn-group" style="display: flex; gap: 6px; align-items: center;">
                        <button class="btn-icon-circle" title="Ver Detalle" 
                            onclick="window.HistoryModule.viewDetail('${id}')">
                            <span class="material-icons" style="font-size: 18px;">visibility</span>
                        </button>
                        ${surveyButtons}
                        <button class="btn-icon-circle" title="Copiar" 
                            onclick="window.HistoryModule.copyToClipboard('${id}')">
                            <span class="material-icons" style="font-size: 18px;">content_copy</span>
                        </button>
                        <button class="btn-icon-circle delete" title="Eliminar" 
                            onclick="window.HistoryModule.delete('${id}')">
                            <span class="material-icons" style="font-size: 18px;">delete</span>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    viewDetail(id) {
        const history = this.load();
        const item = history.find(i => (i.id || i.date) === id);
        if (!item) return;

        const container = document.getElementById('historyDetailContent');
        if (!container) return;

        const dateStr = new Date(item.date).toLocaleString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const clientName = item.nombre || item.clienteNombre || 'Cliente S/N';
        const typeLabel = item.type || 'Soporte';
        const categoryClass = typeLabel.toLowerCase().includes('soporte') ? 'category-soporte' :
            typeLabel.toLowerCase().includes('técnico') ? 'category-tecnico' :
                typeLabel.toLowerCase().includes('venta') ? 'category-ventas' : 'category-general';

        let detailHTML = `
            <!-- Banner Superior: Identificación del Cliente -->
            <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.05); padding: 12px 20px; border-radius: 12px; margin-bottom: 15px; border: 1px solid var(--glass-border);">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="width: 40px; height: 40px; background: var(--accent-primary); border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                        <span class="material-icons" style="color: white; font-size: 24px;">person</span>
                    </div>
                    <div>
                        <h4 style="margin: 0; font-size: 1em; color: white;">${this.escapeHtml(clientName)}</h4>
                        <p style="margin: 0; font-size: 0.75em; color: var(--text-secondary);">RUT: <span style="color: var(--accent-primary); font-weight: bold;">${item.rut || 'N/A'}</span></p>
                    </div>
                </div>
                <div style="text-align: right;">
                    <span class="category-badge ${categoryClass}" style="padding: 4px 10px; font-size: 0.75em;">${typeLabel}</span>
                    <p style="margin: 3px 0 0 0; font-size: 0.75em; color: var(--text-secondary);">${dateStr}</p>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1.5fr 1fr; gap: 15px;">
                <!-- Columna Izquierda: Observación (Priorizada) -->
                <div style="display: flex; flex-direction: column; gap: 10px;">
                    <div style="background: rgba(0,0,0,0.25); border: 1px solid var(--glass-border); padding: 15px; border-radius: 12px; height: 100%; display: flex; flex-direction: column; min-height: 250px;">
                         <h4 style="margin: 0 0 10px 0; font-size: 0.9em; color: var(--accent-primary); display: flex; align-items: center; justify-content: space-between;">
                            <span style="display: flex; align-items: center; gap: 6px;">
                                <span class="material-icons" style="font-size: 16px;">description</span>
                                <span>Observación del Caso</span>
                            </span>
                            <button class="btn-icon-circle" onclick="window.HistoryModule.copyToClipboard('${id}')" title="Copiar Observación" style="width: 28px; height: 28px;">
                                <span class="material-icons" style="font-size: 16px;">content_copy</span>
                            </button>
                        </h4>
                        <div style="flex: 1; overflow-y: auto; padding: 10px; background: rgba(0,0,0,0.2); border-radius: 8px; font-family: 'JetBrains Mono', 'Fira Code', monospace; font-size: 0.85em; white-space: pre-wrap; line-height: 1.5; color: #e5e7eb; max-height: 400px;">${this.escapeHtml((item.text || item.observation || '').replace(/^\s*/gm, '').trim())}</div>
                    </div>
                </div>

                <!-- Columna Derecha: Datos Técnicos y Enlaces -->
                <div style="display: flex; flex-direction: column; gap: 15px;">
                    <!-- Enlaces de Gestión -->
                    <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--glass-border); padding: 15px; border-radius: 12px;">
                        <h4 style="margin: 0 0 10px 0; font-size: 0.9em; color: #3b82f6; display: flex; align-items: center; gap: 8px;">
                            <span class="material-icons" style="font-size: 18px;">link</span> Enlaces de Gestión
                        </h4>
                        <div style="display: flex; flex-direction: column; gap: 10px;">
                            ${(item.urlSondeo || item.url) ? `
                                <div style="background: rgba(59, 130, 246, 0.05); padding: 10px; border-radius: 8px; border: 1px solid rgba(59, 130, 246, 0.2);">
                                    <div style="font-weight: 600; font-size: 0.75em; color: #60a5fa; margin-bottom: 8px;">Sondeo</div>
                                    <div style="display: flex; flex-direction: column; gap: 6px;">
                                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 4px 0;">
                                            <span style="font-size: 0.7em; color: #94a3b8;">Enlace Normal</span>
                                            <div style="display: flex; gap: 4px;">
                                                <button class="btn-icon-circle small" onclick="window.open('${item.urlSondeo || item.url}', '_blank')" title="Abrir" style="width: 24px; height: 24px;"><span class="material-icons" style="font-size: 14px;">open_in_new</span></button>
                                                <button class="btn-icon-circle small" onclick="navigator.clipboard.writeText('${item.urlSondeo || item.url}').then(() => window.showToast && window.showToast('Enlace copiado', 'success'))" title="Copiar" style="width: 24px; height: 24px;"><span class="material-icons" style="font-size: 14px;">content_copy</span></button>
                                            </div>
                                        </div>
                                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 4px 0;">
                                            <span style="font-size: 0.7em; color: #94a3b8;">Auto-Envío</span>
                                            <div style="display: flex; gap: 4px;">
                                                <button class="btn-icon-circle small" onclick="window.open('${(item.urlSondeo || item.url).replace('/viewform?usp=pp_url', '/formResponse?usp=pp_url')}', '_blank')" title="Abrir Auto-Envío" style="width: 24px; height: 24px;"><span class="material-icons" style="font-size: 14px;">send</span></button>
                                                <button class="btn-icon-circle small" onclick="navigator.clipboard.writeText('${(item.urlSondeo || item.url).replace('/viewform?usp=pp_url', '/formResponse?usp=pp_url')}').then(() => window.showToast && window.showToast('Enlace Auto-Envío copiado', 'success'))" title="Copiar Auto-Envío" style="width: 24px; height: 24px;"><span class="material-icons" style="font-size: 14px;">content_copy</span></button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ` : ''}

                            ${item.urlPersiste ? `
                                <div style="background: rgba(245, 158, 11, 0.05); padding: 10px; border-radius: 8px; border: 1px solid rgba(245, 158, 11, 0.2);">
                                    <div style="font-weight: 600; font-size: 0.75em; color: #fbbf24; margin-bottom: 8px;">Persiste</div>
                                    <div style="display: flex; flex-direction: column; gap: 6px;">
                                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 4px 0;">
                                            <span style="font-size: 0.7em; color: #94a3b8;">Enlace Normal</span>
                                            <div style="display: flex; gap: 4px;">
                                                <button class="btn-icon-circle small" onclick="window.open('${item.urlPersiste}', '_blank')" title="Abrir" style="width: 24px; height: 24px;"><span class="material-icons" style="font-size: 14px;">open_in_new</span></button>
                                                <button class="btn-icon-circle small" onclick="navigator.clipboard.writeText('${item.urlPersiste}').then(() => window.showToast && window.showToast('Enlace copiado', 'success'))" title="Copiar" style="width: 24px; height: 24px;"><span class="material-icons" style="font-size: 14px;">content_copy</span></button>
                                            </div>
                                        </div>
                                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 4px 0;">
                                            <span style="font-size: 0.7em; color: #94a3b8;">Auto-Envío</span>
                                            <div style="display: flex; gap: 4px;">
                                                <button class="btn-icon-circle small" onclick="window.open('${item.urlPersiste.replace('/viewform?usp=pp_url', '/formResponse?usp=pp_url')}', '_blank')" title="Abrir Auto-Envío" style="width: 24px; height: 24px;"><span class="material-icons" style="font-size: 14px;">send</span></button>
                                                <button class="btn-icon-circle small" onclick="navigator.clipboard.writeText('${item.urlPersiste.replace('/viewform?usp=pp_url', '/formResponse?usp=pp_url')}').then(() => window.showToast && window.showToast('Enlace Auto-Envío copiado', 'success'))" title="Copiar Auto-Envío" style="width: 24px; height: 24px;"><span class="material-icons" style="font-size: 14px;">content_copy</span></button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ` : ''}

                            ${!(item.urlSondeo || item.url || item.urlPersiste) ? `
                                <p style="margin: 0; font-size: 0.75em; color: var(--text-secondary); text-align: center; padding: 5px;">No se generaron enlaces.</p>
                            ` : ''}
                        </div>
                    </div>

                    <!-- Resumen del Caso -->
                    <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--glass-border); padding: 15px; border-radius: 12px;">
                        <h4 style="margin: 0 0 10px 0; font-size: 0.9em; color: var(--text-secondary); display: flex; align-items: center; gap: 8px;">
                            <span class="material-icons" style="font-size: 18px;">analytics</span> Resumen Técnico
                        </h4>
                        <div style="display: grid; grid-template-columns: 1fr; gap: 10px; font-size: 0.8em;">
                            <div style="padding: 8px; background: rgba(255,255,255,0.02); border-radius: 8px;">
                                <span style="color: var(--text-secondary); display: block; margin-bottom: 2px;">Atención Brindada:</span>
                                <span style="color: white; font-weight: 500;">${item.formData?.tipoServicio || item.formData?.tipoServicioGeneral || 'No especificado'}</span>
                            </div>
                             <div style="padding: 8px; background: rgba(255,255,255,0.02); border-radius: 8px;">
                                <span style="color: var(--text-secondary); display: block; margin-bottom: 2px;">ID Cliente / Contrato:</span>
                                <span style="color: white; font-weight: 500;">${item.formData?.clienteId || item.formData?.ID_CLIENTE || item.formData?.clienteContrato || item.formData?.Contrato || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Footer: Todos los datos del Formulario -->
            ${(item.formData && Object.keys(item.formData).length > 0) ? `
            <div style="margin-top: 20px; background: rgba(0,0,0,0.15); border: 1px solid var(--glass-border); padding: 20px; border-radius: 12px;">
                <h4 style="margin: 0 0 15px 0; font-size: 1em; color: white; display: flex; align-items: center; gap: 10px;">
                    <span class="material-icons" style="color: var(--accent-primary); font-size: 20px;">list_alt</span> 
                    Datos Estructurados
                </h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 12px;">
                    ${Object.entries(item.formData).map(([key, value]) => {
            if (!value || value === 'N/A' || typeof value === 'object') return '';
            const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            return `
                            <div style="background: rgba(255,255,255,0.03); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);">
                                <strong style="color: var(--accent-primary); display: block; font-size: 0.7em; margin-bottom: 2px; text-transform: uppercase;">${formattedKey}</strong>
                                <span style="color: #cbd5e1; font-size: 0.85em;">${this.escapeHtml(value)}</span>
                            </div>
                        `;
        }).join('')}
                </div>
            </div>
            ` : ''}
        `;
        container.innerHTML = detailHTML;
        document.getElementById('historyDetailModal').style.display = 'flex';
    }

    showQuickLinks(id) {
        const history = this.load();
        const item = history.find(i => (i.id || i.date) === id);

        // Relax check: if we have stored URLs, we don't strictly need formData
        // But if we have neither, we can't show anything.
        const hasStoredLinks = item && (item.urlSondeo || item.url || item.urlPersiste);
        if (!item || (!item.formData && !hasStoredLinks)) {
            return alert("Este registro no contiene datos suficientes para generar enlaces.");
        }

        const modal = document.getElementById('linksModal');
        const sondeoSection = document.getElementById('sondeoLinksSection');
        const persisteSection = document.getElementById('persisteLinksSection');
        const noLinksMsg = document.getElementById('noLinksMessage');

        if (!modal) return;

        // Reset visibility
        sondeoSection.style.display = 'none';
        persisteSection.style.display = 'none';
        noLinksMsg.style.display = 'none';

        let hasAnyLink = false;

        // 1. Try Stored URLs first
        // Legacy items might have 'url' instead of 'urlSondeo'
        const storedSondeo = item.urlSondeo || item.url;
        const storedPersiste = item.urlPersiste;

        // 2. Fallback: Build URLs if missing and formData exists
        let surveyUrl = storedSondeo;
        if (!surveyUrl && item.formData) {
            surveyUrl = window.buildSurveyUrl ? window.buildSurveyUrl(item.formData) : null;
        }

        let persisteUrl = storedPersiste;
        if (!persisteUrl && item.formData) {
            persisteUrl = window.buildSurveyPersisteUrl ? window.buildSurveyPersisteUrl(item.formData) : null;
        }

        if (surveyUrl) {
            sondeoSection.style.display = 'block';
            hasAnyLink = true;
            this._setupLinkVariants('Survey', surveyUrl);
        }

        if (persisteUrl) {
            persisteSection.style.display = 'block';
            hasAnyLink = true;
            this._setupLinkVariants('Persiste', persisteUrl);
        }

        if (!hasAnyLink) {
            noLinksMsg.style.display = 'block';
        }

        modal.style.display = 'flex';
    }

    _setupLinkVariants(type, url) {
        const autoUrl = url.replace("/viewform?usp=pp_url", "/formResponse?usp=pp_url");
        const displayName = type === 'Survey' ? 'Sondeo' : type;

        const openBtn = document.getElementById(`modalOpen${type}`);
        const copyBtn = document.getElementById(`modalCopy${type}`);
        const openAutoBtn = document.getElementById(`modalOpenAuto${type}`);
        const copyAutoBtn = document.getElementById(`modalCopyAuto${type}`);

        if (openBtn) openBtn.onclick = () => window.open(url, "_blank");
        if (copyBtn) copyBtn.onclick = () => {
            navigator.clipboard.writeText(url);
            if (window.showNotification) window.showNotification(`Enlace de ${displayName} copiado`, "success");
        };
        if (openAutoBtn) openAutoBtn.onclick = () => window.open(autoUrl, "_blank");
        if (copyAutoBtn) copyAutoBtn.onclick = () => {
            navigator.clipboard.writeText(autoUrl);
            if (window.showNotification) window.showNotification(`Enlace Auto-Envío ${displayName} copiado`, "success");
        };
    }

    openSurveyLink(id) {
        const history = this.load();
        const item = history.find(i => (i.id || i.date) === id);
        if (!item || !item.formData) return;
        const url = window.buildSurveyUrl(item.formData);
        if (url) window.open(url, "_blank");
    }

    openPersisteLink(id) {
        const history = this.load();
        const item = history.find(i => (i.id || i.date) === id);
        if (!item || !item.formData) return;
        const url = window.buildSurveyPersisteUrl(item.formData);
        if (url) window.open(url, "_blank");
    }

    copyToClipboard(id) {
        const history = this.load();
        const item = history.find(h => h.id === id || h.date === id);
        if (item) {
            const text = item.text || item.observation || '';
            navigator.clipboard.writeText(text).then(() => {
                // Toast fallback
                if (window.showToast) window.showToast("Copiado al portapapeles");
                else alert("Copiado al portapapeles");
            }).catch(e => console.error(e));
        }
    }

    escapeHtml(text) {
        if (!text) return '';
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}

// Instantiate and// Export
const historyModule = new HistoryModule();
window.HistoryModule = {
    load: () => historyModule.load(),
    add: (item) => historyModule.add(item),
    delete: (id) => historyModule.delete(id),
    clear: () => historyModule.clear(),
    render: (filter) => historyModule.render(filter),
    copyToClipboard: (id) => historyModule.copyToClipboard(id),
    exportExcel: () => historyModule.exportExcel(),
    exportTXT: () => historyModule.exportTXT(),
    importExcel: (file) => historyModule.importExcel(file),
    exportJSON: () => historyModule.exportJSON(),
    importJSON: (file) => historyModule.importJSON(file),
    importTXT: (file) => historyModule.importTXT(file),
    viewDetail: (id) => historyModule.viewDetail(id),
    showQuickLinks: (id) => historyModule.showQuickLinks(id),
    openSurveyLink: (id) => historyModule.openSurveyLink(id),
    openPersisteLink: (id) => historyModule.openPersisteLink(id)
}; // Global Bridge for HTML event handlers defined in HTML string
window.exportExcel = () => window.HistoryModule.exportExcel();
window.exportHistoryTXT = () => window.HistoryModule.exportTXT();
window.clearHistory = () => window.HistoryModule.clear();
// window.deleteHistoryItem -> managed via module instance call in onclick now

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // expose render for search
    const searchInput = document.getElementById('historySearch');
    const fromInput = document.getElementById('filterDateFrom');
    const toInput = document.getElementById('filterDateTo');

    const triggerRender = () => {
        const query = searchInput ? searchInput.value : '';
        window.HistoryModule.render(query);
    };

    if (searchInput) searchInput.addEventListener('input', triggerRender);

    if (fromInput) {
        fromInput.addEventListener('change', triggerRender);

        // Improved double-click to close picker
        let fromClickCount = 0;
        let fromClickTimer = null;

        fromInput.addEventListener('click', () => {
            fromClickCount++;

            if (fromClickCount === 1) {
                fromClickTimer = setTimeout(() => {
                    fromClickCount = 0;
                }, 500);
            } else if (fromClickCount === 2) {
                clearTimeout(fromClickTimer);
                fromClickCount = 0;
                setTimeout(() => {
                    fromInput.blur();
                }, 100);
            }
        });
    }

    if (toInput) {
        toInput.addEventListener('change', triggerRender);

        // Improved double-click to close picker
        let toClickCount = 0;
        let toClickTimer = null;

        toInput.addEventListener('click', () => {
            toClickCount++;

            if (toClickCount === 1) {
                toClickTimer = setTimeout(() => {
                    toClickCount = 0;
                }, 500);
            } else if (toClickCount === 2) {
                clearTimeout(toClickTimer);
                toClickCount = 0;
                setTimeout(() => {
                    toInput.blur();
                }, 100);
            }
        });
    }

    window.HistoryModule.render(); // Initial render
});

// Helper for external modules to add items
window.addHistoryItem = (item) => window.HistoryModule.add(item);
