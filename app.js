class SoundEngine {
  constructor() { this.ctx = null; }
  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
  }
  playDiyaChord() {
    this.init();
    const freqs = [261.63, 329.63, 392.00, 523.25, 659.25]; // Festive Pentatonic Chimes
    freqs.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.07);
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 2.2);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(this.ctx.currentTime + idx * 0.07);
      osc.stop(this.ctx.currentTime + 2.4);
    });
  }
  playBurstSound() {
    this.init();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(160, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(28, this.ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.35);
  }
}

const audio = new SoundEngine();
let isDiyaLit = false;
let sparklerMode = false;
let diyaCount = 1048;

// DOM Elements
const diyaContainer = document.getElementById("diyaContainer");
const diyaFlame = document.getElementById("diyaFlame");
const diyaGlow = document.getElementById("diyaGlow");
const lightPrompt = document.getElementById("lightDiyaPrompt");
const globalCounter = document.getElementById("globalCounter");
const sparklerModeBtn = document.getElementById("sparklerModeBtn");
const sparklerModeText = document.getElementById("sparklerModeText");
const audioToggle = document.getElementById("audioToggle");

// Diya Lighting
diyaContainer.addEventListener("click", () => {
  if (!isDiyaLit) {
    isDiyaLit = true;
    diyaFlame.classList.add("flame-active");
    diyaGlow.classList.add("glow-active");
    lightPrompt.innerText = "Diya Illuminated ✨";
    lightPrompt.classList.replace("text-amber-300", "text-yellow-200");
    audio.playDiyaChord();
    launchConfetti();
    diyaCount++;
    globalCounter.textContent = diyaCount.toLocaleString();
  } else {
    triggerBurstEffect();
  }
});

// Audio chime trigger button
audioToggle.addEventListener("click", () => {
  audio.playDiyaChord();
});

// Sparkler Trail toggle
sparklerModeBtn.addEventListener("click", () => {
  sparklerMode = !sparklerMode;
  if (sparklerMode) {
    sparklerModeBtn.classList.replace("bg-amber-950/40", "bg-amber-500/30");
    sparklerModeBtn.classList.replace("border-amber-500/40", "border-yellow-400");
    sparklerModeText.textContent = "Sparkler Trail: ON ✨";
  } else {
    sparklerModeBtn.classList.replace("bg-amber-500/30", "bg-amber-950/40");
    sparklerModeBtn.classList.replace("border-yellow-400", "border-amber-500/40");
    sparklerModeText.textContent = "Sparkler Trail: OFF";
  }
});

function launchConfetti() {
  if (typeof confetti === "function") {
    confetti({
      particleCount: 85,
      spread: 75,
      origin: { y: 0.65 },
      colors: ["#FFD700", "#FF8C00", "#FF4500", "#FFF"]
    });
  }
}

function triggerBurstEffect() {
  audio.playBurstSound();
  if (typeof confetti === "function") {
    confetti({
      particleCount: 35,
      spread: 60,
      origin: { y: 0.65 },
      colors: ["#FFD700", "#FFA500"]
    });
  }
}

// Background Sky Lanterns generator
const lanternsContainer = document.getElementById("lanternsContainer");
function spawnLantern() {
  const lantern = document.createElement("div");
  lantern.className = "lantern";
  lantern.style.left = `${Math.random() * 95}%`;
  lantern.style.animationDuration = `${10 + Math.random() * 8}s`;
  lantern.style.opacity = `${0.6 + Math.random() * 0.4}`;
  lanternsContainer.appendChild(lantern);
  setTimeout(() => lantern.remove(), 18000);
}
setInterval(spawnLantern, 2200);
for (let i = 0; i < 6; i++) spawnLantern();

// Canvas Fireworks & Sparkler Particle Physics
const canvas = document.getElementById("fireworksCanvas");
const ctx = canvas.getContext("2d");
let particles = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

window.addEventListener("pointerdown", (e) => {
  if (e.target.closest("input, select, button, #diyaContainer")) return;
  spawnFirework(e.clientX, e.clientY);
  audio.playBurstSound();
});

window.addEventListener("pointermove", (e) => {
  if (sparklerMode) {
    for (let i = 0; i < 3; i++) {
      particles.push({
        x: e.clientX,
        y: e.clientY,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        alpha: 1,
        color: Math.random() > 0.5 ? "#FFD700" : "#FF8C00",
        size: Math.random() * 2 + 1
      });
    }
  }
});

function spawnFirework(x, y) {
  const colors = ["#f59e0b", "#fbbf24", "#fb923c", "#ef4444", "#38bdf8", "#34d399"];
  for (let i = 0; i < 28; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 4.5 + 1.2;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      alpha: 1,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 2.4 + 1
    });
  }
}

function renderParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach((p, index) => {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.035; // gentle gravity
    p.alpha -= 0.015;
    if (p.alpha <= 0) {
      particles.splice(index, 1);
    } else {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  });
  requestAnimationFrame(renderParticles);
}
renderParticles();

// URL Query Check
function checkUrlGreeting() {
  const params = new URLSearchParams(window.location.search);
  const recipient = params.get("to");
  const sender = params.get("from");
  const wish = params.get("wish");

  if (recipient) {
    document.getElementById("personalizedBanner").classList.remove("hidden");
    document.getElementById("recipientNameDisplay").innerText = recipient;
    document.getElementById("customWishDisplay").innerText = wish
      ? `"${decodeURIComponent(wish)}" — With warmth, ${sender || "A Well-wisher"}`
      : `Wishing you infinite joy, radiant health, and boundless prosperity this Deepavali! — ${sender || "A Well-wisher"}`;
  }
}
checkUrlGreeting();

// Generator Logic
const generateBtn = document.getElementById("generateBtn");
const outputCard = document.getElementById("outputCard");
const generatedWish = document.getElementById("generatedWish");
const copyShareLink = document.getElementById("copyShareLink");
const whatsappShare = document.getElementById("whatsappShare");

generateBtn.addEventListener("click", () => {
  const recipient = document.getElementById("recipientInput").value.trim() || "Friend";
  const sender = document.getElementById("senderInput").value.trim() || "A Well-wisher";
  const tone = document.getElementById("toneSelect").value;

  generateBtn.disabled = true;
  generateBtn.innerHTML = `<i class="fa-solid fa-spinner animate-spin"></i> Generating...`;

  const wishes = {
    warm: [
      `May the golden glow of this Diya bring immense laughter, harmony, and peace into your home. Shubh Deepavali, ${recipient}!`,
      `Wishing you a festival of lights filled with warm moments, delicious feasts, and cherished memories with loved ones.`
    ],
    spiritual: [
      `Asato ma sadgamaya, tamaso ma jyotirgamaya. May the holy light illuminate your life with divine wisdom. Happy Deepavali, ${recipient}!`,
      `May Goddess Lakshmi and Lord Ganesha shower your household with unending prosperity, health, and spiritual calm.`
    ],
    energetic: [
      `Light, spark, and conquer! Wishing you high energy, explosive success, and an electrifying year ahead! Happy Diwali, ${recipient}!`
    ]
  };

  const selectedList = wishes[tone] || wishes.warm;
  const selectedWish = selectedList[Math.floor(Math.random() * selectedList.length)];

  setTimeout(() => {
    generatedWish.textContent = `"${selectedWish}" — ${sender}`;
    outputCard.classList.remove("hidden");
    generateBtn.disabled = false;
    generateBtn.innerHTML = `<i class="fa-solid fa-sparkles"></i> Generate Custom Blessing`;

    const shareUrl = `${window.location.origin}${window.location.pathname}?to=${encodeURIComponent(recipient)}&from=${encodeURIComponent(sender)}&wish=${encodeURIComponent(selectedWish)}`;

    copyShareLink.onclick = () => {
      navigator.clipboard.writeText(shareUrl);
      copyShareLink.innerHTML = `<i class="fa-solid fa-check text-green-400"></i> Copied!`;
      setTimeout(() => (copyShareLink.innerHTML = `<i class="fa-solid fa-link"></i> Copy Link`), 2000);
    };

    whatsappShare.onclick = () => {
      const text = encodeURIComponent(`🪔 *Happy Diwali ${recipient}!* ✨\n\nI lit a digital Diya for you and sent a festive blessing:\n${shareUrl}`);
      window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
    };
  }, 400);
});