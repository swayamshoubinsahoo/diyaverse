// Boosted Festive Audio Engine (Web Audio API with Rich Harmonics & Gain)
class SoundEngine {
  constructor() {
    this.ctx = null;
  }
  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }
  playDiyaChord() {
    this.init();
    const freqs = [261.63, 329.63, 392.00, 523.25, 659.25]; // Warm Festive Chimes
    freqs.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle"; // richer, louder than pure sine
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.07);
      
      // Boosted audible volume
      gain.gain.setValueAtTime(0.35, this.ctx.currentTime + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 2.5);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(this.ctx.currentTime + idx * 0.07);
      osc.stop(this.ctx.currentTime + 2.6);
    });
  }
  playBurstSound() {
    this.init();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(220, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
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

// Tab Routing Function
function switchTab(tabId) {
  document.querySelectorAll(".view-panel").forEach(el => el.classList.add("hidden"));
  const target = document.getElementById(`view-${tabId}`);
  if (target) target.classList.remove("hidden");

  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.classList.remove("active-tab");
    btn.classList.add("text-amber-200/70");
  });
  const activeBtn = document.getElementById(`tab-${tabId}`);
  if (activeBtn) {
    activeBtn.classList.add("active-tab");
    activeBtn.classList.remove("text-amber-200/70");
  }
  if (tabId === "rangoli") resizeRangoli();
}

// Sparkler Toggle
const sparklerBtn = document.getElementById("sparklerBtn");
const sparklerText = document.getElementById("sparklerText");
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
      particleCount: 75,
      spread: 75,
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
  if (e.target.closest("input, select, button, textarea, #diyaContainer, canvas#rangoliCanvas")) return;
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

// WALL OF LIGHT
const initialWall = [
  { name: "Aaradhya & Family", msg: "May the divine blessings of Maa Lakshmi bring eternal peace and abundance to every home.", time: "Lit with devotion" },
  { name: "Rohan & Devika", msg: "Lighting this diya for harmony, clean air, and happiness across our beautiful nation.", time: "Lit with devotion" },
  { name: "Dr. K. S. Mukherjee", msg: "Wishing health, recovery, and boundless positivity to everyone walking through tough times.", time: "Lit with devotion" },
  { name: "Sneha & Kids", msg: "Happy Diwali to our grandparents and friends everywhere! Lots of love and sweets!", time: "Lit with devotion" },
  { name: "Karan Verma", msg: "From darkness unto light — Tamaso Ma Jyotirgamaya.", time: "Lit with devotion" },
  { name: "Meera Patel", msg: "Sending golden warmth, good fortune, and lots of smiles this festive season!", time: "Lit with devotion" }
];

function renderWall() {
  const grid = document.getElementById("wallGrid");
  if (!grid) return;
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
  
  const cx = rCanvas.width / 2;
  const cy = rCanvas.height / 2;
  const dx = x - cx;
  const dy = y - cy;

  rCtx.fillStyle = rColor;
  rCtx.shadowBlur = 10;
  rCtx.shadowColor = rColor;

  for (let i = 0; i < 8; i++) {
    const angle = (Math.PI / 4) * i;
    const rx = cx + Math.cos(angle) * dx - Math.sin(angle) * dy;
    const ry = cy + Math.sin(angle) * dx + Math.cos(angle) * dy;
    rCtx.beginPath();
    rCtx.arc(rx, ry, 3.5, 0, Math.PI * 2);
    rCtx.fill();
  }
}

function drawPresetMandala(type) {
  clearRangoli();
  const cx = rCanvas.width / 2;
  const cy = rCanvas.height / 2;
  rCtx.strokeStyle = "#fbbf24";
  rCtx.lineWidth = 2;
  rCtx.shadowBlur = 8;
  rCtx.shadowColor = "#f59e0b";

  if (type === "lotus") {
    for (let i = 0; i < 8; i++) {
      rCtx.save();
      rCtx.translate(cx, cy);
      rCtx.rotate((Math.PI / 4) * i);
      rCtx.beginPath();
      rCtx.moveTo(0, 0);
      rCtx.quadraticCurveTo(45, -60, 0, -100);
      rCtx.quadraticCurveTo(-45, -60, 0, 0);
      rCtx.stroke();
      rCtx.restore();
    }
  } else {
    for (let i = 0; i < 6; i++) {
      rCtx.save();
      rCtx.translate(cx, cy);
      rCtx.rotate((Math.PI / 3) * i);
      rCtx.strokeRect(-35, -35, 70, 70);
      rCtx.restore();
    }
  }
  audio.playDiyaChord();
}

// GREETINGS LIVE PREVIEW
const recipientInput = document.getElementById("recipientInput");
const senderInput = document.getElementById("senderInput");
const messageInput = document.getElementById("messageInput");

function updatePreview() {
  document.getElementById("previewRecipient").textContent = `To ${recipientInput.value || "Friends & Family"}`;
  document.getElementById("previewSender").textContent = senderInput.value || "A Well-wisher";
  document.getElementById("previewMessage").textContent = `"${messageInput.value}"`;
}
[recipientInput, senderInput, messageInput].forEach(inp => inp && inp.addEventListener("input", updatePreview));

const aiMessages = [
  "May the light of Diwali fill your life with eternal happiness, prosperity, and radiant good health.",
  "Wishing that Goddess Lakshmi bestows eightfold wealth and spiritual calm upon your family.",
  "Spark high, conquer every new horizon, and celebrate a joyful festival of lights!"
];
let aiIdx = 0;
function cycleAiMessage() {
  aiIdx = (aiIdx + 1) % aiMessages.length;
  messageInput.value = aiMessages[aiIdx];
  updatePreview();
}

function setCardTheme(t) {
  const card = document.getElementById("greetingPreviewCard");
  document.querySelectorAll(".theme-opt").forEach(btn => btn.classList.remove("active-theme"));
  if (t === "traditional") card.style.background = "linear-gradient(to bottom, #1a0f2e, #0c051a)";
  if (t === "luxury") card.style.background = "linear-gradient(to bottom, #2b1704, #0d0601)";
  if (t === "minimal") card.style.background = "#0c0a09";
  if (t === "spiritual") card.style.background = "linear-gradient(to bottom, #14052b, #06020f)";
}

function copyShareGreetingLink() {
  const url = `${window.location.origin}${window.location.pathname}?to=${encodeURIComponent(recipientInput.value)}&from=${encodeURIComponent(senderInput.value)}`;
  navigator.clipboard.writeText(url);
  alert("Greeting link copied!");
}

function shareGreetingWhatsApp() {
  const text = encodeURIComponent(`🪔 *Shubh Deepavali ${recipientInput.value}!* ✨\n\n"${messageInput.value}"\n— With warmth, ${senderInput.value}`);
  window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
}

// PHOTO STUDIO
const photoUpload = document.getElementById("photoUpload");
const userPhotoDisplay = document.getElementById("userPhotoDisplay");
const photoPlaceholder = document.getElementById("photoPlaceholder");
const photoCaption = document.getElementById("photoCaption");
const displayPhotoCaption = document.getElementById("displayPhotoCaption");

if (photoUpload) {
  photoUpload.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        userPhotoDisplay.src = ev.target.result;
        userPhotoDisplay.classList.remove("hidden");
        photoPlaceholder.classList.add("hidden");
      };
      reader.readAsDataURL(file);
    }
  });
}
if (photoCaption) {
  photoCaption.addEventListener("input", () => {
    displayPhotoCaption.textContent = `"${photoCaption.value}"`;
  });
}
function setPhotoFrame(type) {
  const frame = document.getElementById("photoFrameCard");
  if (type === "gold") frame.className = "w-full max-w-xs rounded-3xl p-5 border-4 border-amber-400/80 bg-[#120824] shadow-2xl text-center flex flex-col items-center justify-between min-h-[340px]";
  if (type === "marigold") frame.className = "w-full max-w-xs rounded-3xl p-5 border-4 border-orange-500/80 bg-[#1a0a05] shadow-2xl text-center flex flex-col items-center justify-between min-h-[340px]";
  if (type === "diya") frame.className = "w-full max-w-xs rounded-3xl p-5 border-4 border-yellow-300 bg-[#070312] shadow-2xl text-center flex flex-col items-center justify-between min-h-[340px]";
  if (type === "velvet") frame.className = "w-full max-w-xs rounded-3xl p-5 border-4 border-rose-900 bg-[#1f030d] shadow-2xl text-center flex flex-col items-center justify-between min-h-[340px]";
}
function downloadPhotoCard() {
  alert("Framed festive card generated! Take a screenshot or press Ctrl + P to save.");
}

// SKY LANTERNS
let lanternColor = "#ff9800";
function setLanternColor(c) { lanternColor = c; }
function launchInteractiveLantern() {
  const wish = document.getElementById("lanternWish").value.trim() || "Peace and health to all";
  const name = document.getElementById("lanternName").value.trim() || "Anonymous";
  
  const lantern = document.createElement("div");
  lantern.className = "lantern";
  lantern.style.left = `${Math.random() * 85 + 5}%`;
  lantern.style.backgroundColor = lanternColor;
  lanternsContainer.appendChild(lantern);
  setTimeout(() => lantern.remove(), 16000);

  const list = document.getElementById("lanternWishesList");
  const entry = document.createElement("div");
  entry.className = "p-2 rounded-lg bg-amber-950/20 border border-amber-500/10";
  entry.innerHTML = `"${wish}" — <strong>${name}</strong>`;
  list.prepend(entry);

  audio.playDiyaChord();
  launchConfetti();
}

// MYSTERY GIFT BOX
const gifts = [
  { title: "Divine Abundance & Inner Peace", desc: "May the divine grace of Goddess Lakshmi bless your home with unshakeable contentment, radiant health, and boundless generosity." },
  { title: "Vijaya & Radiance", desc: "May fearlessness accompany every endeavor. Spark high and conquer every academic and creative ambition this year!" },
  { title: "Arogya & Harmony", desc: "May all disharmony dissolve in the warmth of holy diyas, bringing strength, laughter, and calm to your loved ones." }
];
function openMysteryGift() {
  const selected = gifts[Math.floor(Math.random() * gifts.length)];
  document.getElementById("giftTitle").textContent = selected.title;
  document.getElementById("giftDesc").textContent = `"${selected.desc}"`;
  document.getElementById("giftReveal").classList.remove("hidden");
  audio.playDiyaChord();
  launchConfetti();
}

// COUNTDOWN TIMER
function updateCountdown() {
  const target = new Date("November 8, 2026 18:00:00").getTime();
  const now = new Date().getTime();
  const diff = Math.max(0, target - now);

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const secs = Math.floor((diff % (1000 * 60)) / 1000);

  document.getElementById("timer-days").innerText = String(days).padStart(2, "0");
  document.getElementById("timer-hours").innerText = String(hours).padStart(2, "0");
  document.getElementById("timer-mins").innerText = String(mins).padStart(2, "0");
  document.getElementById("timer-secs").innerText = String(secs).padStart(2, "0");
}
setInterval(updateCountdown, 1000);
updateCountdown();

// AUDIBLE FESTIVE BGM (Rich Tanpura Drone + Sitar Plucks with Master Gain)
let bgmCtx = null;
let bgmMasterGain = null;
let isBgmPlaying = false;
let bgmLoopTimer = null;

function initBgmAudio() {
  if (!bgmCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    bgmCtx = new AudioContextClass();
    bgmMasterGain = bgmCtx.createGain();
    bgmMasterGain.gain.setValueAtTime(0.001, bgmCtx.currentTime);
    bgmMasterGain.connect(bgmCtx.destination);
  }
  if (bgmCtx.state === "suspended") {
    bgmCtx.resume();
  }
}

function playRichNote(freq, delay, duration = 3.2) {
  if (!isBgmPlaying || !bgmCtx) return;

  // Dual oscillator: triangle body + slight sawtooth brightness for authentic sitar string ring
  const osc1 = bgmCtx.createOscillator();
  const osc2 = bgmCtx.createOscillator();
  const noteGain = bgmCtx.createGain();

  osc1.type = "triangle";
  osc2.type = "sawtooth";
  osc1.frequency.setValueAtTime(freq, bgmCtx.currentTime + delay);
  osc2.frequency.setValueAtTime(freq * 2, bgmCtx.currentTime + delay); // 1st overtone

  // High, clear gain curve
  noteGain.gain.setValueAtTime(0.001, bgmCtx.currentTime + delay);
  noteGain.gain.exponentialRampToValueAtTime(0.35, bgmCtx.currentTime + delay + 0.08);
  noteGain.gain.exponentialRampToValueAtTime(0.001, bgmCtx.currentTime + delay + duration);

  osc1.connect(noteGain);
  osc2.connect(noteGain);
  noteGain.connect(bgmMasterGain);

  osc1.start(bgmCtx.currentTime + delay);
  osc2.start(bgmCtx.currentTime + delay);
  osc1.stop(bgmCtx.currentTime + delay + duration + 0.1);
  osc2.stop(bgmCtx.currentTime + delay + duration + 0.1);
}

function runBgmPattern() {
  if (!isBgmPlaying) return;
  // Meditative Indian Pentatonic Raag: Sa (216Hz), Re (243Hz), Ga (270Hz), Pa (324Hz), Dha (364Hz), Sa' (432Hz)
  const pattern = [216, 270, 324, 432, 324, 270];
  pattern.forEach((freq, idx) => {
    playRichNote(freq, idx * 0.75, 2.5);
  });
  bgmLoopTimer = setTimeout(runBgmPattern, 4800);
}

function toggleFestiveBgm() {
  initBgmAudio();

  const icon = document.getElementById("bgmIcon");
  const status = document.getElementById("bgmStatusText");
  const dot = document.getElementById("bgmEqDot");

  if (!isBgmPlaying) {
    isBgmPlaying = true;
    bgmMasterGain.gain.exponentialRampToValueAtTime(0.45, bgmCtx.currentTime + 0.5); // Louder, clearly audible
    runBgmPattern();
    if (icon) icon.className = "fa-solid fa-pause";
    if (status) status.textContent = "Playing Meditative Sitar Raga (432Hz)";
    if (dot) dot.className = "w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping";
  } else {
    isBgmPlaying = false;
    clearTimeout(bgmLoopTimer);
    bgmMasterGain.gain.exponentialRampToValueAtTime(0.0001, bgmCtx.currentTime + 0.3);
    if (icon) icon.className = "fa-solid fa-play";
    if (status) status.textContent = "Paused • Tap to Resume";
    if (dot) dot.className = "w-1.5 h-1.5 rounded-full bg-amber-500";
  }
}