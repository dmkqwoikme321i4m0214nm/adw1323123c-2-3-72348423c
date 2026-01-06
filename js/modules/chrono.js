/**
 * TypifyPro 3.0 - Chronometer Module (PiP)
 * Complete Picture-in-Picture Chronometer matching original project
 */

let pipWindow = null;
let pipDisplayElement;
let pipStartStopButton;
let pipStartStopIcon;
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
let timerPane;
let modalContainer;
let fab;

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
}

function stopTimer() {
    if (!running) return;
    clearInterval(timerInterval);
    elapsedTime = Date.now() - startTime;
    running = false;
    updateButtonState();
    saveTimerState();
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

    const alarmOverlay = pipWindow?.document.querySelector(".alarm-overlay");
    if (alarmOverlay) alarmOverlay.remove();
}

function loadTimer(totalSeconds) {
    resetTimer();
    loadedTotalSeconds = totalSeconds;
    saveLastSelectedTimer();
    updateDisplay(totalSeconds * 1000);
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
}

function updateDisplay(time) {
    if (!pipDisplayElement) return;
    const totalSeconds = Math.floor(time / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const formattedTime = `${String(hours).padStart(2, "0")}:${String(
        minutes
    ).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    pipDisplayElement.textContent = formattedTime;

    // Update header counter on all pages
    updateHeaderCounter(formattedTime, running, isCountdown);
}

function updateButtonState() {
    if (!pipStartStopIcon) return;
    pipStartStopIcon.textContent = running ? "pause" : "play_arrow";
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
    const overlay = pipWindow.document.createElement("div");
    overlay.className = "alarm-overlay";

    const message = pipWindow.document.createElement("div");
    message.className = "alarm-message";
    message.textContent = "IMPORTANTE: Retomar gestión para Evitar cliente desatendido";

    const stopBtn = pipWindow.document.createElement("button");
    stopBtn.className = "alarm-stop-btn";
    stopBtn.textContent = "Pausar Alarma";
    stopBtn.onclick = () => {
        const lastTimerSeconds = loadedTotalSeconds;
        resetTimer();
        if (lastTimerSeconds > 0) {
            loadTimer(lastTimerSeconds);
        }
    };

    overlay.append(message, stopBtn);
    pipWindow.document.body.appendChild(overlay);
}

// Save timer state to localStorage
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

// Restore timer state from localStorage
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


// Open Chrono in standalone window
async function openChronoPip() {
    // Check if window is already open
    if (pipWindow && !pipWindow.closed) {
        pipWindow.focus();
        return;
    }

    try {
        // Open standalone window
        pipWindow = window.open(
            'chrono-pip.html',
            'ChronoWindow',
            'width=280,height=260,resizable=yes,scrollbars=no'
        );

        if (!pipWindow) {
            alert('Por favor, permite las ventanas emergentes para usar el cronómetro.');
            return;
        }

        // Listen for window close
        const checkClosed = setInterval(() => {
            if (pipWindow && pipWindow.closed) {
                clearInterval(checkClosed);
                pipWindow = null;
            }
        }, 1000);

    } catch (error) {
        console.error("Error al abrir cronómetro:", error);
    }
}

// Listen for localStorage changes to update header
window.addEventListener('storage', (e) => {
    if (e.key === 'chrono_broadcast' && e.newValue) {
        try {
            const state = JSON.parse(e.newValue);
            updateHeaderCounter(state.realTime, state.formattedTime, state.isRunning, state.isPaused);
        } catch (err) {
            console.error('Error parsing chrono broadcast:', err);
        }
    }
});

// Also check localStorage periodically for same-window updates
setInterval(() => {
    const broadcast = localStorage.getItem('chrono_broadcast');
    if (broadcast) {
        try {
            const state = JSON.parse(broadcast);
            updateHeaderCounter(state.realTime, state.formattedTime, state.isRunning, state.isPaused);
        } catch (err) {
            // Ignore parse errors
        }
    }
}, 200);

// Update header counter across all pages
function updateHeaderCounter(realTime, appliedTime, isRunning, isPaused) {
    const counter = document.getElementById('tmoCounter');
    const timer = document.getElementById('headerTmoTimer');

    if (counter && timer) {
        // Display only the Chronometer (Applied Time)
        counter.textContent = appliedTime || '00:00:00';

        if (isRunning && !isPaused) {
            timer.classList.add('running');
            timer.classList.remove('paused');
        } else if (isPaused) {
            timer.classList.add('paused');
            timer.classList.remove('running');
        } else {
            timer.classList.remove('running', 'paused');
        }
    }
}

/**
 * Handles click on the header chronometer/timer.
 * Starts the timer if not running and opens the PiP window.
 */
function handleHeaderTimerClick() {
    openChronoPip();
}

// Expose globally
window.openChronoPip = openChronoPip;
window.resetChrono = resetTimer;
window.startChrono = startTimer;
window.handleHeaderTimerClick = handleHeaderTimerClick;

