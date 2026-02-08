const speedDisplay = document.getElementById("speed");
const speedControl = document.getElementById("speedControl");
const engineBtn = document.getElementById("engineBtn");

const BASE_FREQUENCY = 400;
const STEP_HZ = 6;

let audioContext = null;
let oscillator = null;
let gainNode = null;
let engineRunning = false;

function startEngine() {

    if (engineRunning) return;

    audioContext = new (window.AudioContext || window.webkitAudioContext)();

    oscillator = audioContext.createOscillator();
    gainNode = audioContext.createGain();

    oscillator.type = "sawtooth"; // по-моторен звук
    oscillator.frequency.value = BASE_FREQUENCY;

    gainNode.gain.value = 0.15;

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start();

    engineRunning = true;
    engineBtn.textContent = "Стоп";
    engineBtn.classList.add("stop");
}

function stopEngine() {

    if (!engineRunning) return;

    oscillator.stop();
    audioContext.close();

    engineRunning = false;
    engineBtn.textContent = "Старт";
    engineBtn.classList.remove("stop");
}

speedControl.addEventListener("input", function () {

    const speed = parseInt(this.value);
    speedDisplay.textContent = speed;

    if (!engineRunning) return;

    const newFrequency = BASE_FREQUENCY + speed * STEP_HZ;
    oscillator.frequency.setTargetAtTime(newFrequency, audioContext.currentTime, 0.05);
});

engineBtn.addEventListener("click", function () {

    if (!engineRunning) {
        startEngine();
    } else {
        stopEngine();
    }
});