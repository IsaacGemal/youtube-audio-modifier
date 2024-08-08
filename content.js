let audioContext;
let source;
let effectNode;
let isEffectOn = false;

function createAudioGraph() {
    const videoElement = document.querySelector('video');
    if (videoElement && !audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        source = audioContext.createMediaElementSource(videoElement);
        
        effectNode = audioContext.createScriptProcessor(4096, 2, 2);
        effectNode.onaudioprocess = lowQualityMP3Effect;

        source.connect(audioContext.destination);
        console.log('Audio graph created');
    } else if (!videoElement) {
        console.log('No video element found');
    }
}

function lowQualityMP3Effect(audioProcessingEvent) {
    const inputBuffer = audioProcessingEvent.inputBuffer;
    const outputBuffer = audioProcessingEvent.outputBuffer;

    for (let channel = 0; channel < outputBuffer.numberOfChannels; channel++) {
        const inputData = inputBuffer.getChannelData(channel);
        const outputData = outputBuffer.getChannelData(channel);

        for (let sample = 0; sample < inputBuffer.length; sample++) {
            // Simulate low sample rate (aliasing)
            const downsampledIndex = Math.floor(sample / 4) * 4;
            let value = inputData[downsampledIndex];

            // Reduce high frequencies
            value = 0.8 * value + 0.2 * (sample > 0 ? outputData[sample - 1] : 0);

            // Add quantization noise
            const quantizationLevels = 32;
            value = Math.round(value * quantizationLevels) / quantizationLevels;

            // Add some subtle noise to simulate artifacts
            value += (Math.random() - 0.5) * 0.01;

            outputData[sample] = value;
        }
    }
}

function toggleLowQualityEffect() {
    if (!audioContext) {
        createAudioGraph();
    }
    
    isEffectOn = !isEffectOn;
    if (isEffectOn) {
        source.disconnect(audioContext.destination);
        source.connect(effectNode);
        effectNode.connect(audioContext.destination);
        console.log('Low-quality MP3 effect enabled');
    } else {
        source.disconnect(effectNode);
        effectNode.disconnect(audioContext.destination);
        source.connect(audioContext.destination);
        console.log('Low-quality MP3 effect disabled');
    }
    updateButtonColor();
}

function updateButtonColor() {
    const button = document.getElementById('toggleButton');
    if (button) {
        button.style.backgroundColor = isEffectOn ? '#00ff00' : '#ff0000';
        button.textContent = isEffectOn ? 'Disable Low-Quality MP3' : 'Enable Low-Quality MP3';
    }
}

function addButton() {
    const button = document.createElement('button');
    button.id = 'toggleButton';
    button.textContent = 'Enable Low-Quality MP3';
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