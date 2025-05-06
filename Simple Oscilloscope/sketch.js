let canvas;

let osc1, osc2, osc3;
let analyzer1, analyzer2, analyzer3;
let distortion, lfo;
let isOscPlaying = false;

function setup() {
  const visualWindow = document.getElementById("visual-window");
  canvas = createCanvas(visualWindow.offsetWidth, visualWindow.offsetHeight, WEBGL);
  canvas.parent("visual-window");

  // Initialize oscillators
  osc1 = new Tone.Oscillator(110, "sine").toMaster().start();
  osc2 = new Tone.Oscillator(220, "sine").toMaster().start();
  osc3 = new Tone.Oscillator(440, "sine").toMaster().start();

  // Stop oscillators initially
  osc1.stop();
  osc2.stop();
  osc3.stop();
  isOscPlaying = false;

  // Set initial volumes
  osc1.volume.value = -18;
  osc2.volume.value = -18;
  osc3.volume.value = -18;

  // Initialize analyzers
  analyzer1 = new Tone.Waveform(1024);
  analyzer2 = new Tone.Waveform(1024);
  analyzer3 = new Tone.Waveform(1024);

  osc1.connect(analyzer1);
  osc2.connect(analyzer2);
  osc3.connect(analyzer3);

  // Initialize effects
  distortion = new Tone.Distortion(0.4).toMaster();
  lfo = new Tone.LFO("4n", 0, 1).start();

  // Connect oscillators to effects
  osc1.connect(distortion);
  osc2.connect(distortion);
  osc3.connect(distortion);

  // Modulate distortion wet value with LFO
  lfo.connect(distortion.wet);

  // Create control panel
  createControlPanel();
  createEffectsControlPanel();
}

function draw() {
  background(0);
  stroke(255);

  // Fetch waveform data from analyzers
  let waveform1 = analyzer1.getValue();
  let waveform2 = analyzer2.getValue();
  let waveform3 = analyzer3.getValue();

  // Normalize waveform data to match volume
  let maxAmplitude = Math.max(...waveform1.map(Math.abs), ...waveform2.map(Math.abs), ...waveform3.map(Math.abs));
  if (maxAmplitude > 0) {
    waveform1 = waveform1.map(v => v / maxAmplitude);
    waveform2 = waveform2.map(v => v / maxAmplitude);
    waveform3 = waveform3.map(v => v / maxAmplitude);
  }

  // Rotate the 3D visualization around its own center
  push();
  translate(0, 0, 0); // Ensure rotation is centered
  rotateX(frameCount * 0.01);
  rotateY(frameCount * 0.01);

  strokeWeight(2);
  noFill();

  let cubeSize = min(width * 0.5, height * 0.5) * 0.8; // Adjusted for better fit
  beginShape();
  for (let i = 0; i < waveform1.length; i++) {
    let x = map(waveform1[i], -1, 1, -cubeSize / 2, cubeSize / 2);
    let y = map(waveform2[i], -1, 1, -cubeSize / 2, cubeSize / 2);
    let z = map(waveform3[i], -1, 1, -cubeSize / 2, cubeSize / 2);
    vertex(x, y, z);
  }
  endShape();
  pop();
}

function createControlPanel() {
  const controlPanel = select("#oscillator-controls");
  controlPanel.style("display", "flex");
  controlPanel.style("justify-content", "space-around");
  controlPanel.style("align-items", "center");
  controlPanel.style("flex-wrap", "wrap");
  controlPanel.style("padding", "10px");

  // Create controls for each oscillator
  for (let i = 1; i <= 3; i++) {
    const oscDiv = createDiv().addClass("oscillator").parent(controlPanel);
    oscDiv.style("display", "flex");
    oscDiv.style("flex-direction", "column");
    oscDiv.style("align-items", "center");
    oscDiv.style("margin", "10px");

    createElement("h3", `Oscillator ${i}`).parent(oscDiv).style("margin-bottom", "10px");

    // Dropdown for waveform type
    const typeSelector = createSelect().parent(oscDiv);
    typeSelector.option("sine");
    typeSelector.option("square");
    typeSelector.option("triangle");
    typeSelector.option("sawtooth");
    typeSelector.style("margin-bottom", "10px");
    typeSelector.changed(() => changeOscillatorType(i));

    // Label and slider for volume
    createElement("label", "Volume").parent(oscDiv).style("margin-bottom", "5px");
    const volumeSlider = createSlider(-48, 0, -12, 1)
      .addClass("volume-slider")
      .addClass("vertical-slider")
      .parent(oscDiv);
    volumeSlider.input(() => updateVolume(i, volumeSlider.value()));

    // Assign sliders to variables
    if (i === 1) osc1TypeSelector = typeSelector, osc1VolumeSlider = volumeSlider;
    if (i === 2) osc2TypeSelector = typeSelector, osc2VolumeSlider = volumeSlider;
    if (i === 3) osc3TypeSelector = typeSelector, osc3VolumeSlider = volumeSlider;
  }
}

function createEffectsControlPanel() {
  const controlPanel = select("#oscillator-controls");

  const effectsDiv = createDiv().addClass("effects").parent(controlPanel);
  effectsDiv.style("display", "flex");
  effectsDiv.style("flex-direction", "column");
  effectsDiv.style("align-items", "center");
  effectsDiv.style("margin", "10px");
  effectsDiv.style("width", "90%"); /* Align with oscillator blocks */

  createElement("h3", "Effects Control").parent(effectsDiv).style("margin-bottom", "10px");

  // Slider for Distortion amount
  createElement("label", "Distortion Amount").parent(effectsDiv).style("margin-bottom", "5px");
  const distortionSlider = createSlider(0, 1, 0.4, 0.01).parent(effectsDiv);
  distortionSlider.input(() => distortion.distortion = distortionSlider.value());

  // Slider for LFO frequency
  createElement("label", "LFO Frequency").parent(effectsDiv).style("margin-bottom", "5px");
  const lfoFreqSlider = createSlider(0.1, 10, 4, 0.1).parent(effectsDiv);
  lfoFreqSlider.input(() => lfo.frequency.value = lfoFreqSlider.value());
}

function changeOscillatorType(oscillatorNumber) {
  let type;
  if (oscillatorNumber === 1) {
    type = osc1TypeSelector.value();
    let currentFrequency = osc1.frequency.value;
    osc1.dispose(); // Properly dispose of the old oscillator
    osc1 = new Tone.Oscillator(currentFrequency, type).toMaster().start();
    osc1.volume.value = osc1VolumeSlider.value();
    osc1.connect(analyzer1);
  } else if (oscillatorNumber === 2) {
    type = osc2TypeSelector.value();
    let currentFrequency = osc2.frequency.value;
    osc2.dispose(); // Properly dispose of the old oscillator
    osc2 = new Tone.Oscillator(currentFrequency, type).toMaster().start();
    osc2.volume.value = osc2VolumeSlider.value();
    osc2.connect(analyzer2);
  } else if (oscillatorNumber === 3) {
    type = osc3TypeSelector.value();
    let currentFrequency = osc3.frequency.value;
    osc3.dispose(); // Properly dispose of the old oscillator
    osc3 = new Tone.Oscillator(currentFrequency, type).toMaster().start();
    osc3.volume.value = osc3VolumeSlider.value();
    osc3.connect(analyzer3);
  }
}

function updateVolume(oscillatorNumber, value) {
  if (oscillatorNumber === 1) osc1.volume.value = value;
  if (oscillatorNumber === 2) osc2.volume.value = value;
  if (oscillatorNumber === 3) osc3.volume.value = value;
}

function updateFrequencies() {
  let canvasStartX = width / 4;
  let canvasEndX = width;
  let canvasStartY = 0;
  let canvasEndY = height;

  if (mouseX > canvasStartX && mouseX < canvasEndX && mouseY > canvasStartY && mouseY < canvasEndY) {
    // Map mouseX to a range for the root note (osc1) over two octaves
    let osc1Frequency = map(mouseX, canvasStartX, canvasEndX, 130.81, 523.25); // C3 to C5

    // Map mouseY to a range for the third (osc2) over two octaves
    let osc2Frequency = map(mouseY, canvasStartY, canvasEndY, 164.81, 659.25); // E3 to E5

    // Map Z-axis (simulated by mouseY) to a range for the fifth (osc3) one octave lower
    let osc3Frequency = map(mouseY, canvasStartY, canvasEndY, 98.00, 392.00); // G2 to G4

    // Ensure frequencies are finite numbers before assigning
    if (isFinite(osc1Frequency) && isFinite(osc2Frequency) && isFinite(osc3Frequency)) {
      osc1.frequency.value = osc1Frequency;
      osc2.frequency.value = osc2Frequency;
      osc3.frequency.value = osc3Frequency;
    } else {
      console.error("Invalid frequency values:", osc1Frequency, osc2Frequency, osc3Frequency);
    }
  }
}

function mouseMoved() {
  updateFrequencies(); // Ensure frequencies update on mouse movement
}

function mousePressed() {
  if (isOscPlaying) {
    osc1.stop();
    osc2.stop();
    osc3.stop();
  } else {
    osc1.start();
    osc2.start();
    osc3.start();
  }
  isOscPlaying = !isOscPlaying;
}

function windowResized() {
  const visualWindow = document.getElementById("visual-window");
  resizeCanvas(visualWindow.offsetWidth, visualWindow.offsetHeight);
}