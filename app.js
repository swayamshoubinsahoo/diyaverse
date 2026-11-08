// AURA-HARMONIC BANSURI FLUTE & SITAR AUDIO ENGINE
// Uses 100% pure native Web Audio API with a resonant Low-Pass filter to model an acoustic bamboo flute
let audioCtx = null;
let masterGainNode = null;
let fluteFilter = null;
let isFestiveMusicPlaying = false;
let musicLoopTimer = null;
let sparklerMode = false;

function initFestiveAudio() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContextClass();

    masterGainNode = audioCtx.createGain();
    masterGainNode.gain.setValueAtTime(0.001, audioCtx.currentTime);

    // Acoustic Low-Pass Filter: strips any harsh buzzing edge
    fluteFilter = audioCtx.createBiquadFilter();
    fluteFilter.type = "lowpass";
    fluteFilter.frequency.setValueAtTime(800, audioCtx.currentTime); // Soft, warm acoustic cutoff
    fluteFilter.Q.setValueAtTime(3.0, audioCtx.currentTime); // Warm bamboo resonance

    masterGainNode.connect(fluteFilter);
    fluteFilter.connect(audioCtx.destination);
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
}

function playAcousticFluteTone(freq, delay, duration = 1.6) {
  if (!isFestiveMusicPlaying || !audioCtx) return;

  const osc = audioCtx.createOscillator();
  const noteGain = audioCtx.createGain();

  // Pure sine wave routed through the warm acoustic filter
  osc.type = "sine";
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime + delay);

  // Soft envelope attack and gentle acoustic decay
  noteGain.gain.setValueAtTime(0.001, audioCtx.currentTime + delay);
  noteGain.gain.exponentialRampToValueAtTime(0.35, audioCtx.currentTime + delay + 0.18);
  noteGain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + delay + duration);

  osc.connect(noteGain);
  noteGain.connect(masterGainNode);

  osc.start(audioCtx.currentTime + delay);
  osc.stop(audioCtx.currentTime + delay + duration + 0.1);
}

function runMelodicCycle() {
  if (!isFestiveMusicPlaying) return;

  // Meditative Indian Raga Bilawal / Yaman notes (Sa, Re, Ga, Pa, Dha, Sa')
  const ragaPitches = [
    261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 440.00, 392.00, 329.63
  ];

  ragaPitches.forEach((pitch, i) => {
    playAcousticFluteTone(pitch, i * 0.6, 1.4);
  });

  musicLoopTimer = setTimeout(runMelodicCycle, 5800);
}

function toggleFestiveSoundtrack() {
  initFestiveAudio();
  const icon = document.getElementById("musicIcon");
  const text = document.getElementById("musicText");

  if (!isFestiveMusicPlaying) {
    isFestiveMusicPlaying = true;
    masterGainNode.gain.exponentialRampToValueAtTime(0.55, audioCtx.currentTime + 0.5);
    runMelodicCycle();
    if (icon) icon.className = "fa-solid fa-pause";
    if (text) text.textContent = "Music: Playing 🎵";
  } else {
    isFestiveMusicPlaying = false;
    clearTimeout(musicLoopTimer);
    masterGainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.3);
    if (icon) icon.className = "fa-solid fa-play";
    if (text) text.textContent = "Diwali Flute";
  }
}

// Sparkler Toggle
function toggleSparklerTrail() {
  sparklerMode = !sparklerMode;
  document.getElementById("sparklerLabel").textContent = sparklerMode ? "Sparklers: ON ✨" : "Sparklers";
  document.getElementById("sparklerModeBtn").classList.toggle("border-yellow-400", sparklerMode);
}

// Navigation Switching
function switchNav(id) {
  document.querySelectorAll(".page-panel").forEach(p => p.classList.add("hidden"));
  const target = document.getElementById(`panel-${id}`);
  if (target) target.classList.remove("hidden");

  document.querySelectorAll(".nav-pill").forEach(btn => {
    btn.classList.remove("active-pill");
    btn.classList.add("text-amber-200/70");
  });
  const activeBtn = document.getElementById(`btn-${id}`);
  if (activeBtn) {
    activeBtn.classList.add("active-pill");
    activeBtn.classList.remove("text-amber-200/70");
  }

  if (id === "mandala") renderMandala("sriyantra");
}

// PANCH TATTVA DIYA
let currentTattva = "agni";
const tattvaStyles = {
  agni: {
    bg: "linear-gradient(to top, #dc2626, #fbbf24, #fef08a)",
    glow: "rgba(245, 158, 11, 0.5)",
    shadow: "#ff9900",
    label: "Agni Consecrated 🔥"
  },
  vayu: {
    bg: "linear-gradient(to top, #0e7490, #2dd4bf, #ffffff)",
    glow: "rgba(20, 184, 166, 0.5)",
    shadow: "#06b6d4",
    label: "Vayu Consecrated 💨"
  },
  jal: {
    bg: "linear-gradient(to top, #1d4ed8, #38bdf8, #ffffff)",
    glow: "rgba(14, 165, 233, 0.5)",
    shadow: "#38bdf8",
    label: "Jal Consecrated 🌊"
  },
  prithvi: {
    bg: "linear-gradient(to top, #047857, #4ade80, #fef08a)",
    glow: "rgba(16, 185, 129, 0.5)",
    shadow: "#10b981",
    label: "Prithvi Consecrated 🌿"
  },
  akasha: {
    bg: "linear-gradient(to top, #581c87, #c084fc, #fef08a)",
    glow: "rgba(168, 85, 247, 0.5)",
    shadow: "#c084fc",
    label: "Akasha Consecrated 🌌"
  }
};

function setTattva(t) {
  currentTattva = t;
  document.querySelectorAll(".tattva-chip").forEach(c => c.classList.remove("active-tattva"));
  const activeBtn = document.getElementById(`btn-tattva-${t}`);
  if (activeBtn) activeBtn.classList.add("active-tattva");

  const flame = document.getElementById("diyaFlame");
  const glow = document.getElementById("diyaGlow");
  const prompt = document.getElementById("diyaPrompt");

  flame.style.background = tattvaStyles[t].bg;
  flame.style.filter = `drop-shadow(0 0 25px ${tattvaStyles[t].shadow})`;
  flame.classList.add("flame-lit");

  glow.style.backgroundColor = tattvaStyles[t].glow;
  prompt.textContent = tattvaStyles[t].label;
  triggerConfetti();
}

let isLit = false;
function kindleDiya() {
  const flame = document.getElementById("diyaFlame");
  const glow = document.getElementById("diyaGlow");
  const prompt = document.getElementById("diyaPrompt");

  if (!isLit) {
    isLit = true;
    flame.classList.add("flame-lit");
    glow.classList.add("glow-lit");
    prompt.textContent = "Akhand Diya Consecrated ✨";
    prompt.classList.replace("text-amber-300", "text-yellow-200");
  }
  triggerConfetti();
}

function triggerConfetti() {
  if (typeof confetti === "function") {
    confetti({
      particleCount: 65,
      spread: 75,
      origin: { y: 0.65 },
      colors: ["#FFD700", "#FF8C00", "#FF4500", "#FFF"]
    });
  }
}

// Background Sky Lanterns
const lanternsLayer = document.getElementById("skyLanternsLayer");
function spawnSkyLantern() {
  const lantern = document.createElement("div");
  lantern.className = "lantern";
  lantern.style.left = `${Math.random() * 95}%`;
  lantern.style.animationDuration = `${11 + Math.random() * 8}s`;
  lantern.style.opacity = `${0.6 + Math.random() * 0.4}`;
  lanternsLayer.appendChild(lantern);
  setTimeout(() => lantern.remove(), 19000);
}
setInterval(spawnSkyLantern, 2500);
for (let i = 0; i < 5; i++) spawnSkyLantern();

// Ambient Canvas Physics
const canvas = document.getElementById("ambientCanvas");
const ctx = canvas.getContext("2d");
let particles = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

window.addEventListener("pointerdown", (e) => {
  if (e.target.closest("input, button, select, #diyaContainer, #sanadCard, #aartiPlate, #toranString, #mandalaCanvas")) return;
  spawnBurst(e.clientX, e.clientY);
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

function spawnBurst(x, y) {
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

function renderScene() {
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
  requestAnimationFrame(renderScene);
}
renderScene();

// Populate Day Select Options (1 to 31)
const daySelect = document.getElementById("birthDaySelect");
if (daySelect) {
  daySelect.innerHTML = "";
  for (let d = 1; d <= 31; d++) {
    const opt = document.createElement("option");
    opt.value = d;
    opt.textContent = `${d} (${d < 10 ? "0" + d : d})`;
    if (d === 5) opt.selected = true;
    daySelect.appendChild(opt);
  }
}

// Bhagyank Engine
function calculateBhagyank() {
  const day = parseInt(document.getElementById("birthDaySelect").value) || 5;
  const month = parseInt(document.getElementById("birthMonthSelect").value) || 7;

  let sum = day + month;
  while (sum > 9) {
    sum = sum.toString().split("").map(Number).reduce((a, b) => a + b, 0);
  }

  const profiles = {
    1: { planet: "Surya (Sun) • Leadership & Radiance", desc: "Destined for sovereign creative authority and clear pathfinding breakthroughs." },
    2: { planet: "Chandra (Moon) • Intuition & Peace", desc: "Blessed with calming emotional depth, musical aesthetic, and artistic harmony." },
    3: { planet: "Guru (Jupiter) • Expansive Wisdom", desc: "Naturally aligned with scholarly brilliance, intellectual elevation, and mentors' favor." },
    4: { planet: "Rahu • Disruptive Innovation", desc: "A visionary mindset that deconstructs complex systems to pioneer original solutions." },
    5: { planet: "Budha (Mercury) • Intellect & Speech", desc: "Quick computational logic, commercial agility, and captivating technical articulation." },
    6: { planet: "Shukra (Venus) • Abundance & Art", desc: "Draws prosperous blessings of Lakshmi, refined design sense, and joyful celebration." },
    7: { planet: "Ketu • Deep Analysis & Intuition", desc: "Guided by contemplative philosophy, rigorous mastery, and sudden flashes of clarity." },
    8: { planet: "Shani (Saturn) • Unyielding Mastery", desc: "Constructs enduring, long-lasting legacies through iron discipline and perseverance." },
    9: { planet: "Mangala (Mars) • Courage & Triumph", desc: "Dynamic vitality, brave execution, and fierce focus that overcomes every barrier." }
  };

  const prof = profiles[sum] || profiles[5];
  document.getElementById("bhagyankDigit").textContent = sum;
  document.getElementById("bhagyankPlanet").textContent = prof.planet;
  document.getElementById("bhagyankDesc").textContent = `"${prof.desc}"`;
  document.getElementById("bhagyankResult").classList.remove("hidden");
  triggerConfetti();
}

// Nakshatra & Rashi Database
const rashiDB = {
  mesha: {
    title: "Mesha Rashi (Aries)",
    sub: "Lord Mangala • Agni Tattva",
    symbol: "♈",
    shloka: "॥ ॐ धरणीगर्भसंभूतं विद्युत्कान्तिसमप्रभम् । कुमारं शक्तिहस्तं च मंगलं प्रणमाम्यहम् ॥",
    blessing: "May this Deepavali ignite courageous leadership, clear triumph over obstacles, and unending energy in your academic pursuits."
  },
  vrishabha: {
    title: "Vrishabha Rashi (Taurus)",
    sub: "Lord Shukra • Prithvi Tattva",
    symbol: "♉",
    shloka: "॥ ॐ हिमकुन्दमृणालाभं दैत्यानां परमं गुरुम् । सर्वशास्त्रप्रवक्तारं भार्गवं प्रणमाम्यहम् ॥",
    blessing: "May Goddess Mahalakshmi bestow lasting material security, aesthetic brilliance, and tranquil harmony upon your home."
  },
  mithuna: {
    title: "Mithuna Rashi (Gemini)",
    sub: "Lord Budha • Vayu Tattva",
    symbol: "♊",
    shloka: "॥ ॐ प्रियंगुकलिकाश्यामं रूपेणाप्रतिमं बुधम् । सौम्यं सौम्यगुणोपेतं तं बुधं प्रणमाम्यहम् ॥",
    blessing: "May supreme intellect, persuasive speech, and breakthrough clarity guide all your communications and code."
  },
  karka: {
    title: "Karka Rashi (Cancer)",
    sub: "Lord Chandra • Jal Tattva",
    symbol: "♋",
    shloka: "॥ ॐ दधिशंखतुषाराभं क्षीरोदार्णवसंभवम् । नमामि शशिनं सोमं शम्भोर्मुकुटभूषणम् ॥",
    blessing: "May deep emotional peace, familial warmth, and boundless empathetic intuition illuminate your days."
  },
  simha: {
    title: "Simha Rashi (Leo)",
    sub: "Lord Surya • Agni Tattva",
    symbol: "♌",
    shloka: "॥ ॐ जपाकुसुमसंकाशं काश्यपेयं महाद्युतिम् । तमोऽरिं सर्वपापघ्नं प्रणतोऽस्मि दिवाकरम् ॥",
    blessing: "May the golden radiance of the Sun grant you unshakeable self-belief, executive authority, and sovereign victory."
  },
  kanya: {
    title: "Kanya Rashi (Virgo)",
    sub: "Lord Budha • Prithvi Tattva",
    symbol: "♍",
    shloka: "॥ ॐ सौम्यरूपाय विद्महे वाणेशाय धीमहि तन्नो सौम्यः प्रचोदयात् ॥",
    blessing: "May precision, vibrant health, and masterful engineering craftsmanship accompany every project you build."
  },
  tula: {
    title: "Tula Rashi (Libra)",
    sub: "Lord Shukra • Vayu Tattva",
    symbol: "♎",
    shloka: "॥ ॐ भार्गवाय नमः । सर्वसौभाग्यप्रदायिने नमः ॥",
    blessing: "May perfect balance, graceful collaboration, and joyous celebration flourish abundantly in your life."
  },
  vrishchika: {
    title: "Vrishchika Rashi (Scorpio)",
    sub: "Lord Mangala • Jal Tattva",
    symbol: "♏",
    shloka: "॥ ॐ क्रां क्रीं क्रौं सः भौमाय नमः ॥",
    blessing: "May transformative resilience, fearless insight, and profound inner power conquer every challenge."
  },
  dhanu: {
    title: "Dhanu Rashi (Sagittarius)",
    sub: "Lord Brihaspati • Agni Tattva",
    symbol: "♐",
    shloka: "॥ ॐ देवानां च ऋषीणां च गुरुं काञ्चनसंनिभम् । बुद्धिभूतं त्रिलोकेशं तं नमामि बृहस्पतिम् ॥",
    blessing: "May expansive wisdom, spiritual elevation, and boundless optimism guide your studies to the highest honors."
  },
  makara: {
    title: "Makara Rashi (Capricorn)",
    sub: "Lord Shani • Prithvi Tattva",
    symbol: "♑",
    shloka: "॥ ॐ नीलांजनसमाभासं रविपुत्रं यमाग्रजम् । छायामार्तण्डसंभूतं तं नमामि शनैश्चरम् ॥",
    blessing: "May disciplined perseverance, structural excellence, and honorable achievement crown your persistent efforts."
  },
  kumbha: {
    title: "Kumbha Rashi (Aquarius)",
    sub: "Lord Shani • Vayu Tattva",
    symbol: "♒",
    shloka: "॥ ॐ शन्नो देवि रभिष्टय आपो भवन्तु पीतये ॥",
    blessing: "May visionary innovation, humanitarian ideals, and futuristic creations shine forth from your mind."
  },
  meena: {
    title: "Meena Rashi (Pisces)",
    sub: "Lord Brihaspati • Jal Tattva",
    symbol: "♓",
    shloka: "॥ ॐ विष्णवे नमः । ॐ नमो नारायणाय ॥",
    blessing: "May divine grace, spiritual serenity, and infinite creative inspiration bless your soul and loved ones."
  }
};

let activeRashiKey = "mesha";
function selectRashi(key) {
  activeRashiKey = key;
  const data = rashiDB[key];
  if (!data) return;

  document.getElementById("rashiTitle").textContent = data.title;
  document.getElementById("rashiSub").textContent = data.sub;
  document.getElementById("rashiSymbol").textContent = data.symbol;
  document.getElementById("rashiShloka").textContent = data.shloka;
  document.getElementById("rashiBlessing").textContent = `"${data.blessing}"`;
  triggerConfetti();
}

function applyRashiToSanad() {
  const data = rashiDB[activeRashiKey];
  document.getElementById("sanadBlessingText").textContent = `"${data.blessing}"`;
  switchNav("certificate");
}

// Aarti Spinner
let aartiRotations = 0;
let lastAngle = 0;
function spinAarti(e) {
  const plate = document.getElementById("aartiPlate");
  const rect = plate.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const rad = Math.atan2(e.clientY - cy, e.clientX - cx);
  let deg = rad * (180 / Math.PI);
  plate.style.transform = `rotate(${deg}deg)`;

  if (Math.abs(deg - lastAngle) > 280) {
    aartiRotations++;
    document.getElementById("aartiCount").textContent = aartiRotations;
  }
  lastAngle = deg;
}

// Marigold Toran Builder
function addToranBlossom() {
  const container = document.getElementById("toranString");
  const blossoms = [
    { text: "🌼", bg: "bg-orange-500", glow: "#f97316" },
    { text: "🌼", bg: "bg-yellow-400", glow: "#facc15" },
    { text: "🍃", bg: "bg-emerald-600", glow: "#059669" }
  ];
  const choice = blossoms[Math.floor(Math.random() * blossoms.length)];
  const item = document.createElement("div");
  item.className = `w-8 h-8 rounded-full ${choice.bg} shadow-[0_0_12px_${choice.glow}] flex items-center justify-center text-xs animate-bounce`;
  item.textContent = choice.text;
  container.appendChild(item);
  triggerConfetti();
}

// Mandala Canvas
function renderMandala(type) {
  const mCanvas = document.getElementById("mandalaCanvas");
  if (!mCanvas) return;
  const mCtx = mCanvas.getContext("2d");
  mCanvas.width = mCanvas.parentElement.clientWidth;
  mCanvas.height = mCanvas.parentElement.clientHeight;

  const cx = mCanvas.width / 2;
  const cy = mCanvas.height / 2;
  mCtx.clearRect(0, 0, mCanvas.width, mCanvas.height);
  mCtx.strokeStyle = "#fbbf24";
  mCtx.lineWidth = 2;
  mCtx.shadowBlur = 10;
  mCtx.shadowColor = "#f59e0b";

  if (type === "sriyantra") {
    for (let i = 0; i < 9; i++) {
      mCtx.save();
      mCtx.translate(cx, cy);
      mCtx.rotate((Math.PI / 4.5) * i);
      mCtx.beginPath();
      mCtx.moveTo(0, -90);
      mCtx.lineTo(65, 50);
      mCtx.lineTo(-65, 50);
      mCtx.closePath();
      mCtx.stroke();
      mCtx.restore();
    }
  } else {
    for (let i = 0; i < 8; i++) {
      mCtx.save();
      mCtx.translate(cx, cy);
      mCtx.rotate((Math.PI / 4) * i);
      mCtx.beginPath();
      mCtx.moveTo(0, 0);
      mCtx.quadraticCurveTo(45, -50, 0, -100);
      mCtx.quadraticCurveTo(-45, -50, 0, 0);
      mCtx.stroke();
      mCtx.restore();
    }
  }
}

function clearMandalaCanvas() {
  const mCanvas = document.getElementById("mandalaCanvas");
  if (!mCanvas) return;
  const mCtx = mCanvas.getContext("2d");
  mCtx.clearRect(0, 0, mCanvas.width, mCanvas.height);
}

// Sankalpa Signer
let pledgeCount = 2481;
function signPledge(pledge, btn) {
  pledgeCount++;
  document.getElementById("pledgeCounter").textContent = pledgeCount.toLocaleString();
  document.getElementById("sanadPledgeTag").textContent = pledge;
  btn.textContent = "Pledged! 🌿";
  btn.classList.add("bg-emerald-500", "text-stone-900");
  triggerConfetti();
}

// Sanad Certificate Exporter
const sanadNameInput = document.getElementById("sanadNameInput");
const sanadFamilyInput = document.getElementById("sanadFamilyInput");

if (sanadNameInput) {
  sanadNameInput.addEventListener("input", () => {
    document.getElementById("sanadNameDisplay").textContent = sanadNameInput.value || "Swayam Shoubin Sahoo";
  });
}
if (sanadFamilyInput) {
  sanadFamilyInput.addEventListener("input", () => {
    document.getElementById("sanadFamilyDisplay").textContent = sanadFamilyInput.value || "Cherished Friends & Mentors";
  });
}

function downloadSanad() {
  const card = document.getElementById("sanadCard");
  if (typeof html2canvas === "function") {
    html2canvas(card, { scale: 2, backgroundColor: "#05020c" }).then(c => {
      const link = document.createElement("a");
      link.download = `Deepavali_Sanad_${Date.now()}.png`;
      link.href = c.toDataURL("image/png");
      link.click();
    });
  } else {
    alert("Press Ctrl + P to print or save your Sanad certificate.");
  }
}

function shareSanadWhatsApp() {
  const name = sanadNameInput ? sanadNameInput.value : "Swayam";
  const recipient = sanadFamilyInput ? sanadFamilyInput.value : "Family";
  const text = encodeURIComponent(`🪔 *Shubh Deepavali from ${name}!* ✨\n\nI consecrated an Akhand Diya for ${recipient} on DiyaVerse:\n${window.location.href}`);
  window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
}

// Countdown Timer
function updateCountdown() {
  const target = new Date("November 8, 2026 18:00:00").getTime();
  const now = new Date().getTime();
  const diff = Math.max(0, target - now);

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const secs = Math.floor((diff % (1000 * 60)) / 1000);

  document.getElementById("t-days").innerText = String(days).padStart(2, "0");
  document.getElementById("t-hours").innerText = String(hours).padStart(2, "0");
  document.getElementById("t-mins").innerText = String(mins).padStart(2, "0");
  document.getElementById("t-secs").innerText = String(secs).padStart(2, "0");
}
setInterval(updateCountdown, 1000);
updateCountdown();