// Quantum Acoustic & Particle Synthesis Engine
class AcousticEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = true;
    this.droneGain = null;
    this.droneOscs = [];
  }
  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      this.setupDrone();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }
  setupDrone() {
    this.droneGain = this.ctx.createGain();
    this.droneGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
    this.droneGain.connect(this.ctx.destination);

    // 432 Hz Pure Indian Meditative Tuning (Sa - Pa - Sa' fundamental drone)
    const baseFreqs = [216, 324, 432];
    baseFreqs.forEach(freq => {
      const osc = this.ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      osc.connect(this.droneGain);
      osc.start();
      this.droneOscs.push(osc);
    });
  }
  toggleAudioState() {
    this.init();
    this.isMuted = !this.isMuted;
    if (!this.isMuted) {
      this.droneGain.gain.exponentialRampToValueAtTime(0.18, this.ctx.currentTime + 1);
    } else {
      this.droneGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.5);
    }
    return !this.isMuted;
  }
  playChime(pitchMultiplier = 1) {
    if (this.isMuted) return;
    this.init();
    
    // Raga Bilawal Pentatonic Scale
    const scale = [216, 243, 270, 324, 364, 432, 486, 540];
    const freq = scale[Math.floor(Math.random() * scale.length)] * pitchMultiplier;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.3, this.ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 2.0);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 2.1);
  }
}

const audio = new AcousticEngine();

function toggleAudio() {
  const active = audio.toggleAudioState();
  const icon = document.getElementById("audioIcon");
  const label = document.getElementById("audioStatus");
  if (active) {
    icon.className = "fa-solid fa-volume-high text-yellow-400";
    label.textContent = "Sound: 432Hz Drone";
  } else {
    icon.className = "fa-solid fa-volume-xmark";
    label.textContent = "Sound: Muted";
  }
}

// Stage Canvas Physics
const canvas = document.getElementById("stageCanvas");
const ctx = canvas.getContext("2d");
let sparks = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

class QuantumSpark {
  constructor(x, y, vx, vy, color, size, life) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.color = color;
    this.size = size;
    this.life = life;
    this.maxLife = life;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.04; // Gravity
    this.vx *= 0.98; // Atmospheric Drag
    this.life -= 1;
  }
  draw() {
    const alpha = Math.max(0, this.life / this.maxLife);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.color;
    ctx.shadowBlur = 12;
    ctx.shadowColor = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function spawnBurst(x, y) {
  const colors = ["#f59e0b", "#fbbf24", "#fb923c", "#ef4444", "#38bdf8", "#ffffff"];
  for (let i = 0; i < 40; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 5 + 1.5;
    sparks.push(new QuantumSpark(
      x, y,
      Math.cos(angle) * speed,
      Math.sin(angle) * speed,
      colors[Math.floor(Math.random() * colors.length)],
      Math.random() * 2.5 + 1.2,
      Math.floor(Math.random() * 50 + 40)
    ));
  }
  audio.playChime();
}

window.addEventListener("pointerdown", (e) => {
  if (e.target.closest("#diyaTouchZone, header, footer")) return;
  spawnBurst(e.clientX, e.clientY);
});

function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  for (let i = sparks.length - 1; i >= 0; i--) {
    sparks[i].update();
    sparks[i].draw();
    if (sparks[i].life <= 0) {
      sparks.splice(i, 1);
    }
  }

  document.getElementById("sparkCountLabel").textContent = `${sparks.length} Active`;
  requestAnimationFrame(loop);
}
loop();

function clearCanvasSparks() {
  sparks = [];
}

// Thermal Ignition Interaction
let isLit = false;
let charge = 0;
let chargeInterval = null;
const diyaTouchZone = document.getElementById("diyaTouchZone");
const chargeFill = document.getElementById("chargeFill");
const flameElement = document.getElementById("flameElement");
const thermalAura = document.getElementById("thermalAura");
const ignitionLabel = document.getElementById("ignitionLabel");

function startCharge() {
  if (isLit) return;
  chargeInterval = setInterval(() => {
    charge = Math.min(100, charge + 8);
    chargeFill.style.width = `${charge}%`;
    if (charge >= 100) {
      igniteDiya();
      clearInterval(chargeInterval);
    }
  }, 40);
}

function endCharge() {
  clearInterval(chargeInterval);
  if (!isLit) {
    charge = 0;
    chargeFill.style.width = "0%";
  }
}

function igniteDiya() {
  isLit = true;
  flameElement.classList.add("flame-lit");
  thermalAura.classList.add("aura-lit");
  ignitionLabel.textContent = "Flame Consecrated ✨";
  ignitionLabel.classList.add("text-yellow-300");

  const rect = diyaTouchZone.getBoundingClientRect();
  spawnBurst(rect.left + rect.width / 2, rect.top + 20);
}

diyaTouchZone.addEventListener("pointerdown", startCharge);
window.addEventListener("pointerup", endCharge);
diyaTouchZone.addEventListener("click", () => {
  if (!isLit) {
    igniteDiya();
  } else {
    const rect = diyaTouchZone.getBoundingClientRect();
    spawnBurst(rect.left + rect.width / 2, rect.top + 20);
  }
});