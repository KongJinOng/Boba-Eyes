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

// ───────── Envelope Interaction ─────────
const envelope = document.getElementById('envelope');
const envelopeScene = document.getElementById('envelope-scene');
const cardScene = document.getElementById('card-scene');

envelope.addEventListener('click', () => {
  if (envelope.classList.contains('opened')) return;

  envelope.classList.add('opened');

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

  cardScene.classList.remove('active');
  envelopeScene.classList.add('active');
});
