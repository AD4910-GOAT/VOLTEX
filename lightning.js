/* ─── LIGHTNING ENGINE ─────────────────────────────────────────── */
/*
 * Recreates the Lightning component from @sd-components as a
 * reusable Canvas-based class.
 *
 * Props: hue, speed, intensity, size
 */

class Lightning {
  constructor(canvas, { hue = 220, speed = 1.0, intensity = 1.0, size = 1.0 } = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.hue = hue;
    this.speed = speed;
    this.intensity = intensity;
    this.size = size;
    this.bolts = [];
    this.particles = [];
    this.time = 0;
    this.animId = null;
    this.active = true;
    this._resize();
    this._ro = new ResizeObserver(() => this._resize());
    this._ro.observe(canvas.parentElement || document.body);
  }

  _resize() {
    const parent = this.canvas.parentElement || document.body;
    this.canvas.width = parent.offsetWidth;
    this.canvas.height = parent.offsetHeight;
    this.W = this.canvas.width;
    this.H = this.canvas.height;
  }

  _newBolt() {
    const W = this.W, H = this.H;
    const startX = Math.random() * W;
    const segments = [];
    let x = startX, y = 0;
    const steps = Math.floor(8 + Math.random() * 12) * this.size;
    const stepH = H / steps;
    for (let i = 0; i < steps; i++) {
      const nx = x + (Math.random() - 0.5) * 120 * this.size;
      const ny = y + stepH + (Math.random() - 0.5) * 20;
      segments.push({ x1: x, y1: y, x2: nx, y2: ny });
      // branch
      if (Math.random() < 0.3 * this.intensity) {
        const bx = nx, by = ny;
        let bpx = bx, bpy = by;
        const bSteps = Math.floor(2 + Math.random() * 4);
        const branch = [];
        for (let j = 0; j < bSteps; j++) {
          const bnx = bpx + (Math.random() - 0.5) * 80 * this.size;
          const bny = bpy + stepH * 0.7 + Math.random() * 20;
          branch.push({ x1: bpx, y1: bpy, x2: bnx, y2: bny });
          bpx = bnx; bpy = bny;
        }
        segments.push({ branch, alpha: 0.5 + Math.random() * 0.4 });
      }
      x = nx; y = ny;
    }
    return {
      segments,
      life: 0,
      maxLife: 0.08 + Math.random() * 0.18,
      alpha: 0.6 + Math.random() * 0.4,
      width: 0.8 + Math.random() * 1.8 * this.size,
    };
  }

  _spawnParticle(x, y) {
    this.particles.push({
      x, y,
      vx: (Math.random() - 0.5) * 3,
      vy: (Math.random() - 0.5) * 3 - 1,
      life: 1,
      r: 1 + Math.random() * 3 * this.size,
    });
  }

  _drawBolt(bolt) {
    const ctx = this.ctx;
    const progress = bolt.life / bolt.maxLife;
    const alpha = bolt.alpha * (1 - Math.pow(progress, 2));

    for (const seg of bolt.segments) {
      if (seg.branch) {
        for (const bs of seg.branch) {
          ctx.save();
          ctx.globalAlpha = (seg.alpha || 0.5) * alpha;
          ctx.strokeStyle = `hsl(${this.hue}, 90%, 75%)`;
          ctx.lineWidth = bolt.width * 0.5;
          ctx.shadowBlur = 8 * this.intensity;
          ctx.shadowColor = `hsl(${this.hue}, 100%, 70%)`;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(bs.x1, bs.y1);
          ctx.lineTo(bs.x2, bs.y2);
          ctx.stroke();
          ctx.restore();
        }
        continue;
      }
      // core glow (outer)
      ctx.save();
      ctx.globalAlpha = alpha * 0.25;
      ctx.strokeStyle = `hsl(${this.hue}, 100%, 70%)`;
      ctx.lineWidth = bolt.width * 5;
      ctx.shadowBlur = 40 * this.intensity;
      ctx.shadowColor = `hsl(${this.hue}, 100%, 60%)`;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(seg.x1, seg.y1);
      ctx.lineTo(seg.x2, seg.y2);
      ctx.stroke();
      ctx.restore();
      // mid glow
      ctx.save();
      ctx.globalAlpha = alpha * 0.6;
      ctx.strokeStyle = `hsl(${this.hue}, 90%, 80%)`;
      ctx.lineWidth = bolt.width * 2;
      ctx.shadowBlur = 15 * this.intensity;
      ctx.shadowColor = `hsl(${this.hue}, 100%, 70%)`;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(seg.x1, seg.y1);
      ctx.lineTo(seg.x2, seg.y2);
      ctx.stroke();
      ctx.restore();
      // bright core
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = `hsl(${this.hue + 20}, 100%, 95%)`;
      ctx.lineWidth = bolt.width * 0.6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(seg.x1, seg.y1);
      ctx.lineTo(seg.x2, seg.y2);
      ctx.stroke();
      ctx.restore();
    }
  }

  _frame(dt) {
    if (!this.active) return;
    const ctx = this.ctx;
    const W = this.W, H = this.H;
    this.time += dt * this.speed;

    // Fade background
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.fillRect(0, 0, W, H);

    // ambient glow orbs
    const orbs = 3;
    for (let i = 0; i < orbs; i++) {
      const ox = W * 0.2 + (i / orbs) * W * 0.6 + Math.sin(this.time * 0.5 + i * 2) * 60;
      const oy = H * 0.1 + Math.cos(this.time * 0.3 + i) * 30;
      const grad = ctx.createRadialGradient(ox, oy, 0, ox, oy, 120 * this.size);
      grad.addColorStop(0, `hsla(${this.hue}, 100%, 65%, ${0.06 * this.intensity})`);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
    }

    // spawn bolts
    const spawnRate = 0.04 * this.intensity * this.speed;
    if (Math.random() < spawnRate && this.bolts.length < Math.ceil(4 * this.intensity)) {
      this.bolts.push(this._newBolt());
    }

    // draw & age bolts
    this.bolts = this.bolts.filter(b => {
      b.life += dt * this.speed;
      this._drawBolt(b);
      if (Math.random() < 0.1 * this.intensity) {
        const seg = b.segments[Math.floor(Math.random() * b.segments.length)];
        if (seg && !seg.branch) this._spawnParticle(seg.x2, seg.y2);
      }
      return b.life < b.maxLife;
    });

    // particles
    ctx.save();
    this.particles = this.particles.filter(p => {
      p.x += p.vx; p.y += p.vy; p.vy += 0.08; p.life -= 0.04;
      ctx.globalAlpha = p.life * 0.7;
      ctx.fillStyle = `hsl(${this.hue + 20}, 100%, 90%)`;
      ctx.shadowBlur = 6;
      ctx.shadowColor = `hsl(${this.hue}, 100%, 70%)`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
      ctx.fill();
      return p.life > 0;
    });
    ctx.restore();
  }

  start() {
    this.active = true;
    let last = performance.now();
    const loop = (now) => {
      if (!this.active) return;
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      this._frame(dt);
      this.animId = requestAnimationFrame(loop);
    };
    this.animId = requestAnimationFrame(loop);
  }

  stop() {
    this.active = false;
    if (this.animId) cancelAnimationFrame(this.animId);
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.W, this.H);
  }

  destroy() {
    this.stop();
    if (this._ro) this._ro.disconnect();
  }
}
