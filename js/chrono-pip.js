/**
 * TypifyPro 3.0 - Standalone Chronometer Window
 * This runs independently in its own window
 */

let timerInterval;
let alarmInterval;
let running = false;
let startTime;
let elapsedTime = 0;
let loadedTotalSeconds = 0;
let isCountdown = false;
let timerPresets = [];
let selectedAlarmSound = "Classic Beep";
let audioContext;
let currentTheme = localStorage.getItem('selectedTheme') || 'tema_mundo';
let isHeaderHidden = localStorage.getItem('pipTimer_headerHidden') === 'true';

// Theme Logic
function applyTheme(themeName) {
    if (!themeName) return;

    // Normalize if necessary (matching ui.js logic)
    if (themeName === 'MUNDO') themeName = 'tema_mundo';
    if (themeName === 'DARK') themeName = 'dark_blue';

    if (themeName === 'tema_mundo') {
        document.documentElement.removeAttribute('data-theme');
    } else {
        document.documentElement.setAttribute('data-theme', themeName);
    }
    currentTheme = themeName;
}

// Alarm Sounds
const alarmSounds = {
    "Classic Beep": [{ freq: 1000, duration: 0.2, delay: 0 }],
    "Fast Beep": [
        { freq: 1200, duration: 0.1, delay: 0 },
        { freq: 1200, duration: 0.1, delay: 0.15 },
    ],
    Siren: [
        { freq: 900, duration: 0.3, delay: 0 },
        { freq: 1200, duration: 0.3, delay: 0.3 },
    ],
    Urgent: [
        { freq: 1500, duration: 0.08, delay: 0 },
        { freq: 1500, duration: 0.08, delay: 0.12 },
        { freq: 1500, duration: 0.08, delay: 0.24 },
    ],
    Digital: [
        { freq: 1000, duration: 0.1, delay: 0 },
        { freq: 1000, duration: 0.1, delay: 0.2 },
    ],
};

// LocalStorage Functions
function savePresets() {
    localStorage.setItem("pipTimer_presets", JSON.stringify(timerPresets));
}

function saveSelectedSound() {
    localStorage.setItem("pipTimer_selectedSound", selectedAlarmSound);
}

function saveLastSelectedTimer() {
    localStorage.setItem("pipTimer_lastSelected", loadedTotalSeconds);
}

function loadFromLocalStorage() {
    const savedPresets = localStorage.getItem("pipTimer_presets");
    const savedSound = localStorage.getItem("pipTimer_selectedSound");
    const savedLastTimer = localStorage.getItem("pipTimer_lastSelected");

    if (savedPresets) {
        timerPresets = JSON.parse(savedPresets);
    } else {
        timerPresets = [
            { name: "01:30", totalSeconds: 90 },
            { name: "00:30", totalSeconds: 30 },
            { name: "02:00", totalSeconds: 120 },
            { name: "01:00", totalSeconds: 60 },
            { name: "03:00", totalSeconds: 180 },
        ];
        savePresets();
    }

    if (savedSound && alarmSounds[savedSound]) {
        selectedAlarmSound = savedSound;
    }

    if (savedLastTimer) {
        loadedTotalSeconds = parseInt(savedLastTimer, 10);
    }
}

// Timer Logic
function initializeAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function startStopTimer() {
    initializeAudio();
    if (running) stopTimer();
    else startTimer();
}

function startTimer() {
    if (running) return;
    isCountdown = loadedTotalSeconds > 0 && elapsedTime === 0;
    startTime = Date.now() - elapsedTime;
    timerInterval = setInterval(updateTime, 100);
    running = true;
    updateButtonState();
    stopAlarm();
    saveTimerState();
    broadcastState();
}

function stopTimer() {
    if (!running) return;
    clearInterval(timerInterval);
    elapsedTime = Date.now() - startTime;
    running = false;
    updateButtonState();
    saveTimerState();
    broadcastState();
}

function resetTimer() {
    stopTimer();
    stopAlarm();
    elapsedTime = 0;
    loadedTotalSeconds = 0;
    isCountdown = false;
    updateDisplay(0);
    updateButtonState();
    saveTimerState();
    broadcastState();

    const alarmOverlay = document.querySelector(".alarm-overlay");
    if (alarmOverlay) alarmOverlay.remove();
}


function loadTimer(totalSeconds) {
    resetTimer();
    loadedTotalSeconds = totalSeconds;
    saveLastSelectedTimer();
    updateDisplay(totalSeconds * 1000);
    saveTimerState();
    broadcastState();
}

function updateTime() {
    let displayTime;
    if (isCountdown) {
        const remainingTime = Math.max(
            0,
            loadedTotalSeconds * 1000 - (Date.now() - startTime)
        );
        displayTime = remainingTime;
        if (remainingTime <= 0) {
            stopTimer();
            startAlarm();
            showFullScreenAlarm();
        }
    } else {
        elapsedTime = Date.now() - startTime;
        displayTime = elapsedTime;
    }
    updateDisplay(displayTime);
    broadcastState();
}

function updateDisplay(time) {
    const totalSeconds = Math.floor(time / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const formattedTime = `${String(hours).padStart(2, "0")}:${String(
        minutes
    ).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    document.getElementById('pipDisplay').textContent = formattedTime;
}

function updateButtonState() {
    const icon = document.getElementById('startStopIcon');
    icon.textContent = running ? "pause" : "play_arrow";
}

function playSound(soundKey = selectedAlarmSound) {
    initializeAudio();
    const soundSequence = alarmSounds[soundKey];

    soundSequence.forEach((note) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.type = "square";
        oscillator.frequency.setValueAtTime(
            note.freq,
            audioContext.currentTime + note.delay
        );
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime + note.delay);
        gainNode.gain.exponentialRampToValueAtTime(
            0.0001,
            audioContext.currentTime + note.delay + note.duration
        );

        oscillator.start(audioContext.currentTime + note.delay);
        oscillator.stop(audioContext.currentTime + note.delay + note.duration);
    });
}

function startAlarm() {
    stopAlarm();
    playSound();
    alarmInterval = setInterval(() => playSound(), 1000);
}

function stopAlarm() {
    clearInterval(alarmInterval);
}

function showFullScreenAlarm() {
    const overlay = document.createElement("div");
    overlay.className = "alarm-overlay";

    const message = document.createElement("div");
    message.className = "alarm-message";
    message.textContent = "IMPORTANTE: Retomar gestión para Evitar cliente desatendido";

    const stopBtn = document.createElement("button");
    stopBtn.className = "alarm-stop-btn";
    stopBtn.innerHTML = `
        <span class="material-icons">notifications_paused</span>
        Pausar Alarma
    `;
    stopBtn.onclick = () => {
        const lastTimerSeconds = loadedTotalSeconds;
        resetTimer();
        if (lastTimerSeconds > 0) {
            loadTimer(lastTimerSeconds);
        }
    };

    overlay.append(message, stopBtn);
    document.body.appendChild(overlay);
}

// Save/Restore timer state
function saveTimerState() {
    const state = {
        running: running,
        startTime: startTime,
        elapsedTime: elapsedTime,
        loadedTotalSeconds: loadedTotalSeconds,
        isCountdown: isCountdown
    };
    localStorage.setItem('pipTimer_state', JSON.stringify(state));
}

function restoreTimerState() {
    const savedState = localStorage.getItem('pipTimer_state');
    if (savedState) {
        try {
            const state = JSON.parse(savedState);
            if (state.running) {
                loadedTotalSeconds = state.loadedTotalSeconds || 0;
                isCountdown = state.isCountdown || false;
                elapsedTime = Date.now() - state.startTime;
                startTimer();
            } else if (state.elapsedTime > 0) {
                elapsedTime = state.elapsedTime;
                loadedTotalSeconds = state.loadedTotalSeconds || 0;
                updateDisplay(elapsedTime);
            }
        } catch (e) {
            console.error('Error restoring timer state:', e);
        }
    }
}

// Broadcast state to parent windows
function broadcastState() {
    const now = new Date();
    const realTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;

    let totalSeconds;
    if (running) {
        if (isCountdown) {
            const remainingTime = Math.max(0, loadedTotalSeconds * 1000 - (Date.now() - startTime));
            totalSeconds = Math.floor(remainingTime / 1000);
        } else {
            totalSeconds = Math.floor((Date.now() - startTime) / 1000);
        }
    } else {
        if (loadedTotalSeconds > 0 && elapsedTime === 0) {
            // Preset loaded but not yet started
            totalSeconds = loadedTotalSeconds;
        } else {
            totalSeconds = Math.floor(elapsedTime / 1000);
        }
    }

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const formattedTime = `${String(hours).padStart(2, "0")}:${String(
        minutes
    ).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

    const state = {
        type: 'chronoUpdate',
        formattedTime: formattedTime,
        realTime: realTime,
        isRunning: running,
        isPaused: !running && elapsedTime > 0
    };

    localStorage.setItem('chrono_broadcast', JSON.stringify(state));
}

// Header Visibility
function toggleHeader() {
    isHeaderHidden = !isHeaderHidden;
    localStorage.setItem('pipTimer_headerHidden', isHeaderHidden);
    updateHeaderUI();
}

function updateHeaderUI() {
    const header = document.querySelector('.pip-header');
    const toggleIcon = document.getElementById('toggleHeaderIcon');

    if (isHeaderHidden) {
        header.classList.add('hidden');
        toggleIcon.textContent = 'visibility';
    } else {
        header.classList.remove('hidden');
        toggleIcon.textContent = 'visibility_off';
    }
}

// Tab switching
function switchTab(tabId) {
    document.querySelectorAll(".pip-tab").forEach((btn) => btn.classList.remove("active"));
    document.querySelector(`[data-tab="${tabId}"]`).classList.add("active");
    document.querySelectorAll(".tab-pane").forEach((pane) => pane.classList.remove("active"));
    document.getElementById(`${tabId}-pane`).classList.add("active");
}

// Render presets
function renderPresetList() {
    const container = document.getElementById('presetList');
    container.innerHTML = "";
    timerPresets.forEach((preset, index) => {
        const li = document.createElement("li");
        li.className = "preset-item";
        const mins = Math.floor(preset.totalSeconds / 60);
        const secs = preset.totalSeconds % 60;
        const nameSpan = document.createElement("span");
        nameSpan.textContent = preset.name || `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

        const actionsDiv = document.createElement("div");
        actionsDiv.className = "item-actions";

        const selectButton = document.createElement("button");
        selectButton.className = "select-btn";
        selectButton.innerHTML = `<i class="material-icons">input</i>`;
        selectButton.onclick = (e) => {
            e.stopPropagation();
            loadTimer(preset.totalSeconds);
            switchTab("timer");
        };

        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-btn";
        deleteButton.innerHTML = `<i class="material-icons">delete_outline</i>`;
        deleteButton.onclick = (e) => {
            e.stopPropagation();
            showDeleteConfirmationModal(index);
        };

        actionsDiv.append(selectButton, deleteButton);
        li.append(nameSpan, actionsDiv);
        container.append(li);
    });
}

// Render sound settings
function renderSoundSettings() {
    const container = document.getElementById('settingsList');
    container.innerHTML = "";
    Object.keys(alarmSounds).forEach((key) => {
        const li = document.createElement("li");
        li.className = `setting-item ${selectedAlarmSound === key ? "selected" : ""}`;
        li.onclick = () => {
            selectedAlarmSound = key;
            saveSelectedSound();
            renderSoundSettings();
        };

        const nameSpan = document.createElement("span");
        nameSpan.textContent = key;

        const actionsDiv = document.createElement("div");
        actionsDiv.className = "item-actions";

        const playBtn = document.createElement("button");
        playBtn.innerHTML = `<i class="material-icons">play_circle_outline</i>`;
        playBtn.onclick = (e) => {
            e.stopPropagation();
            playSound(key);
        };

        const checkIcon = document.createElement("i");
        checkIcon.className = "material-icons check-icon";
        checkIcon.textContent = "check_circle";

        actionsDiv.append(playBtn, checkIcon);
        li.append(nameSpan, actionsDiv);
        container.appendChild(li);
    });
}

// Number picker for creating timers
function createNumberPicker(max) {
    let value = 0;
    const picker = document.createElement("div");
    picker.className = "number-picker";
    const upBtn = document.createElement("button");
    upBtn.className = "picker-btn";
    upBtn.innerHTML = "▲";

    const valueDisplay = document.createElement("div");
    valueDisplay.className = "picker-value";

    const downBtn = document.createElement("button");
    downBtn.className = "picker-btn";
    downBtn.innerHTML = "▼";

    const updateValue = () => {
        valueDisplay.textContent = String(value).padStart(2, "0");
    };

    upBtn.onclick = () => {
        value = (value + 1) % (max + 1);
        updateValue();
    };
    downBtn.onclick = () => {
        value = (value - 1 + (max + 1)) % (max + 1);
        updateValue();
    };

    updateValue();
    picker.append(upBtn, valueDisplay, downBtn);
    return { element: picker, getValue: () => value };
}

// Show create modal
function showCreateModal() {
    const modalContainer = document.getElementById('modalContainer');
    modalContainer.innerHTML = "";

    const header = document.createElement("div");
    header.className = "modal-header";
    header.textContent = "Crear Temporizador";

    const body = document.createElement("div");
    body.className = "modal-body";
    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.placeholder = "Nombre (opcional)";
    const timePickerContainer = document.createElement("div");
    timePickerContainer.className = "time-picker-container";
    const minutePicker = createNumberPicker(59);
    const secondPicker = createNumberPicker(59);
    const separator = document.createElement("span");
    separator.textContent = ":";
    separator.className = "time-separator";
    timePickerContainer.append(minutePicker.element, separator, secondPicker.element);
    body.append(nameInput, timePickerContainer);

    const footer = document.createElement("div");
    footer.className = "modal-footer";
    const cancelBtn = document.createElement("button");
    cancelBtn.className = "modal-btn cancel";
    cancelBtn.textContent = "Cancelar";
    cancelBtn.onclick = () => (modalContainer.style.display = "none");
    const confirmBtn = document.createElement("button");
    confirmBtn.className = "modal-btn confirm";
    confirmBtn.textContent = "Guardar";
    confirmBtn.onclick = () => {
        const totalSeconds = minutePicker.getValue() * 60 + secondPicker.getValue();
        if (totalSeconds > 0) {
            const newPreset = { totalSeconds };
            const name = nameInput.value.trim();
            if (name) newPreset.name = name;
            timerPresets.push(newPreset);
            savePresets();
            renderPresetList();
            modalContainer.style.display = "none";
        } else {
            alert("Por favor, introduce una duración válida.");
        }
    };
    footer.append(cancelBtn, confirmBtn);

    modalContainer.append(header, body, footer);
    modalContainer.style.display = "flex";
}

// Show delete confirmation modal
function showDeleteConfirmationModal(index) {
    const modalContainer = document.getElementById('modalContainer');
    modalContainer.innerHTML = "";

    const preset = timerPresets[index];
    const mins = Math.floor(preset.totalSeconds / 60);
    const secs = preset.totalSeconds % 60;
    const timeString = preset.name || `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

    const header = document.createElement("div");
    header.className = "modal-header";
    header.textContent = "Confirmar Eliminación";

    const body = document.createElement("div");
    body.className = "modal-body";
    const message = document.createElement("p");
    message.style.fontSize = "0.9rem";
    message.textContent = `¿Seguro que quieres eliminar "${timeString}"?`;
    body.append(message);

    const footer = document.createElement("div");
    footer.className = "modal-footer";
    const cancelBtn = document.createElement("button");
    cancelBtn.className = "modal-btn cancel";
    cancelBtn.textContent = "Cancelar";
    cancelBtn.onclick = () => (modalContainer.style.display = "none");
    const confirmBtn = document.createElement("button");
    confirmBtn.className = "modal-btn danger";
    confirmBtn.textContent = "Eliminar";
    confirmBtn.onclick = () => {
        timerPresets.splice(index, 1);
        savePresets();
        renderPresetList();
        modalContainer.style.display = "none";
    };
    footer.append(cancelBtn, confirmBtn);

    modalContainer.append(header, body, footer);
    modalContainer.style.display = "flex";
}

// Initialize
function init() {
    loadFromLocalStorage();

    // Initial Theme
    applyTheme(localStorage.getItem('selectedTheme'));

    // Listen for theme changes from other windows
    window.addEventListener('storage', (e) => {
        if (e.key === 'selectedTheme') {
            applyTheme(e.newValue);
        }
    });

    if (loadedTotalSeconds > 0) {
        updateDisplay(loadedTotalSeconds * 1000);
    } else if (timerPresets.length > 0) {
        loadTimer(timerPresets[0].totalSeconds);
    }

    updateButtonState();
    renderPresetList();
    renderSoundSettings();
    updateHeaderUI();

    // Remove flicker-prevention classes after a short delay
    setTimeout(() => {
        document.body.classList.remove('no-transition');
        document.documentElement.classList.remove('header-initially-hidden');
    }, 100);

    // Event listeners
    document.getElementById('toggleHeaderBtn').onclick = toggleHeader;
    document.getElementById('startStopBtn').onclick = startStopTimer;
    document.getElementById('resetBtn').onclick = () => {
        resetTimer();
        if (timerPresets.length > 0) {
            loadTimer(timerPresets[0].totalSeconds);
        }
    };

    document.querySelectorAll('.pip-tab').forEach(tab => {
        tab.onclick = () => switchTab(tab.dataset.tab);
    });

    document.getElementById('fabBtn').onclick = showCreateModal;

    // Restore timer state
    restoreTimerState();

    // Start broadcasting real time even if timer is not running
    setInterval(broadcastState, 500);
}

// Run on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
