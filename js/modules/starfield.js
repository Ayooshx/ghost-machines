import { on, prefersReducedMotion } from '../core/dom.js';

const LAYERS = [
  { count: 150, size: 1,   depth: 4,  dur: 7 },
  { count: 60,  size: 1.5, depth: 9,  dur: 5 },
  { count: 18,  size: 2.5, depth: 16, dur: 9 },
];
// Mostly white, some cyan and amber tints
const TINTS = ['232,238,249', '232,238,249', '232,238,249', '232,238,249', '232,238,249', '170,230,255', '170,230,255', '255,214,160'];

function seeded(seed) { // mulberry32: same sky on every load
  return () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

/** Stars are box-shadows in vw/vh units, so they stay put on resize. */
export function initStarfield(root) {
  const rand = seeded(1969);
  const layers = LAYERS.map((cfg, i) => {
    const node = document.createElement('div');
    node.className = 'star-layer';
    node.style.width = node.style.height = `${cfg.size}px`;
    node.style.setProperty('--twinkle-dur', `${cfg.dur}s`);
    node.style.setProperty('--twinkle-delay', `${-i * 2.3}s`);
    node.style.boxShadow = Array.from({ length: cfg.count }, () => {
      const x = (rand() * 104 - 2).toFixed(2), y = (rand() * 104 - 2).toFixed(2);
      const tint = TINTS[Math.floor(rand() * TINTS.length)], a = (0.4 + rand() * 0.55).toFixed(2);
      return `${x}vw ${y}vh 0 rgba(${tint},${a})`;
    }).join(',');
    root.append(node);
    return { node, depth: cfg.depth };
  });

  on(document, 'visibilitychange', () => root.classList.toggle('is-paused', document.hidden));

  // Gentle pointer parallax (fine pointers only, never with reduced motion)
  if (prefersReducedMotion() || !matchMedia('(pointer: fine)').matches) return;
  let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
  const tick = () => {
    cx += (tx - cx) * 0.06; cy += (ty - cy) * 0.06;
    layers.forEach((l) => { l.node.style.transform = `translate3d(${(-cx * l.depth).toFixed(2)}px,${(-cy * l.depth).toFixed(2)}px,0)`; });
    raf = Math.abs(tx - cx) > 0.001 || Math.abs(ty - cy) > 0.001 ? requestAnimationFrame(tick) : 0;
  };
  on(window, 'pointermove', (e) => {
    tx = (e.clientX / innerWidth - 0.5) * 2; ty = (e.clientY / innerHeight - 0.5) * 2;
    raf ||= requestAnimationFrame(tick);
  });
}
