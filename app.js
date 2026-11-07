// Vedic 432Hz Drone & Pentatonic Synthesizer Engine
class VedicSoundEngine {
  constructor() {
    this.ctx = null;
    this.droneGain = null;
    this.isDroneActive = false;
  }
  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
  }
  toggleVedicDrone() {
    this.init();
    if (this.isDroneActive) {
      this.droneGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.8);
      this.isDroneActive = false;
      return false;
    }
    // 432 Hz Healing Harmonics (Sa-Pa Tanpura interval: 216Hz, 324Hz, 432Hz)
    const fundamental = 216;
    const droneOscs = [fundamental, fundamental * 1.5, fundamental * 2];
    this.droneGain = this.ctx.createGain();
    this.droneGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    this.droneGain.gain.exponentialRampToValueAtTime(0.08, this.ctx.currentTime + 1.2);
    this.droneGain.connect(this.ctx.destination);

    droneOscs.forEach(freq => {
      const osc = this.ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      osc.connect(this.droneGain);
      osc.start();
    });
    this.isDroneActive = true;
    return true;
  }
  playDiyaChimes() {
    this.init();
    const freqs = [288, 360, 432, 576, 720]; // Classical Indian Pentatonic intervals based on 432Hz
    freqs.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.08);
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 2.4);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(this.ctx.currentTime + idx * 0.08);
      osc.stop(this.ctx.currentTime + 2.5);
    });
  }
  playStarSpark() {
    this.init();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(864, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(432, this.ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.07, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.25);
  }
}

const audio = new VedicSoundEngine();
let isDiyaLit = false;

// Audio Controls
const tanpuraBtn = document.getElementById("tanpuraBtn");
tanpuraBtn.addEventListener("click", () => {
  const active = audio.toggleVedicDrone();
  tanpuraBtn.classList.toggle("border-amber-400", active);
  tanpuraBtn.classList.toggle("bg-amber-500/30", active);
});

// Interactive Diya
const diyaContainer = document.getElementById("diyaContainer");
const diyaFlame = document.getElementById("diyaFlame");
const diyaAura = document.getElementById("diyaAura");
const diyaBadge = document.getElementById("diyaBadge");

diyaContainer.addEventListener("click", () => {
  if (!isDiyaLit) {
    isDiyaLit = true;
    diyaFlame.classList.add("flame-active");
    diyaAura.classList.add("aura-active");
    diyaBadge.innerText = "Akhand Jyoti Consecrated ✨";
    diyaBadge.classList.replace("text-amber-300", "text-yellow-200");
    audio.playDiyaChimes();
    launchConfetti();
  } else {
    audio.playStarSpark();
    launchConfetti();
  }
});

function launchConfetti() {
  if (typeof confetti === "function") {
    confetti({
      particleCount: 60,
      spread: 75,
      origin: { y: 0.65 },
      colors: ["#FFD700", "#FF8C00", "#FF4500", "#FFF"]
    });
  }
}

// Sky Lantern Spawner
const lanternsContainer = document.getElementById("lanternsContainer");
function spawnLantern() {
  const lantern = document.createElement("div");
  lantern.className = "lantern";
  lantern.style.left = `${Math.random() * 95}%`;
  lantern.style.animationDuration = `${11 + Math.random() * 8}s`;
  lantern.style.opacity = `${0.6 + Math.random() * 0.4}`;
  lanternsContainer.appendChild(lantern);
  setTimeout(() => lantern.remove(), 18000);
}
setInterval(spawnLantern, 2500);
for (let i = 0; i < 6; i++) spawnLantern();

// Cosmic Nakshatra Star-Canvas Physics
const canvas = document.getElementById("cosmicCanvas");
const ctx = canvas.getContext("2d");
let stars = [];
let constellations = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

window.addEventListener("pointerdown", (e) => {
  if (e.target.closest("input, select, button, #diyaContainer")) return;
  addNakshatraStar(e.clientX, e.clientY);
  audio.playStarSpark();
});

function addNakshatraStar(x, y) {
  const star = { x, y, radius: Math.random() * 2.5 + 2, alpha: 1 };
  stars.push(star);
  if (stars.length > 1) {
    const prev = stars[stars.length - 2];
    const dist = Math.hypot(prev.x - x, prev.y - y);
    if (dist < 260) constellations.push({ x1: prev.x, y1: prev.y, x2: x, y2: y, alpha: 1 });
  }
}

function renderCosmicScene() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw Constellation Lines
  constellations.forEach((c, idx) => {
    ctx.strokeStyle = `rgba(251, 191, 36, ${c.alpha * 0.45})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(c.x1, c.y1);
    ctx.lineTo(c.x2, c.y2);
    ctx.stroke();
    c.alpha -= 0.003;
    if (c.alpha <= 0) constellations.splice(idx, 1);
  });

  // Draw Stars
  stars.forEach((s, idx) => {
    ctx.save();
    ctx.fillStyle = `rgba(254, 240, 138, ${s.alpha})`;
    ctx.shadowBlur = 12;
    ctx.shadowColor = "#f59e0b";
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    s.alpha -= 0.003;
    if (s.alpha <= 0) stars.splice(idx, 1);
  });

  requestAnimationFrame(renderCosmicScene);
}
renderCosmicScene();

// Generator Engine
const generateBtn = document.getElementById("generateBtn");
const outputCard = document.getElementById("outputCard");
const shlokaSnippet = document.getElementById("shlokaSnippet");
const generatedWish = document.getElementById("generatedWish");
const copyShareLink = document.getElementById("copyShareLink");
const whatsappShare = document.getElementById("whatsappShare");

const archetypes = {
  mahalakshmi: {
    shloka: "॥ ॐ श्रीं ह्रीं क्लीं त्रिभुवन महालक्ष्म्यै अस्मांक दारिद्र्य नाशय ॐ नमः ॥",
    blessings: [
      "May Goddess Mahalakshmi enter your home with eightfold blessings of prosperity, wisdom, and eternal spiritual calm.",
      "Lighting this consecrated Diya for boundless abundance and fruitful new beginnings in every venture you undertake."
    ]
  },
  shanti: {
    shloka: "॥ असतो मा सद्गमय । तमसो मा ज्योतिर्गमय । मृत्योर्मा अमृतं गमय ॥",
    blessings: [
      "From untruth lead us to truth, from darkness lead us to light. May this sacred flame bring enduring health and peace to your family.",
      "May all disharmony dissolve in the warmth of this holy Deepavali, filling your days with quiet strength and contentment."
    ]
  },
  vijaya: {
    shloka: "॥ ॐ सर्वमंगल मांगल्ये शिवे सर्वार्थ साधिके । शरण्ये त्र्यम्बके गौरि नारायणि नमोऽस्तु ते ॥",
    blessings: [
      "May radiant victory and fearless energy accompany every endeavor this year. Spark high, conquer every horizon, and illuminate greatness!",
      "A celebration of unyielding courage and joy. Wishing you supreme triumph in all your studies, projects, and ambitions."
    ]
  }
};

generateBtn.addEventListener("click", () => {
  const recipient = document.getElementById("recipientInput").value.trim() || "Cherished Soul";
  const sender = document.getElementById("senderInput").value.trim() || "A Well-wisher";
  const tone = document.getElementById("toneSelect").value;

  generateBtn.disabled = true;
  generateBtn.innerHTML = `<i class="fa-solid fa-spinner animate-spin"></i> Consecrating...`;

  const item = archetypes[tone] || archetypes.mahalakshmi;
  const wish = item.blessings[Math.floor(Math.random() * item.blessings.length)];

  setTimeout(() => {
    shlokaSnippet.innerText = item.shloka;
    generatedWish.innerText = `"${wish}" — With reverence, ${sender}`;
    outputCard.classList.remove("hidden");
    generateBtn.disabled = false;
    generateBtn.innerHTML = `<i class="fa-solid fa-sparkles"></i> Consecrate & Generate Blessing`;

    const shareUrl = `${window.location.origin}${window.location.pathname}?to=${encodeURIComponent(recipient)}&from=${encodeURIComponent(sender)}&wish=${encodeURIComponent(wish)}`;

    copyShareLink.onclick = () => {
      navigator.clipboard.writeText(shareUrl);
      copyShareLink.innerHTML = `<i class="fa-solid fa-check text-green-400"></i> Copied!`;
      setTimeout(() => (copyShareLink.innerHTML = `<i class="fa-solid fa-link"></i> Copy Sacred Link`), 2000);
    };

    whatsappShare.onclick = () => {
      const text = encodeURIComponent(`🪔 *Shubh Deepavali ${recipient}!* ✨\n\nI consecrated an Akhand Diya for you on DiyaVerse:\n${shareUrl}`);
      window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
    };
  }, 400);
});

// Check URL Params
function checkUrlGreeting() {
  const params = new URLSearchParams(window.location.search);
  const recipient = params.get("to");
  const sender = params.get("from");
  const wish = params.get("wish");

  if (recipient) {
    document.getElementById("personalizedBanner").classList.remove("hidden");
    document.getElementById("recipientNameDisplay").innerText = recipient;
    document.getElementById("customWishDisplay").innerText = wish
      ? `"${decodeURIComponent(wish)}" — Consecrated by ${sender || "A Well-wisher"}`
      : `May eternal auspicious light illuminate your path with wisdom and prosperity! — ${sender || "A Well-wisher"}`;
  }
}
checkUrlGreeting();