import { useEffect, useRef } from 'react';

// ─────────────────────────────────────────────────────────
//  Config
// ─────────────────────────────────────────────────────────
const BANNER_H  = 350;
const DOT_GAP   = 4.5;
const DOT_COLOR = '18,18,26';

// ─────────────────────────────────────────────────────────
//  Cloud silhouette geometry
// ─────────────────────────────────────────────────────────
function buildCircles(scale) {
  const s = scale;
  return [
    // Wide base
    { cx:   0 * s, cy:  12 * s, r: 62 * s },
    { cx: -52 * s, cy:  22 * s, r: 44 * s },
    { cx:  58 * s, cy:  22 * s, r: 42 * s },
    { cx:  98 * s, cy:  32 * s, r: 28 * s },
    { cx: -92 * s, cy:  28 * s, r: 26 * s },
    // Mid-tier bumps
    { cx: -20 * s, cy: -28 * s, r: 44 * s },
    { cx:  24 * s, cy: -36 * s, r: 48 * s },
    { cx:  62 * s, cy: -20 * s, r: 35 * s },
    { cx: -58 * s, cy: -18 * s, r: 31 * s },
    // Top peaks
    { cx:   6 * s, cy: -66 * s, r: 31 * s },
    { cx: -12 * s, cy: -58 * s, r: 24 * s },
    { cx:  28 * s, cy: -56 * s, r: 27 * s },
  ];
}

function isInside(x, y, circles) {
  for (const c of circles) {
    const dx = x - c.cx, dy = y - c.cy;
    if (dx * dx + dy * dy <= c.r * c.r) return true;
  }
  return false;
}

function penetration(x, y, circles) {
  let best = -Infinity;
  for (const c of circles) {
    const dx = x - c.cx, dy = y - c.cy;
    const d = c.r - Math.sqrt(dx * dx + dy * dy);
    if (d > best) best = d;
  }
  return Math.max(0, best);
}

function getBounds(circles) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const c of circles) {
    if (c.cx - c.r < x0) x0 = c.cx - c.r;
    if (c.cy - c.r < y0) y0 = c.cy - c.r;
    if (c.cx + c.r > x1) x1 = c.cx + c.r;
    if (c.cy + c.r > y1) y1 = c.cy + c.r;
  }
  return { x0, y0, x1, y1, w: x1 - x0, h: y1 - y0 };
}

// ─────────────────────────────────────────────────────────
//  Pre-render one cloud silhouette to an offscreen canvas
// ─────────────────────────────────────────────────────────
function renderCloud(scale) {
  const circles = buildCircles(scale);
  const b       = getBounds(circles);
  const PAD     = 6;
  const ocW     = Math.ceil(b.w) + PAD * 2;
  const ocH     = Math.ceil(b.h) + PAD * 2;

  const oc  = document.createElement('canvas');
  oc.width  = ocW;
  oc.height = ocH;
  const ctx = oc.getContext('2d');

  const maxR = Math.max(...circles.map(c => c.r));
  const cols = Math.ceil(b.w / DOT_GAP) + 2;
  const rows = Math.ceil(b.h / DOT_GAP) + 2;

  for (let col = 0; col <= cols; col++) {
    for (let row = 0; row <= rows; row++) {
      const wx = b.x0 + col * DOT_GAP;
      const wy = b.y0 + row * DOT_GAP;

      if (!isInside(wx, wy, circles)) continue;

      const relY      = (wy - b.y0) / b.h;
      const relX      = (wx - b.x0) / b.w;
      const normDepth = Math.min(penetration(wx, wy, circles) / (maxR * 0.5), 1);

      const shadow    = relY * 0.52 + (1 - relX) * 0.15 + normDepth * 0.33;
      const highlight = Math.max(0, (1 - relY * 1.3) * 0.45 + (relX - 0.45) * 0.28);

      const dotR  = Math.max(0.08, shadow * 1.8 * scale - highlight * 0.7 * scale);
      const alpha = Math.max(0.04, Math.min(0.88, shadow * 0.82 + 0.06 - highlight * 0.38));

      if (dotR < 0.08) continue;

      ctx.beginPath();
      ctx.arc(wx - b.x0 + PAD, wy - b.y0 + PAD, dotR, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${DOT_COLOR},${alpha.toFixed(3)})`;
      ctx.fill();
    }
  }

  return {
    canvas:  oc,
    ocW,  ocH,
    // anchorX/Y: offset so that drawing at (cx, cy) visually centres the cloud
    anchorX: -b.x0 + PAD,
    anchorY: -b.y0 + PAD,
  };
}

// ─────────────────────────────────────────────────────────
//  Cloud layout definitions
//  xStartRatio : starting centre-x as fraction of canvas width
//  yRatio      : centre-y as fraction of canvas height (dynamic)
//  scale       : cloud size multiplier
//  speed       : px per second, moves right → left
// ─────────────────────────────────────────────────────────
const CONFIGS = [
  { xStartRatio: 0.84, yRatio: 0.38, scale: 1.00, speed: 16 }, // large  – starts right
  { xStartRatio: 0.28, yRatio: 0.50, scale: 0.72, speed: 22 }, // medium – starts left
  { xStartRatio: 0.58, yRatio: 0.20, scale: 0.52, speed: 19 }, // small  – upper mid
  { xStartRatio: 0.10, yRatio: 0.62, scale: 0.40, speed: 28 }, // small  – lower left
  { xStartRatio: 0.68, yRatio: 0.68, scale: 0.32, speed: 34 }, // tiny   – lower right
];

// ─────────────────────────────────────────────────────────
export default function Clouds() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // ── Pre-render each cloud texture once ──────────────────
    const clouds = CONFIGS.map(cfg => ({
      ...cfg,
      ...renderCloud(cfg.scale),
      x: 0, // set in resize()
    }));

    // ── Resize: also resets x positions dynamically ─────────
    const resize = () => {
      canvas.width  = canvas.offsetWidth  || 900;
      canvas.height = canvas.offsetHeight || BANNER_H;
      for (const c of clouds) {
        c.x = canvas.width * c.xStartRatio;
      }
    };
    resize();
    window.addEventListener('resize', resize);

    let lastTime = performance.now();
    let rafId;

    const draw = () => {
      rafId = requestAnimationFrame(draw);
      const W  = canvas.width;
      const H  = canvas.height;
      const now = performance.now();
      const dt  = Math.min((now - lastTime) / 1000, 0.05); // cap Δt at 50 ms
      lastTime  = now;

      ctx.clearRect(0, 0, W, H);

      for (const c of clouds) {
        // Move left continuously
        c.x -= c.speed * dt;

        // Wrap: when the cloud's right edge exits the left side, re-enter from right
        const leftEdge = c.x - c.anchorX;          // pixel x of cloud's left edge
        if (leftEdge + c.ocW < 0) {
          c.x = W + c.anchorX;                      // reset centre to just off right edge
        }

        const drawX = Math.round(c.x - c.anchorX);
        const drawY = Math.round(H * c.yRatio - c.anchorY);

        ctx.drawImage(c.canvas, drawX, drawY);
      }
    };

    draw();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position:      'absolute',
        top:           0,
        left:          0,
        width:         '100%',
        height:        '100%',
        zIndex:        1,
        pointerEvents: 'none',
      }}
    />
  );
}
