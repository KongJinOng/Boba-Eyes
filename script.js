// ───────── YouTube Background Music ─────────
const YOUTUBE_VIDEO_ID = '4fhqI_qoTco'; // Just the video ID, not the full URL

let ytPlayer;
let ytReady = false;
let bgMusicStarted = false;

function onYouTubeIframeAPIReady() {
  ytPlayer = new YT.Player('yt-player', {
    playerVars: { controls: 0, loop: 1, playlist: YOUTUBE_VIDEO_ID },
    events: {
      onReady: () => { ytReady = true; }
    }
  });
}

function startBgMusic() {
  if (ytReady && ytPlayer && ytPlayer.loadVideoById) {
    ytPlayer.loadVideoById(YOUTUBE_VIDEO_ID);
  }
}

// ───────── Floating Particles (Hearts & Sparkles) ─────────
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
let particles = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

class Particle {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = Math.random() * canvas.width;
    this.y = canvas.height + 20;
    this.size = Math.random() * 14 + 6;
    this.speedY = Math.random() * 0.8 + 0.3;
    this.speedX = (Math.random() - 0.5) * 0.4;
    this.opacity = Math.random() * 0.4 + 0.1;
    this.fadeSpeed = Math.random() * 0.002 + 0.001;
    this.type = Math.random() > 0.4 ? 'heart' : 'sparkle';
    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = (Math.random() - 0.5) * 0.02;
    // Purple-lavender color palette
    const colors = ['#c9a6e8', '#a57bcf', '#d4bbe8', '#9b59b6', '#e8d5f5', '#7b3fa0'];
    this.color = colors[Math.floor(Math.random() * colors.length)];
  }

  update() {
    this.y -= this.speedY;
    this.x += this.speedX + Math.sin(this.y * 0.01) * 0.3;
    this.rotation += this.rotationSpeed;
    this.opacity -= this.fadeSpeed;

    if (this.opacity <= 0 || this.y < -20) {
      this.reset();
    }
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.globalAlpha = this.opacity;

    if (this.type === 'heart') {
      this.drawHeart();
    } else {
      this.drawSparkle();
    }

    ctx.restore();
  }

  drawHeart() {
    const s = this.size / 16;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.moveTo(0, s * 3);
    ctx.bezierCurveTo(0, s * 0, -s * 10, s * 0, -s * 10, s * 7);
    ctx.bezierCurveTo(-s * 10, s * 12, 0, s * 14, 0, s * 18);
    ctx.bezierCurveTo(0, s * 14, s * 10, s * 12, s * 10, s * 7);
    ctx.bezierCurveTo(s * 10, s * 0, 0, s * 0, 0, s * 3);
    ctx.fill();
  }

  drawSparkle() {
    const s = this.size / 2;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2;
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(angle - 0.2) * s * 0.4, Math.sin(angle - 0.2) * s * 0.4);
      ctx.lineTo(Math.cos(angle) * s, Math.sin(angle) * s);
      ctx.lineTo(Math.cos(angle + 0.2) * s * 0.4, Math.sin(angle + 0.2) * s * 0.4);
    }
    ctx.closePath();
    ctx.fill();
  }
}

// Spawn particles
for (let i = 0; i < 35; i++) {
  const p = new Particle();
  p.y = Math.random() * canvas.height;
  particles.push(p);
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => {
    p.update();
    p.draw();
  });
  requestAnimationFrame(animateParticles);
}

animateParticles();

// ───────── Sound Effects (Web Audio API) ─────────
let audioCtx;

async function ensureAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') await audioCtx.resume();
  return audioCtx;
}

async function playEnvelopeSound() {
  const ctx = await ensureAudioCtx();
  const now = ctx.currentTime;

  // Soft whoosh — rising filtered noise
  const bufferSize = ctx.sampleRate * 0.6;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(400, now);
  filter.frequency.linearRampToValueAtTime(1800, now + 0.3);
  filter.Q.value = 2;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.15, now);
  gain.gain.linearRampToValueAtTime(0, now + 0.5);

  noise.connect(filter).connect(gain).connect(ctx.destination);
  noise.start(now);
  noise.stop(now + 0.6);

  // Gentle chime
  [523, 659, 784].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;

    const g = ctx.createGain();
    g.gain.setValueAtTime(0, now + i * 0.12);
    g.gain.linearRampToValueAtTime(0.12, now + i * 0.12 + 0.05);
    g.gain.linearRampToValueAtTime(0, now + i * 0.12 + 0.5);

    osc.connect(g).connect(ctx.destination);
    osc.start(now + i * 0.12);
    osc.stop(now + i * 0.12 + 0.5);
  });
}

async function playCardOpenSound() {
  const ctx = await ensureAudioCtx();
  const now = ctx.currentTime;

  // Magical sparkle arpeggio
  const notes = [523, 659, 784, 1047, 1319, 1568];
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;

    const g = ctx.createGain();
    const t = now + i * 0.09;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.1, t + 0.03);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.8);

    osc.connect(g).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.8);
  });

  // Warm pad chord underneath
  [262, 330, 392].forEach(freq => {
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.value = freq;

    const g = ctx.createGain();
    g.gain.setValueAtTime(0, now + 0.1);
    g.gain.linearRampToValueAtTime(0.06, now + 0.4);
    g.gain.linearRampToValueAtTime(0, now + 2.0);

    osc.connect(g).connect(ctx.destination);
    osc.start(now + 0.1);
    osc.stop(now + 2.0);
  });
}

async function playReplaySound() {
  const ctx = await ensureAudioCtx();
  const now = ctx.currentTime;

  // Quick descending chime
  [784, 659, 523].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;

    const g = ctx.createGain();
    g.gain.setValueAtTime(0, now + i * 0.08);
    g.gain.linearRampToValueAtTime(0.08, now + i * 0.08 + 0.03);
    g.gain.linearRampToValueAtTime(0, now + i * 0.08 + 0.35);

    osc.connect(g).connect(ctx.destination);
    osc.start(now + i * 0.08);
    osc.stop(now + i * 0.08 + 0.35);
  });
}

// ───────── Envelope Interaction ─────────
const envelope = document.getElementById('envelope');
const envelopeScene = document.getElementById('envelope-scene');
const cardScene = document.getElementById('card-scene');

envelope.addEventListener('click', () => {
  if (envelope.classList.contains('opened')) return;

  envelope.classList.add('opened');
  playEnvelopeSound();

  // Transition to card scene after envelope animation
  setTimeout(() => {
    envelopeScene.classList.remove('active');
    cardScene.classList.add('active');

    // Show replay button after card appears
    setTimeout(() => {
      document.getElementById('replay-btn').classList.add('visible');
    }, 600);
  }, 1200);
});

// ───────── Card Open Interaction ─────────
const card = document.getElementById('card');

card.addEventListener('click', () => {
  if (card.classList.contains('opened')) return;

  card.classList.add('opened');
  playCardOpenSound();
  startBgMusic();

  // Burst of hearts on open
  spawnHeartBurst();
});

// ───────── Heart Burst Effect ─────────
function spawnHeartBurst() {
  const burstCount = 20;
  for (let i = 0; i < burstCount; i++) {
    const p = new Particle();
    p.x = canvas.width / 2 + (Math.random() - 0.5) * 100;
    p.y = canvas.height / 2;
    p.speedY = Math.random() * 2 + 1;
    p.speedX = (Math.random() - 0.5) * 3;
    p.opacity = 0.7;
    p.size = Math.random() * 18 + 10;
    p.type = 'heart';
    particles.push(p);
  }

  // Clean up extra particles after a while
  setTimeout(() => {
    particles = particles.slice(0, 35);
  }, 5000);
}

// ───────── Replay ─────────
document.getElementById('replay-btn').addEventListener('click', () => {
  // Reset everything
  card.classList.remove('opened');
  envelope.classList.remove('opened');

  document.getElementById('replay-btn').classList.remove('visible');
  playReplaySound();

  cardScene.classList.remove('active');
  envelopeScene.classList.add('active');
});
