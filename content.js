let audioContext;
let source;
let lowpassFilter;
let highpassFilter;
let distortion;
let bassDistortion;
let bassFilter;
let gainNode;
let isEffectOn = false;

function createAudioGraph() {
    const videoElement = document.querySelector('video');
    if (videoElement && !audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        source = audioContext.createMediaElementSource(videoElement);
        
        // Create a lowpass filter to cut off high frequencies
        lowpassFilter = audioContext.createBiquadFilter();
        lowpassFilter.type = 'lowpass';
        lowpassFilter.frequency.setValueAtTime(16000, audioContext.currentTime);
        
        // Create a highpass filter to cut off very low frequencies
        highpassFilter = audioContext.createBiquadFilter();
        highpassFilter.type = 'highpass';
        highpassFilter.frequency.setValueAtTime(0, audioContext.currentTime);
        
        // Create a waveshaper for distortion
        distortion = audioContext.createWaveShaper();
        distortion.curve = makeDistortionCurve(50);

        // Create a bandpass filter to isolate bass frequencies
        bassFilter = audioContext.createBiquadFilter();
        bassFilter.type = 'bandpass';
        bassFilter.frequency.setValueAtTime(100, audioContext.currentTime);
        bassFilter.Q.setValueAtTime(1, audioContext.currentTime);
        
        // Create another waveshaper for bass distortion
        bassDistortion = audioContext.createWaveShaper();
        bassDistortion.curve = makeDistortionCurve(200);
        
        // Create a GainNode to adjust volume
        gainNode = audioContext.createGain();
        gainNode.gain.setValueAtTime(0.8, audioContext.currentTime);

        source.connect(audioContext.destination);
        console.log('Audio graph created');
    } else if (!videoElement) {
        console.log('No video element found');
    }
}

function makeDistortionCurve(amount) {
    const k = typeof amount === 'number' ? amount : 50;
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;

    for (let i = 0; i < n_samples; ++i) {
        const x = (i * 2) / n_samples - 1;
        curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve;
}

function toggleLowQualityEffect() {
    if (!audioContext) {
        createAudioGraph();
    }
    
    isEffectOn = !isEffectOn;
    if (isEffectOn) {
        source.disconnect(audioContext.destination);
        source.connect(lowpassFilter);
        lowpassFilter.connect(highpassFilter);
        highpassFilter.connect(distortion);
        distortion.connect(gainNode);

        // Connect bass filter and distortion in parallel
        source.connect(bassFilter);
        bassFilter.connect(bassDistortion);
        bassDistortion.connect(gainNode);

        gainNode.connect(audioContext.destination);
        console.log('Low-quality MP3 effect enabled');
    } else {
        source.disconnect(lowpassFilter);
        lowpassFilter.disconnect(highpassFilter);
        highpassFilter.disconnect(distortion);
        distortion.disconnect(gainNode);

        // Disconnect bass filter and distortion
        source.disconnect(bassFilter);
        bassFilter.disconnect(bassDistortion);
        bassDistortion.disconnect(gainNode);

        gainNode.disconnect(audioContext.destination);
        source.connect(audioContext.destination);
        console.log('Low-quality MP3 effect disabled');
    }
    updateButtonColor();
}

function updateButtonColor() {
    const button = document.getElementById('toggleButton');
    if (button) {
        button.style.backgroundColor = isEffectOn ? '#00ff00' : '#ff0000';
        button.textContent = isEffectOn ? 'Disable Low-Quality MP3 Effect' : 'Enable Low-Quality MP3 Effect';
    }
}

function addButton() {
    const button = document.createElement('button');
    button.id = 'toggleButton';
    button.textContent = 'Enable Low-Quality MP3 Effect';
    button.style.position = 'fixed';
    button.style.top = '10px';
    button.style.left = '10px';
    button.style.zIndex = '9999';
    button.style.padding = '5px 10px';
    button.style.backgroundColor = '#ff0000';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.borderRadius = '5px';
    button.style.cursor = 'pointer';
    
    button.addEventListener('click', toggleLowQualityEffect);
    document.body.appendChild(button);
    console.log('Button added to page');
}

// Run when the page is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addButton);
} else {
    addButton();
}

console.log('Content script loaded');
