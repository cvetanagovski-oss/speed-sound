const speedDisplay = document.getElementById("speed");
const speedControl = document.getElementById("speedControl");
const muteBtn = document.getElementById("muteBtn");

const BASE_FREQUENCY = 500;
const STEP_HZ = 2;

let audioContext = null;
let oscillator = null;
let isMuted = false;

function startAudio() {

    if (audioContext) return;

    audioContext = new (window.AudioContext || window.webkitAudioContext)();

    oscillator = audioContext.createOscillator();
    oscillator.type = "sine";
    oscillator.frequency.value = BASE_FREQUENCY;

    oscillator.connect(audioContext.destination);

    audioContext.resume().then(() => {
        oscillator.start();
    });
}

document.addEventListener("touchstart", startAudio, { once: true });
document.addEventListener("click", startAudio, { once: true });

speedControl.addEventListener("input", function () {

    const speed = parseInt(this.value);
    speedDisplay.textContent = speed;

    if (!oscillator || isMuted) return;

    oscillator.frequency.value = BASE_FREQUENCY + speed * STEP_HZ;
});

muteBtn.addEventListener("click", function () {

    if (!audioContext) return;

    if (!isMuted) {
        audioContext.suspend();
        muteBtn.textContent = "Включи звук";
        isMuted = true;
    } else {
        audioContext.resume();
        muteBtn.textContent = "Изключи звук";
        isMuted = false;
    }
});