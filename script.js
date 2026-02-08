const speedDisplay = document.getElementById("speed");
const speedControl = document.getElementById("speedControl");
const engineBtn = document.getElementById("engineBtn");

const BASE_FREQUENCY = 120;
const STEP_HZ = 8;

let audioContext = null;
let engineRunning = false;

let mainOsc = null;
let highOsc = null;
let gainNode = null;
let filterNode = null;
let lfo = null;
let lfoGain = null;

// ================= ENGINE START =================
function startEngine() {

    if (engineRunning) return;

    audioContext = new (window.AudioContext || window.webkitAudioContext)();

    // За Safari / мобилни
    if (audioContext.state === "suspended") {
        audioContext.resume();
    }

    gainNode = audioContext.createGain();
    gainNode.gain.value = 0.2;

    filterNode = audioContext.createBiquadFilter();
    filterNode.type = "lowpass";
    filterNode.frequency.value = 2000;

    // Основен тон
    mainOsc = audioContext.createOscillator();
    mainOsc.type = "sine";
    mainOsc.frequency.value = BASE_FREQUENCY;

    // Висок слой
    highOsc = audioContext.createOscillator();
    highOsc.type = "triangle";
    highOsc.frequency.value = BASE_FREQUENCY * 2;

    // LFO
    lfo = audioContext.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = 6;

    lfoGain = audioContext.createGain();
    lfoGain.gain.value = 5;

    lfo.connect(lfoGain);
    lfoGain.connect(mainOsc.frequency);

    mainOsc.connect(gainNode);
    highOsc.connect(gainNode);

    gainNode.connect(filterNode);
    filterNode.connect(audioContext.destination);

    mainOsc.start();
    highOsc.start();
    lfo.start();

    engineRunning = true;
    engineBtn.textContent = "Стоп";
    engineBtn.classList.add("stop");
}

// ================= ENGINE STOP =================
function stopEngine() {

    if (!engineRunning) return;

    mainOsc.stop();
    highOsc.stop();
    lfo.stop();

    audioContext.close();

    mainOsc = null;
    highOsc = null;
    lfo = null;
    audioContext = null;

    engineRunning = false;
    engineBtn.textContent = "Старт";
    engineBtn.classList.remove("stop");
}

// ================= UPDATE SOUND =================
function updateSound(speed) {

    if (!engineRunning) return;

    const newFreq = BASE_FREQUENCY + speed * STEP_HZ;

    mainOsc.frequency.setTargetAtTime(
        newFreq,
        audioContext.currentTime,
        0.1
    );

    highOsc.frequency.setTargetAtTime(
        newFreq * 2,
        audioContext.currentTime,
        0.1
    );

    filterNode.frequency.setTargetAtTime(
        2000 + speed * 40,
        audioContext.currentTime,
        0.2
    );
}

// ================= SLIDER CONTROL =================
speedControl.addEventListener("input", function () {

    const speed = parseInt(this.value);
    speedDisplay.textContent = speed;

    updateSound(speed);
});

// ================= BUTTON CONTROL =================
engineBtn.addEventListener("click", function () {

    if (!engineRunning) {
        startEngine();
    } else {
        stopEngine();
    }
});

// ================= GPS SPEED =================
if ("geolocation" in navigator) {

    navigator.geolocation.watchPosition(
        function (position) {

            if (!engineRunning) return;

            let gpsSpeed = position.coords.speed; // m/s

            if (gpsSpeed === null) return;

            // m/s → km/h
            gpsSpeed = gpsSpeed * 3.6;

            // ограничение до 30 (max на slider-а)
            gpsSpeed = Math.min(30, Math.max(0, gpsSpeed));

            const roundedSpeed = Math.round(gpsSpeed);

            // синхронизираме slider-а
            speedControl.value = roundedSpeed;

            // обновяваме дисплея
            speedDisplay.textContent = roundedSpeed;

            updateSound(roundedSpeed);
        },
        function (error) {
            console.log("GPS error:", error);
        },
        {
            enableHighAccuracy: true,
            maximumAge: 1000,
            timeout: 5000
        }
    );
}