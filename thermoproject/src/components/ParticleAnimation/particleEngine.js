/**
 * Canvas-based particle physics engine for molecular visualization.
 * Pure JS — no React dependency.
 */

const PARTICLE_COUNT = 80;
const CONTAINER_PADDING = 4;

const COLORS = {
  liquid: '#3b82f6',
  vapor: '#f97316',
  superheated: '#ef4444',
  surface: '#a855f7',
  container: '#334155',
};

export class ParticleEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.thermoState = { T: 100, P: 100, v: 0.001, x: 0, phase: 'Compressed Liquid' };
    this.animId = null;
    this.lastTime = 0;
    this._createParticles(PARTICLE_COUNT);
  }

  updateState(thermoState) {
    if (!thermoState) return;
    const prevPhase = this.thermoState.phase;
    this.thermoState = { ...thermoState };

    // Re-initialize particle layout when phase changes
    if (prevPhase !== thermoState.phase) {
      this._layoutParticles();
    }
  }

  start() {
    this.lastTime = performance.now();
    const loop = (now) => {
      const dt = Math.min((now - this.lastTime) / 1000, 0.05); // cap at 50ms
      this.lastTime = now;
      this._update(dt);
      this._render();
      this.animId = requestAnimationFrame(loop);
    };
    this.animId = requestAnimationFrame(loop);
  }

  stop() {
    if (this.animId != null) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
  }

  // ── Internal ───────────────────────────────────────────────────

  _createParticles(count) {
    const w = this.canvas.width;
    const h = this.canvas.height;
    this.particles = [];
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: CONTAINER_PADDING + Math.random() * (w - 2 * CONTAINER_PADDING),
        y: CONTAINER_PADDING + Math.random() * (h - 2 * CONTAINER_PADDING),
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        color: COLORS.liquid,
        radius: 3,
      });
    }
    this._layoutParticles();
  }

  _layoutParticles() {
    const w = this.canvas.width;
    const h = this.canvas.height;
    const pad = CONTAINER_PADDING + 6;
    const { phase, x } = this.thermoState;

    this.particles.forEach((p, i) => {
      switch (phase) {
        case 'Compressed Liquid': {
          // tight grid at bottom
          const cols = Math.ceil(Math.sqrt(PARTICLE_COUNT * (w / h)));
          const rows = Math.ceil(PARTICLE_COUNT / cols);
          const col = i % cols;
          const row = Math.floor(i / cols);
          const cellW = (w - 2 * pad) / cols;
          const cellH = (h * 0.5) / rows;
          p.x = pad + col * cellW + cellW / 2;
          p.y = h - pad - row * cellH - cellH / 2;
          p.vx = (Math.random() - 0.5) * 0.4;
          p.vy = (Math.random() - 0.5) * 0.4;
          p.color = COLORS.liquid;
          break;
        }
        case 'Saturated Mixture': {
          const quality = typeof x === 'number' ? x : 0.5;
          const liquidLevel = h - (1 - quality) * (h - 2 * pad) - pad;
          if (i < PARTICLE_COUNT * (1 - quality)) {
            // liquid — below surface
            p.x = pad + Math.random() * (w - 2 * pad);
            p.y = liquidLevel + Math.random() * (h - pad - liquidLevel);
            p.color = COLORS.liquid;
          } else {
            // vapor — above surface
            p.x = pad + Math.random() * (w - 2 * pad);
            p.y = pad + Math.random() * (liquidLevel - pad);
            p.color = COLORS.vapor;
          }
          p.vx = (Math.random() - 0.5) * 2;
          p.vy = (Math.random() - 0.5) * 2;
          break;
        }
        case 'Saturated Vapor': {
          p.x = pad + Math.random() * (w - 2 * pad);
          p.y = pad + Math.random() * (h - 2 * pad);
          p.color = COLORS.vapor;
          p.vx = (Math.random() - 0.5) * 3;
          p.vy = (Math.random() - 0.5) * 3;
          break;
        }
        case 'Superheated Vapor': {
          p.x = pad + Math.random() * (w - 2 * pad);
          p.y = pad + Math.random() * (h - 2 * pad);
          p.color = COLORS.superheated;
          p.vx = (Math.random() - 0.5) * 5;
          p.vy = (Math.random() - 0.5) * 5;
          break;
        }
        case 'Supercritical Fluid': {
          p.x = pad + Math.random() * (w - 2 * pad);
          p.y = pad + Math.random() * (h - 2 * pad);
          p.color = Math.random() > 0.5 ? COLORS.superheated : COLORS.liquid;
          p.vx = (Math.random() - 0.5) * 4;
          p.vy = (Math.random() - 0.5) * 4;
          break;
        }
        default: {
          p.color = COLORS.liquid;
          break;
        }
      }
      p.radius = 3;
    });
  }

  _update(dt) {
    const w = this.canvas.width;
    const h = this.canvas.height;
    const pad = CONTAINER_PADDING + 4;
    const { phase, T, x } = this.thermoState;
    const temperature = typeof T === 'number' ? T : 100;
    const baseSpeed = 0.5 + (temperature / 400) * 3;

    this.particles.forEach((p) => {
      switch (phase) {
        case 'Compressed Liquid': {
          // slow random jiggle
          p.x += (Math.random() - 0.5) * 2 * dt * 60;
          p.y += (Math.random() - 0.5) * 2 * dt * 60;
          break;
        }
        case 'Saturated Mixture': {
          const quality = typeof x === 'number' ? x : 0.5;
          const liquidLevel = h - (1 - quality) * (h - 2 * pad) - pad;

          p.x += p.vx * baseSpeed * dt * 60;
          p.y += p.vy * baseSpeed * dt * 60;

          // occasional crossing (evaporation/condensation)
          if (Math.random() < 0.0005) {
            if (p.color === COLORS.liquid) {
              p.color = COLORS.vapor;
              p.y = pad + Math.random() * (liquidLevel - pad);
            } else {
              p.color = COLORS.liquid;
              p.y = liquidLevel + Math.random() * (h - pad - liquidLevel);
            }
          }

          // confine liquid below, vapor above
          if (p.color === COLORS.liquid) {
            if (p.y < liquidLevel) p.y = liquidLevel + 2;
            if (p.y > h - pad) { p.y = h - pad; p.vy *= -1; }
          } else {
            if (p.y > liquidLevel) p.y = liquidLevel - 2;
            if (p.y < pad) { p.y = pad; p.vy *= -1; }
          }
          break;
        }
        case 'Saturated Vapor':
        case 'Superheated Vapor':
        case 'Supercritical Fluid': {
          p.x += p.vx * baseSpeed * dt * 60;
          p.y += p.vy * baseSpeed * dt * 60;

          // supercritical color flicker
          if (phase === 'Supercritical Fluid' && Math.random() < 0.02) {
            p.color = Math.random() > 0.5 ? COLORS.superheated : COLORS.liquid;
          }
          break;
        }
        default:
          break;
      }

      // Wall bounce (all phases)
      if (p.x < pad) { p.x = pad; p.vx = Math.abs(p.vx); }
      if (p.x > w - pad) { p.x = w - pad; p.vx = -Math.abs(p.vx); }
      if (p.y < pad) { p.y = pad; p.vy = Math.abs(p.vy); }
      if (p.y > h - pad) { p.y = h - pad; p.vy = -Math.abs(p.vy); }
    });
  }

  _render() {
    const { ctx, canvas } = this;
    const w = canvas.width;
    const h = canvas.height;
    const { phase, T, x } = this.thermoState;

    // Clear — superheated gets motion trails via partial clear
    if (phase === 'Superheated Vapor') {
      const glowAlpha = Math.min(0.3 + (T || 100) / 1000, 0.7);
      ctx.fillStyle = `rgba(10, 15, 26, ${glowAlpha})`;
    } else {
      ctx.fillStyle = '#0a0f1a';
    }
    ctx.fillRect(0, 0, w, h);

    // Container outline
    ctx.strokeStyle = COLORS.container;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(CONTAINER_PADDING, CONTAINER_PADDING, w - 2 * CONTAINER_PADDING, h - 2 * CONTAINER_PADDING);

    // Saturated Mixture: draw surface line
    if (phase === 'Saturated Mixture') {
      const quality = typeof x === 'number' ? x : 0.5;
      const pad = CONTAINER_PADDING + 4;
      const liquidLevel = h - (1 - quality) * (h - 2 * pad) - pad;

      ctx.save();
      ctx.strokeStyle = COLORS.surface;
      ctx.lineWidth = 2;
      ctx.beginPath();
      // wavy line
      for (let px = CONTAINER_PADDING; px <= w - CONTAINER_PADDING; px += 2) {
        const wave = Math.sin(px * 0.05 + performance.now() * 0.002) * 3;
        if (px === CONTAINER_PADDING) {
          ctx.moveTo(px, liquidLevel + wave);
        } else {
          ctx.lineTo(px, liquidLevel + wave);
        }
      }
      ctx.stroke();
      ctx.restore();
    }

    // Draw particles
    ctx.save();
    if (phase === 'Superheated Vapor') {
      // glow effect
      ctx.shadowColor = COLORS.superheated;
      ctx.shadowBlur = 6 + (T || 100) / 80;
    }

    this.particles.forEach((p) => {
      ctx.beginPath();
      ctx.fillStyle = p.color;
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }
}
