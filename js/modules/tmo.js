/**
 * TypifyPro 3.0 - TMO (Time Management Operation) Module
 * Complete TMO tracking system with session management, statistics, and persistence
 */

class TMOManager {
    constructor() {
        this.currentSession = null;
        this.timerInterval = null;
        this.startTime = null;
        this.elapsedTime = 0;
        this.pausedTime = 0;
        this.isRunning = false;
        this.isPaused = false;
        this.listeners = [];

        // Default categories
        this.defaultCategories = [
            { id: 'consulta', name: 'Consulta', color: '#3b82f6' },
            { id: 'reclamo', name: 'Reclamo', color: '#ef4444' },
            { id: 'venta', name: 'Venta', color: '#22c55e' },
            { id: 'soporte', name: 'Soporte Técnico', color: '#a855f7' },
            { id: 'otro', name: 'Otro', color: '#6b7280' }
        ];

        this.loadFromStorage();
        this.restoreActiveSession();
    }

    // ==================== Storage Methods ====================

    loadFromStorage() {
        try {
            // Load history
            const historyData = localStorage.getItem('tmo_history');
            this.history = historyData ? JSON.parse(historyData) : [];

            // Load custom categories
            const categoriesData = localStorage.getItem('tmo_categories');
            this.customCategories = categoriesData ? JSON.parse(categoriesData) : [];

            // Load active session state
            const activeSessionData = localStorage.getItem('tmo_active_session');
            if (activeSessionData) {
                const sessionState = JSON.parse(activeSessionData);
                this.currentSession = sessionState;
            }
        } catch (error) {
            console.error('Error loading TMO data from storage:', error);
            this.history = [];
            this.customCategories = [];
        }
    }

    saveHistory() {
        try {
            localStorage.setItem('tmo_history', JSON.stringify(this.history));
        } catch (error) {
            console.error('Error saving TMO history:', error);
        }
    }

    saveCategories() {
        try {
            localStorage.setItem('tmo_categories', JSON.stringify(this.customCategories));
        } catch (error) {
            console.error('Error saving TMO categories:', error);
        }
    }

    saveActiveSession() {
        try {
            if (this.currentSession) {
                localStorage.setItem('tmo_active_session', JSON.stringify(this.currentSession));
            } else {
                localStorage.removeItem('tmo_active_session');
            }
        } catch (error) {
            console.error('Error saving active session:', error);
        }
    }

    restoreActiveSession() {
        if (this.currentSession && this.currentSession.isRunning) {
            // Restore running session
            this.isRunning = true;
            this.isPaused = this.currentSession.isPaused || false;
            this.startTime = this.currentSession.startTime;
            this.pausedTime = this.currentSession.pausedTime || 0;
            this.elapsedTime = this.currentSession.elapsedTime || 0;

            if (!this.isPaused) {
                this.startTimer();
            } else {
                // Calculate elapsed time up to pause
                this.elapsedTime = this.currentSession.elapsedTime || 0;
                this.notifyListeners();
            }
        }
    }

    // ==================== Session Management ====================

    startTMO() {
        if (this.isRunning) return;

        this.isRunning = true;
        this.isPaused = false;
        this.startTime = Date.now();
        this.elapsedTime = 0;
        this.pausedTime = 0;

        this.currentSession = {
            startTime: this.startTime,
            isRunning: true,
            isPaused: false,
            elapsedTime: 0,
            pausedTime: 0
        };

        this.saveActiveSession();
        this.startTimer();
        this.notifyListeners();
    }

    pauseTMO() {
        if (!this.isRunning || this.isPaused) return;

        this.isPaused = true;
        this.pausedTime = Date.now();

        // Calculate elapsed time up to pause
        this.elapsedTime = Date.now() - this.startTime;

        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }

        if (this.currentSession) {
            this.currentSession.isPaused = true;
            this.currentSession.pausedTime = this.pausedTime;
            this.currentSession.elapsedTime = this.elapsedTime;
            this.saveActiveSession();
        }

        this.notifyListeners();
    }

    resumeTMO() {
        if (!this.isRunning || !this.isPaused) return;

        this.isPaused = false;

        // Adjust start time to account for paused duration
        const pauseDuration = Date.now() - this.pausedTime;
        this.startTime += pauseDuration;

        if (this.currentSession) {
            this.currentSession.isPaused = false;
            this.currentSession.startTime = this.startTime;
            this.saveActiveSession();
        }

        this.startTimer();
        this.notifyListeners();
    }

    stopTMO(categoryId = 'otro', notes = '') {
        if (!this.isRunning) return null;

        // Calculate final duration
        const endTime = Date.now();
        const duration = this.isPaused ? this.elapsedTime : (endTime - this.startTime);

        // Create session record
        const session = {
            id: Date.now(),
            startTime: this.currentSession.startTime,
            endTime: endTime,
            duration: duration,
            categoryId: categoryId,
            notes: notes,
            date: new Date().toISOString()
        };

        // Save to history
        this.history.unshift(session);
        this.saveHistory();

        // Reset current session
        this.resetTMO();

        return session;
    }

    resetTMO() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }

        this.isRunning = false;
        this.isPaused = false;
        this.startTime = null;
        this.elapsedTime = 0;
        this.pausedTime = 0;
        this.currentSession = null;

        localStorage.removeItem('tmo_active_session');
        this.notifyListeners();
    }

    startTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }

        this.timerInterval = setInterval(() => {
            if (this.isRunning && !this.isPaused) {
                this.elapsedTime = Date.now() - this.startTime;

                if (this.currentSession) {
                    this.currentSession.elapsedTime = this.elapsedTime;
                    this.saveActiveSession();
                }

                this.notifyListeners();
            }
        }, 1000);
    }

    // ==================== Statistics Methods ====================

    getStatistics(period = 'all') {
        const now = new Date();
        let filteredSessions = this.history;

        if (period === 'today') {
            const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            filteredSessions = this.history.filter(s => new Date(s.date) >= todayStart);
        } else if (period === 'week') {
            const weekStart = new Date(now);
            weekStart.setDate(now.getDate() - 7);
            filteredSessions = this.history.filter(s => new Date(s.date) >= weekStart);
        } else if (period === 'month') {
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            filteredSessions = this.history.filter(s => new Date(s.date) >= monthStart);
        }

        if (filteredSessions.length === 0) {
            return {
                count: 0,
                totalTime: 0,
                averageTime: 0,
                minTime: 0,
                maxTime: 0
            };
        }

        const totalTime = filteredSessions.reduce((sum, s) => sum + s.duration, 0);
        const durations = filteredSessions.map(s => s.duration);

        return {
            count: filteredSessions.length,
            totalTime: totalTime,
            averageTime: Math.floor(totalTime / filteredSessions.length),
            minTime: Math.min(...durations),
            maxTime: Math.max(...durations)
        };
    }

    getStatisticsByCategory(categoryId) {
        const categorySessions = this.history.filter(s => s.categoryId === categoryId);

        if (categorySessions.length === 0) {
            return { count: 0, totalTime: 0, averageTime: 0 };
        }

        const totalTime = categorySessions.reduce((sum, s) => sum + s.duration, 0);

        return {
            count: categorySessions.length,
            totalTime: totalTime,
            averageTime: Math.floor(totalTime / categorySessions.length)
        };
    }

    // ==================== Category Management ====================

    getAllCategories() {
        return [...this.defaultCategories, ...this.customCategories];
    }

    getCategoryById(id) {
        return this.getAllCategories().find(c => c.id === id);
    }

    addCategory(name, color) {
        const id = 'custom_' + Date.now();
        const category = { id, name, color, custom: true };
        this.customCategories.push(category);
        this.saveCategories();
        return category;
    }

    deleteCategory(id) {
        const index = this.customCategories.findIndex(c => c.id === id);
        if (index !== -1) {
            this.customCategories.splice(index, 1);
            this.saveCategories();
            return true;
        }
        return false;
    }

    // ==================== History Management ====================

    getHistory(filters = {}) {
        let filtered = [...this.history];

        if (filters.categoryId) {
            filtered = filtered.filter(s => s.categoryId === filters.categoryId);
        }

        if (filters.startDate) {
            filtered = filtered.filter(s => new Date(s.date) >= new Date(filters.startDate));
        }

        if (filters.endDate) {
            filtered = filtered.filter(s => new Date(s.date) <= new Date(filters.endDate));
        }

        return filtered;
    }

    deleteSession(sessionId) {
        const index = this.history.findIndex(s => s.id === sessionId);
        if (index !== -1) {
            this.history.splice(index, 1);
            this.saveHistory();
            return true;
        }
        return false;
    }

    clearHistory() {
        this.history = [];
        this.saveHistory();
    }

    // ==================== Export/Import ====================

    exportData() {
        return {
            version: '1.0',
            exportDate: new Date().toISOString(),
            history: this.history,
            customCategories: this.customCategories
        };
    }

    importData(data) {
        try {
            if (data.history) {
                this.history = [...this.history, ...data.history];
                this.saveHistory();
            }

            if (data.customCategories) {
                this.customCategories = [...this.customCategories, ...data.customCategories];
                this.saveCategories();
            }

            return true;
        } catch (error) {
            console.error('Error importing TMO data:', error);
            return false;
        }
    }

    // ==================== Event System ====================

    addEventListener(callback) {
        this.listeners.push(callback);
    }

    removeEventListener(callback) {
        const index = this.listeners.indexOf(callback);
        if (index !== -1) {
            this.listeners.splice(index, 1);
        }
    }

    notifyListeners() {
        const state = this.getState();
        this.listeners.forEach(callback => {
            try {
                callback(state);
            } catch (error) {
                console.error('Error in TMO listener:', error);
            }
        });
    }

    // ==================== Utility Methods ====================

    getState() {
        return {
            isRunning: this.isRunning,
            isPaused: this.isPaused,
            elapsedTime: this.elapsedTime,
            formattedTime: this.formatTime(this.elapsedTime)
        };
    }

    getCurrentTime() {
        return this.elapsedTime;
    }

    formatTime(milliseconds) {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        if (hours > 0) {
            return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
}

// Create singleton instance
const tmoManager = new TMOManager();

// Export for module usage
export default tmoManager;

// Also expose globally for non-module scripts
window.TMOManager = tmoManager;
