class SoundEngine {
  constructor() { this.ctx = null; }
  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    }
  }
  playDiyaLightChord() {
    this.init();
    const freqs = [261.63, 329.63, 392.0, 523.25];
    freqs.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.08);
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 1.8);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(this.ctx.currentTime + idx * 0.08);
      osc.stop(this.ctx.currentTime + 2.0);
    });
  }
  playBurstSound() {
    this.init();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.3);
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
let diyaCount = 1024;

const diyaContainer = document.getElementById("diyaContainer");
const diyaFlame = document.getElementById("diyaFlame");
const diyaGlow = document.getElementById("diyaGlow");
const lightPrompt = document.getElementById("lightDiyaPrompt");
const globalCounter = document.getElementById("globalCounter");

diyaContainer.addEventListener("click", () => {
  if (!isDiyaLit) {
    isDiyaLit = true;
    diyaFlame.classList.add("flame-active");
    diyaGlow.classList.add("glow-active");
    lightPrompt.innerText = "Diya Illuminated ✨";
    lightPrompt.classList.replace("text-amber-300", "text-yellow-200");
    audio.playDiyaLightChord();
    launchConfetti();
    diyaCount++;
    globalCounter.textContent = diyaCount.toLocaleString();
  } else {
    triggerBurstEffect();
  }
});

function launchConfetti() {
  if (typeof confetti === "function") {
    confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.65 },
      colors: ["#FFD700", "#FF8C00", "#FF4500", "#FFFFFF"]
    });
  }
}

function triggerBurstEffect() {
  audio.playBurstSound();
  if (typeof confetti === "function") {
    confetti({
      particleCount: 30,
      spread: 60,
      origin: { y: 0.65 },
      colors: ["#FFD700", "#FFA500"]
    });
  }
}

const canvas = document.getElementById("fireworksCanvas");
const ctx = canvas.getContext("2d");
let particles = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

window.addEventListener("click", (e) => {
  if (e.target.closest("input, select, button, #diyaContainer")) return;
  spawnFirework(e.clientX, e.clientY);
  audio.playBurstSound();
});

function spawnFirework(x, y) {
  const colors = ["#f59e0b", "#fbbf24", "#fb923c", "#ef4444", "#38bdf8"];
  for (let i = 0; i < 24; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 4 + 1.2;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      alpha: 1,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 2.2 + 1
    });
  }
}

function renderParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach((p, index) => {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.04;
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

const generateBtn = document.getElementById("generateBtn");
const outputCard = document.getElementById("outputCard");
const generatedWish = document.getElementById("generatedWish");
const copyShareLink = document.getElementById("copyShareLink");
const whatsappShare = document.getElementById("whatsappShare");

generateBtn.addEventListener("click", () => {
  const recipient = document.getElementById("recipientInput").value.trim() || "Friend";
  const sender = document.getElementById("senderInput").value.trim() || "Swayam";
  const tone = document.getElementById("toneSelect").value;

  generateBtn.disabled = true;
  generateBtn.innerHTML = `<i class="fa-solid fa-spinner animate-spin"></i> Generating...`;

  const wishes = {
    warm: [
      `May the golden light of the sacred Diya fill your home with laughter, affection, and unending peace. Happy Deepavali, ${recipient}!`,
      `Wishing you and your family a festive season overflowing with sweet memories, good health, and radiant joy.`
    ],
    spiritual: [
      `Asato ma sadgamaya, tamaso ma jyotirgamaya. May the holy light lead your life from darkness to enlightenment. Shubh Deepavali, ${recipient}!`,
      `May Goddess Lakshmi and Lord Ganesha bless you with boundless wisdom, prosperity, and spiritual calm this Diwali.`
    ],
    energetic: [
      `Boom! Here is to dazzling fireworks, delicious sweets, and a supercharged year full of high achievements! Happy Diwali, ${recipient}!`
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
      const text = encodeURIComponent(`🪔 *Happy Diwali ${recipient}!* ✨\n\nI lit a digital Diya for you and sent a festive wish:\n${shareUrl}`);
      window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
    };
  }, 500);
});