// Try "triangle", "square", and "sawtooth"
let osc1 = new Tone.Oscillator(110, "sine").toMaster().start();
osc1.volume.value = -12;
analyzer1 = new Tone.Waveform(1024);
osc1.connect(analyzer1);

let osc2 = new Tone.Oscillator(220, "sine").toMaster().start();
osc2.volume.value = -18;
analyzer2 = new Tone.Waveform(1024);
osc2.connect(analyzer2);

function setup() {
  createCanvas(windowWidth, windowHeight);

  analyzer2 = new Tone.Waveform(1024);
  osc2.connect(analyzer2);

  // Create dropdown for osc1 waveform type
  osc1TypeSelector = createSelect();
  osc1TypeSelector.position(10, 10);
  osc1TypeSelector.option('sine');
  osc1TypeSelector.option('square');
  osc1TypeSelector.option('triangle');
  osc1TypeSelector.option('sawtooth');
  osc1TypeSelector.changed(() => changeOscillatorType(1));

  // Create dropdown for osc2 waveform type
  osc2TypeSelector = createSelect();
  osc2TypeSelector.position(10, 40);
  osc2TypeSelector.option('sine');
  osc2TypeSelector.option('square');
  osc2TypeSelector.option('triangle');
  osc2TypeSelector.option('sawtooth');
  osc2TypeSelector.changed(() => changeOscillatorType(2));

}

function changeOscillatorType(oscillatorNumber) {
  let type;
  if (oscillatorNumber === 1) {
    type = osc1TypeSelector.value();
    osc1.stop();
    osc1 = new Tone.Oscillator(osc1.frequency.value, type).toMaster().start();
    osc1.volume.value = -12;
    osc1.connect(analyzer1);
  } else if (oscillatorNumber === 2) {
    type = osc2TypeSelector.value();
    osc2.stop();
    osc2 = new Tone.Oscillator(osc2.frequency.value, type).toMaster().start();
    osc2.volume.value = -12;
    osc2.connect(analyzer2);
  }
}

function draw() {
  background(0);

  let waveform1 = analyzer1.getValue();
  let waveform2 = analyzer2.getValue();

   // Define the square dimensions
   let squareSize = min(width, height) * 2; // 80% of the smaller dimension
   let squareX = (width - squareSize) / 2;   // X-coordinate of the square's top-left corner
   let squareY = (height - squareSize) / 2;  // Y-coordinate of the square's top-left corner

  strokeWeight(2);
  noFill();
  stroke(255);
  beginShape();
  for (let i = 0; i < waveform1.length; i++) {
    let x = map(waveform1[i], -1, 1, squareX, squareX + squareSize);
    let y = map(waveform2[i], -1, 1, squareY + squareSize, squareY);
    vertex(x, y);
  }
  endShape();
  updateFrequency();
}

function updateFrequency() {  
  osc1.frequency.rampTo(map(mouseX, 0, width, 55, 440));
  osc2.frequency.rampTo(map(mouseY, height, 0, 55, 440));
}
// Resize canvas when the window is resized
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// Start
function mouseClicked() {
  if (Tone.context.state !== 'running') {
    Tone.context.resume();
  }

  Tone.Transport.start();
  updateFrequency();
}