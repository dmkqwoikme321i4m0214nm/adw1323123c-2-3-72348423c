const MAX_LOGS = 500;

export const LoggerModule = {
    logs: [],

    init() {
        // Load existing logs
        try {
            this.logs = JSON.parse(sessionStorage.getItem('systemLogs')) || [];
        } catch (e) {
            this.logs = [];
        }

        // Intercept Console
        this.interceptConsole();

        // Listen for log updates from other pages (storage event works for localStorage, not sessionStorage typically in same tab, 
        // but simple page navigation reloads sessionStorage. For real-time in separate page, we might need BroadcastChannel or localStorage).
        // We'll use localStorage for broadcasting new logs effectively if we want real-time in logs.html
        // For now, let's stick to sessionStorage and manual refresh in logs.html for simplicity, 
        // or just use localStorage for the last N logs to share across tabs.

        // Retrying with localStorage for persistence across tabs/windows if User opens logs in new tab.
        // But logs can be huge. Let's stick to sessionStorage for simple session debugging.
    },

    interceptConsole() {
        const originalLog = console.log;
        const originalWarn = console.warn;
        const originalError = console.error;

        console.log = (...args) => {
            originalLog.apply(console, args);
            this.addLog('info', args);
        };

        console.warn = (...args) => {
            originalWarn.apply(console, args);
            this.addLog('warning', args);
        };

        console.error = (...args) => {
            originalError.apply(console, args);
            this.addLog('error', args);
        };
    },

    addLog(type, args) {
        const message = args.map(arg => {
            if (typeof arg === 'object') {
                try {
                    return JSON.stringify(arg);
                } catch {
                    return '[Object]';
                }
            }
            return String(arg);
        }).join(' ');

        const entry = {
            timestamp: new Date().toLocaleTimeString(),
            type: type,
            message: message
        };

        this.logs.push(entry);
        if (this.logs.length > MAX_LOGS) {
            this.logs.shift();
        }

        this.save();
    },

    save() {
        try {
            sessionStorage.setItem('systemLogs', JSON.stringify(this.logs));
        } catch (e) {
            // Quota exceeded likely
            this.logs.splice(0, 100);
            sessionStorage.setItem('systemLogs', JSON.stringify(this.logs));
        }
    },

    getLogs() {
        return this.logs;
    },

    clearLogs() {
        this.logs = [];
        sessionStorage.removeItem('systemLogs');
        location.reload();
    },

    downloadLogs() {
        const text = this.logs.map(l => `[${l.timestamp}] [${l.type.toUpperCase()}] ${l.message}`).join('\n');
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `typify_logs_${new Date().toISOString().slice(0, 10)}.txt`;
        a.click();
    },

    // Render logic for logs.html
    renderLogs(containerId, filterType = 'all') {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = '';

        // Reverse to show newest at bottom usually, but terminal style is append.
        // We'll show standard order.

        const filtered = filterType === 'all'
            ? this.logs
            : this.logs.filter(l => l.type === filterType);

        if (filtered.length === 0) {
            container.innerHTML = '<div class="log-line">No logs found.</div>';
            return;
        }

        filtered.forEach(log => {
            const div = document.createElement('div');
            div.className = `log-line log-${log.type}`;
            div.innerHTML = `<span class="log-time">[${log.timestamp}]</span> <span class="log-type">[${log.type.toUpperCase()}]</span> <span class="log-msg">${this.escapeHtml(log.message)}</span>`;
            container.appendChild(div);
        });

        // Scroll to bottom
        container.scrollTop = container.scrollHeight;
    },

    escapeHtml(text) {
        if (!text) return '';
        return text.replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
};

// Init immediately to capture early logs
LoggerModule.init();
window.LoggerModule = LoggerModule;
