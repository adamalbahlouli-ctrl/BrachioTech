/**
 * NeuralWorks — Particle System
 * Animated floating particles on hero canvas
 */

(function () {
  'use strict';

  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let particles = [];
  let animationId;
  let W, H;

  // ---- Resize handler ----
  function resize() {
    W = canvas.width  = canvas.offsetWidth  || window.innerWidth;
    H = canvas.height = canvas.offsetHeight || window.innerHeight;
  }

  window.addEventListener('resize', () => {
    resize();
    initParticles();
  });

  // ---- Particle Factory ----
  function createParticle() {
    const colors = [
      'rgba(108, 99, 255, ',
      'rgba(78, 205, 196, ',
      'rgba(255, 107, 107, ',
      'rgba(168, 156, 255, ',
    ];
    const color = colors[Math.floor(Math.random() * colors.length)];
    return {
      x:       Math.random() * W,
      y:       Math.random() * H,
      r:       Math.random() * 2.5 + 0.5,
      dx:      (Math.random() - 0.5) * 0.5,
      dy:      (Math.random() - 0.5) * 0.5,
      alpha:   Math.random() * 0.5 + 0.1,
      color,
      pulse:   Math.random() * Math.PI * 2,
      pulseSpeed: Math.random() * 0.02 + 0.005,
    };
  }

  function initParticles() {
    const count = Math.min(120, Math.floor((W * H) / 8000));
    particles = Array.from({ length: count }, createParticle);
  }

  // ---- Draw one frame ----
  function draw() {
    ctx.clearRect(0, 0, W, H);

    particles.forEach(p => {
      // Update
      p.x += p.dx;
      p.y += p.dy;
      p.pulse += p.pulseSpeed;

      const pulsedAlpha = p.alpha + Math.sin(p.pulse) * 0.15;

      // Wrap around edges
      if (p.x < -10) p.x = W + 10;
      if (p.x > W + 10) p.x = -10;
      if (p.y < -10) p.y = H + 10;
      if (p.y > H + 10) p.y = -10;

      // Draw glow
      const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3);
      glow.addColorStop(0, `${p.color}${pulsedAlpha})`);
      glow.addColorStop(1, `${p.color}0)`);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2);
      ctx.fillStyle = glow;
      ctx.fill();

      // Draw core
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `${p.color}${Math.min(pulsedAlpha + 0.3, 0.9)})`;
      ctx.fill();
    });

    // Draw connection lines between nearby particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(108, 99, 255, ${0.12 * (1 - dist / 100)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    animationId = requestAnimationFrame(draw);
  }

  // ---- Mouse interaction ----
  let mouse = { x: -9999, y: -9999 };
  const heroSection = document.getElementById('hero');

  if (heroSection) {
    heroSection.addEventListener('mousemove', e => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;

      // Repel particles from cursor
      particles.forEach(p => {
        const dx = p.x - mouse.x, dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 80) {
          const force = (80 - dist) / 80;
          p.dx += (dx / dist) * force * 0.3;
          p.dy += (dy / dist) * force * 0.3;
          // Clamp speed
          const speed = Math.sqrt(p.dx * p.dx + p.dy * p.dy);
          if (speed > 1.5) {
            p.dx = (p.dx / speed) * 1.5;
            p.dy = (p.dy / speed) * 1.5;
          }
        }
      });
    });
  }

  // ---- Init ----
  function init() {
    resize();
    initParticles();
    draw();
  }

  // Pause when tab is hidden
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(animationId);
    } else {
      draw();
    }
  });

  init();
})();
