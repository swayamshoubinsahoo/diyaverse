// Sound Engine with Web Audio API
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
    const freqs = [261.63, 329.63, 392.00, 523.25, 659.25];
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

// Tab Routing
function switchTab(tabId) {
  document.querySelectorAll(".view-panel").forEach(el => el.classList.add("hidden"));
  const target = document.getElementById(`view-${tabId}`);
  if (target) target.classList.remove("hidden");

  document.querySelectorAll(".nav-tab").forEach(btn => {
    btn.classList.remove("active-tab");
    btn.classList.add("text-amber-300/70");
  });
  const activeBtn = document.getElementById(`tab-${tabId}`);
  if (activeBtn) {
    activeBtn.classList.add("active-tab");
    activeBtn.classList.remove("text-amber-300/70");
  }
  if (tabId === 'rangoli') resizeRangoli();
}

// Audio Button
document.getElementById("audioToggle").addEventListener("click", () => {
  audio.playDiyaChord();
});

// Sparkler Toggle
const sparklerBtn = document.getElementById("sparklerModeBtn");
const sparklerText = document.getElementById("sparklerModeText");
sparklerBtn.addEventListener("click", () => {
  sparklerMode = !sparklerMode;
  sparklerText.textContent = sparklerMode ? "Sparklers: ON ✨" : "Sparklers: OFF";
  sparklerBtn.classList.toggle("border-yellow-400", sparklerMode);
});

// Diya Lighting
function kindleMainDiya() {
  const flame = document.getElementById("diyaFlame");
  const glow = document.getElementById("diyaGlow");
  const prompt = document.getElementById("lightDiyaPrompt");

  if (!isDiyaLit) {
    isDiyaLit = true;
    flame.classList.add("flame-active");
    glow.classList.add("glow-active");
    prompt.innerText = "Diya Consecrated ✨";
    prompt.classList.replace("text-amber-300", "text-yellow-200");
    audio.playDiyaChord();
    launchConfetti();
  } else {
    audio.playBurstSound();
    launchConfetti();
  }
}

function launchConfetti() {
  if (typeof confetti === "function") {
    confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.65 },
      colors: ["#FFD700", "#FF8C00", "#FF4500", "#FFF"]
    });
  }
}

// Background Sky Lanterns
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
setInterval(spawnLantern, 2400);
for (let i = 0; i < 6; i++) spawnLantern();

// Fireworks Canvas
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
  if (e.target.closest("input, select, button, #diyaContainer, canvas#rangoliCanvas")) return;
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
  for (let i = 0; i < 26; i++) {
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
    p.vy += 0.035;
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

// WALL OF LIGHT (Cards Array)
const initialWall = [
  { name: "Aaradhya & Family", msg: "May the divine blessings of Maa Lakshmi bring eternal peace and abundance to every home.", time: "Lit with devotion" },
  { name: "Rohan & Devika", msg: "Lighting this diya for harmony, clean air, and happiness across our beautiful nation.", time: "Lit with devotion" },
  { name: "Dr. K. S. Mukherjee", msg: "Wishing health, recovery, and boundless positivity to everyone walking through tough times.", time: "Lit with devotion" },
  { name: "Sneha & Kids", msg: "Happy Diwali to our grandparents and friends everywhere! Lots of love and sweets!", time: "Lit with devotion" },
  { name: "Karan Verma", msg: "From darkness unto light — Tamaso Ma Jyotirgamaya.", time: "Lit with devotion" },
  { name: "Meera Patil", msg: "Sending golden warmth, good fortune, and lots of smiles this festive season!", time: "Lit with devotion" }
];

function renderWall() {
  const grid = document.getElementById("wallGrid");
  grid.innerHTML = "";
  initialWall.forEach(item => {
    const card = document.createElement("div");
    card.className = "bg-stone-900/60 border border-amber-500/30 rounded-2xl p-5 backdrop-blur-md text-left flex flex-col justify-between hover:border-amber-400 transition shadow-lg group";
    card.innerHTML = `
      <div>
        <div class="flex items-center gap-2 mb-3">
          <div class="w-7 h-7 rounded-full bg-amber-500/20 border border-yellow-400/40 flex items-center justify-center text-sm">🪔</div>
          <h4 class="font-bold text-amber-200 text-sm">${item.name}</h4>
        </div>
        <p class="text-xs text-amber-100/90 italic leading-relaxed">"${item.msg}"</p>
      </div>
      <div class="mt-4 pt-3 border-t border-amber-500/10 text-[10px] text-amber-300/60 flex items-center justify-between font-mono">
        <span>${item.time}</span>
        <span class="text-yellow-400">✨ Illuminated</span>
      </div>
    `;
    grid.appendChild(card);
  });
}
renderWall();

function openDedicateModal() {
  document.getElementById("dedicateModal").classList.remove("hidden");
}
function closeDedicateModal() {
  document.getElementById("dedicateModal").classList.add("hidden");
}
function submitDedication() {
  const name = document.getElementById("dedicateName").value.trim() || "A Well-wisher";
  const msg = document.getElementById("dedicateMsg").value.trim() || "May light illuminate every dark corner with peace and prosperity.";
  initialWall.unshift({ name, msg, time: "Lit just now" });
  renderWall();
  closeDedicateModal();
  audio.playDiyaChord();
  launchConfetti();
}

// RANGOLI STUDIO
const rCanvas = document.getElementById("rangoliCanvas");
const rCtx = rCanvas.getContext("2d");
let rColor = "#fbbf24";
let isDrawing = false;

function resizeRangoli() {
  rCanvas.width = rCanvas.parentElement.clientWidth;
  rCanvas.height = rCanvas.parentElement.clientHeight;
}
window.addEventListener("resize", resizeRangoli);

function setRangoliColor(c) { rColor = c; }
function clearRangoli() {
  rCtx.clearRect(0, 0, rCanvas.width, rCanvas.height);
}

rCanvas.addEventListener("pointerdown", (e) => {
  isDrawing = true;
  drawRangoli(e);
});
rCanvas.addEventListener("pointerup", () => isDrawing = false);
rCanvas.addEventListener("pointermove", (e) => {
  if (isDrawing) drawRangoli(e);
});

function drawRangoli(e) {
  const rect = rCanvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  // Radial Symmetrical Drawing
  const cx = rCanvas.width / 2;
  const cy = rCanvas.height / 2;
  const dx = x - cx;
  const dy = y - cy;

  rCtx.fillStyle = rColor;
  rCtx.shadowBlur = 10;
  rCtx.shadowColor = rColor;

  // 6-axis symmetry
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    const rx = cx + Math.cos(angle) * dx - Math.sin(angle) * dy;
    const ry = cy + Math.sin(angle) * dx + Math.cos(angle) * dy;
    rCtx.beginPath();
    rCtx.arc(rx, ry, 3.5, 0, Math.PI * 2);
    rCtx.fill();
  }
}

// FESTIVE SWEETS POLL
let kaju = 842;
let soan = 619;
function voteSweet(type) {
  if (type === 'kaju') kaju++;
  if (type === 'soan') soan++;
  document.getElementById("kajuVotes").textContent = `${kaju} votes`;
  document.getElementById("soanVotes").textContent = `${soan} votes`;
  document.getElementById("voteBanner").classList.remove("hidden");
  audio.playDiyaChord();
}

// GREETINGS & URL ENGINE
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
      const text = encodeURIComponent(`🪔 *Happy Diwali ${recipient}!* ✨\n\nI dedicated a digital Diya for you on DiyaVerse:\n${shareUrl}`);
      window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
    };
  }, 350);
});

// Check URL Params
function checkUrlGreeting() {
  const params = new URLSearchParams(window.location.search);
  const recipient = params.get("to");
  const sender = params.get("from");
  const wish = params.get("wish");

  if (recipient) {
    switchTab('greetings');
    document.getElementById("personalizedBanner").classList.remove("hidden");
    document.getElementById("recipientNameDisplay").innerText = recipient;
    document.getElementById("customWishDisplay").innerText = wish
      ? `"${decodeURIComponent(wish)}" — With warmth, ${sender || "A Well-wisher"}`
      : `Wishing you infinite joy, radiant health, and boundless prosperity this Deepavali! — ${sender || "A Well-wisher"}`;
  }
}
checkUrlGreeting();

// COUNTDOWN TIMER
function updateCountdown() {
  const target = new Date("November 8, 2026 18:00:00").getTime();
  const now = new Date().getTime();
  const diff = Math.max(0, target - now);

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const secs = Math.floor((diff % (1000 * 60)) / 1000);

  document.getElementById("timer-days").innerText = String(days).padStart(2, '0');
  document.getElementById("timer-hours").innerText = String(hours).padStart(2, '0');
  document.getElementById("timer-mins").innerText = String(mins).padStart(2, '0');
  document.getElementById("timer-secs").innerText = String(secs).padStart(2, '0');
}
setInterval(updateCountdown, 1000);
updateCountdown();