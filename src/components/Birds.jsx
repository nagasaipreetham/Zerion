import { useEffect, useRef } from 'react';

// ─────────────────────────────────────────────────────────
//  Config
// ─────────────────────────────────────────────────────────
const BANNER_H = 350;
const FLAP_SPEED = 2.8;   // radians per second
const BIRD_COLOR = '#141418';

function rand(a, b) { return a + Math.random() * (b - a); }
function randInt(a, b) { return Math.floor(a + Math.random() * (b - a + 1)); }

// ─────────────────────────────────────────────────────────
//  Draw one bird silhouette (seagull style)
//  x,y   = body centre
//  size  = half-wingspan in px
//  phase = flap animation phase (radians)
// ─────────────────────────────────────────────────────────
function drawBird(ctx, x, y, size, phase, alpha = 0.82) {
  const span = size;
  // flap > 0 → tips rise above body; flap < 0 → tips dip below
  const flap = Math.sin(phase) * size * 0.40;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = BIRD_COLOR;
  ctx.beginPath();

  // ── Body centre (top edge)
  ctx.moveTo(x, y);

  // ── Left wing: sweep to tip
  ctx.bezierCurveTo(
    x - span * 0.32, y,
    x - span * 0.68, y - flap * 0.78,
    x - span, y - flap
  );

  // ── Left wing tip back to body (lower wing edge, thicker feel)
  ctx.quadraticCurveTo(
    x - span * 0.52, y + size * 0.09,
    x, y + size * 0.08
  );

  // ── Right wing: sweep to tip
  ctx.quadraticCurveTo(
    x + span * 0.52, y + size * 0.09,
    x + span, y - flap
  );

  // ── Right wing tip back to start
  ctx.bezierCurveTo(
    x + span * 0.68, y - flap * 0.78,
    x + span * 0.32, y,
    x, y
  );

  ctx.fill();
  ctx.restore();
}

// ─────────────────────────────────────────────────────────
//  Factory: scattered flock
//  Birds drift in a loose cloud with random offsets and
//  independent vertical bobs.
// ─────────────────────────────────────────────────────────
function makeScatteredFlock(startX, startY, scale, speed) {
  const count = randInt(2, 8);   // max 8 birds per scattered flock
  const birds = [];
  for (let i = 0; i < count; i++) {
    birds.push({
      dx: rand(-70, 50) * scale,
      dy: rand(-55, 55) * scale,
      flapOffset: rand(0, Math.PI * 2),
      size: rand(9, 16) * scale,
      bobAmp: rand(2, 8),
      bobPhase: rand(0, Math.PI * 2),
      bobSpeed: rand(0.5, 1.2),
    });
  }
  return { type: 'SCATTERED', x: startX, y: startY, speed, birds, age: 0 };
}

// ─────────────────────────────────────────────────────────
//  Factory: V-formation
//  Classic migratory V pointing in the direction of travel.
//  Leader is at (g.x, g.y); followers trail diagonally behind.
// ─────────────────────────────────────────────────────────
function makeVFormation(startX, startY, scale, speed) {
  // armLen 4–7 → total birds = 1 + 2*armLen = 9, 11, 13, or 15
  const armLen = randInt(4, 7);
  const longGap = 30 * scale;      // longitudinal spacing behind leader
  const latGap = 22 * scale;      // lateral spread per step
  const birds = [];

  // Leader
  birds.push({ dx: 0, dy: 0, flapOffset: 0, size: 14 * scale, bobAmp: 3, bobPhase: 0, bobSpeed: 0.9 });

  // Build both arms of the V
  for (let i = 1; i <= armLen; i++) {
    const behindX = -i * longGap;
    const sideY = i * latGap;
    const birdSize = Math.max(7, (14 - i * 0.4)) * scale;
    const delay = i * 0.18;        // stagger the flap slightly per bird

    // Right arm (goes upper-right when V opens forward-right)
    birds.push({ dx: behindX, dy: -sideY, flapOffset: delay, size: birdSize, bobAmp: 2, bobPhase: i * 0.4, bobSpeed: 0.8 });
    // Left arm
    birds.push({ dx: behindX, dy: sideY, flapOffset: delay, size: birdSize, bobAmp: 2, bobPhase: i * 0.5 + 1, bobSpeed: 0.8 });
  }

  return { type: 'V', x: startX, y: startY, speed, birds, age: 0 };
}

// ─────────────────────────────────────────────────────────
//  Spawn helper — enforces per-type caps
//  MAX_V = 2 simultaneous V-formations
//  MAX_S = 3 simultaneous scattered flocks
// ─────────────────────────────────────────────────────────
const MAX_V = 2;
const MAX_S = 3;

function spawnGroup(W, H, groups, startOffScreen = true) {
  const vCount = groups.filter(g => g.type === 'V').length;
  const sCount = groups.filter(g => g.type === 'SCATTERED').length;

  // Decide type respecting caps
  let isV;
  if (vCount >= MAX_V && sCount >= MAX_S) return null;   // both full, skip
  if (vCount >= MAX_V) isV = false;
  else if (sCount >= MAX_S) isV = true;
  else isV = Math.random() < 0.38;

  const scale = rand(0.55, 1.0);
  const speed = rand(50, 90);
  const startX = startOffScreen ? rand(-250, -80) : rand(-100, W * 0.55);
  const startY = rand(H * 0.08, H * 0.78);
  return isV
    ? makeVFormation(startX, startY, scale, speed)
    : makeScatteredFlock(startX, startY, scale, speed);
}

// ─────────────────────────────────────────────────────────
export default function Birds() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = canvas.offsetWidth || 900;
      canvas.height = canvas.offsetHeight || BANNER_H;
    };
    resize();
    window.addEventListener('resize', resize);

    const groups = [];
    const timers = [];

    // Initial flocks: seed 1 V + up to 2 scattered already mid-canvas
    const W0 = canvas.width, H0 = canvas.height;
    // One V-formation to start
    groups.push(makeVFormation(rand(W0 * 0.1, W0 * 0.5), rand(H0 * 0.1, H0 * 0.7), rand(0.65, 1.0), rand(50, 80)));
    // 1-2 scattered flocks
    const initS = randInt(1, 2);
    for (let i = 0; i < initS; i++) {
      groups.push(makeScatteredFlock(rand(-60, W0 * 0.55), rand(H0 * 0.1, H0 * 0.78), rand(0.55, 0.9), rand(50, 90)));
    }

    // Schedule ongoing spawns — respects per-type caps
    const scheduleNext = () => {
      const t = setTimeout(() => {
        const g = spawnGroup(canvas.width, canvas.height, groups, true);
        if (g) groups.push(g);
        scheduleNext();
      }, rand(5000, 12000));
      timers.push(t);
    };
    scheduleNext();

    let lastTime = performance.now();
    let rafId;

    const draw = () => {
      rafId = requestAnimationFrame(draw);
      const W = canvas.width;
      const H = canvas.height;
      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      ctx.clearRect(0, 0, W, H);

      for (let gi = groups.length - 1; gi >= 0; gi--) {
        const g = groups[gi];
        g.x += g.speed * dt;
        g.age += dt;

        // Find rightmost bird; if it's well past right edge, remove group
        let maxBX = g.x;
        for (const b of g.birds) maxBX = Math.max(maxBX, g.x + (b.dx || 0));
        if (maxBX > W + 160) { groups.splice(gi, 1); continue; }

        for (const b of g.birds) {
          const bx = g.x + (b.dx || 0);
          // Vertical bob: each bird bobs independently
          const bob = Math.sin(g.age * b.bobSpeed + b.bobPhase) * b.bobAmp;
          const by = g.y + (b.dy || 0) + bob;
          const flapPhase = g.age * FLAP_SPEED + b.flapOffset;

          // Skip if off screen
          if (bx < -60 || bx > W + 60) continue;
          if (by < -30 || by > H + 30) continue;

          drawBird(ctx, bx, by, b.size, flapPhase);
        }
      }
    };

    draw();

    return () => {
      cancelAnimationFrame(rafId);
      timers.forEach(clearTimeout);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 2,        // above clouds (z=1)
        pointerEvents: 'none',
      }}
    />
  );
}
