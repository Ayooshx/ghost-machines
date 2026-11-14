import { store, BADGE_TITLE } from '../core/store.js';
import { el, on, qs } from '../core/dom.js';

const fmtDate = (iso) => (iso ? new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : '');
let uid = 0;

/** The badge illustration: a small rover and its glowing "ghost" echo inside a ringed medal. Original artwork. */
export function badgeSvg({ display = 'Georgia, serif', ui = 'system-ui, sans-serif' } = {}) {
  const n = `b${(uid += 1)}`; // unique ids, so several badges can share a page
  const stars = [[48, 58, 1.2], [152, 52, 1], [62, 138, 1], [144, 140, 1.3], [100, 40, 0.9], [36, 104, 0.9], [164, 100, 0.9]]
    .map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#e8eef9" opacity=".75"/>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" role="img" aria-label="Achievement badge: Junior Space Archaeologist. A small rover with a glowing echo inside a ringed medal.">
<defs>
  <radialGradient id="${n}bg" cx="50%" cy="40%" r="70%"><stop offset="0" stop-color="#16295a"/><stop offset=".7" stop-color="#0a1226"/><stop offset="1" stop-color="#04060c"/></radialGradient>
  <linearGradient id="${n}ring" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffd28a"/><stop offset=".5" stop-color="#ffb454"/><stop offset="1" stop-color="#b8661f"/></linearGradient>
  <radialGradient id="${n}glow"><stop offset="0" stop-color="#5ad8ff" stop-opacity=".4"/><stop offset="1" stop-color="#5ad8ff" stop-opacity="0"/></radialGradient>
  <path id="${n}top" d="M 24,100 A 76,76 0 0 1 176,100"/>
  <path id="${n}bot" d="M 32,100 A 68,68 0 0 0 168,100"/>
  <g id="${n}rover" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M-20 4h40l-5-11h-30z"/><path d="M-6 -7v-11h9"/><path d="M10 -7l7 -7"/><circle cx="19" cy="-15" r="2"/>
    <circle cx="-13" cy="10" r="5"/><circle cx="0" cy="10" r="5"/><circle cx="13" cy="10" r="5"/>
  </g>
</defs>
<circle cx="100" cy="100" r="97" fill="url(#${n}ring)"/>
<circle cx="100" cy="100" r="91" fill="url(#${n}bg)"/>
<circle cx="100" cy="100" r="62" fill="url(#${n}glow)"/>
<circle cx="100" cy="100" r="84" fill="none" stroke="#5ad8ff" stroke-opacity=".35" stroke-dasharray="1.5 4"/>
<ellipse cx="100" cy="104" rx="80" ry="24" fill="none" stroke="#5ad8ff" stroke-opacity=".3" transform="rotate(-22 100 104)"/>
<circle cx="31" cy="128" r="3.2" fill="#ffb454"/>
${stars}
<path d="M44 134 Q100 120 156 134" fill="none" stroke="#5ad8ff" stroke-opacity=".5" stroke-width="1.4"/>
<use href="#${n}rover" color="#5ad8ff" opacity=".4" transform="translate(95 106)"/>
<use href="#${n}rover" color="#ffb454" transform="translate(100 110)"/>
<text font-family="${display}" font-size="10.5" font-weight="700" letter-spacing="1.7" fill="#ffd28a"><textPath href="#${n}top" startOffset="50%" text-anchor="middle">JUNIOR SPACE ARCHAEOLOGIST</textPath></text>
<text font-family="${ui}" font-size="7.5" letter-spacing="3" fill="#8fd8ee"><textPath href="#${n}bot" startOffset="50%" text-anchor="middle">GHOST MACHINES</textPath></text>
</svg>`;
}

/** Draws the certificate with the Canvas API and downloads it as a PNG. Needs no server or account. */
export async function downloadCertificate(info) {
  const W = 1600, H = 1000;
  const display = '"Cormorant Garamond", Georgia, "Times New Roman", serif';
  const ui = '"IBM Plex Sans", system-ui, "Segoe UI", sans-serif';
  const mono = '"IBM Plex Mono", ui-monospace, Menlo, Consolas, monospace';
  try { await document.fonts?.ready; } catch { /* fall back to system fonts */ }

  const canvas = el('canvas'); canvas.width = W; canvas.height = H;
  const c = canvas.getContext('2d');
  const bg = c.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#04060c'); bg.addColorStop(0.6, '#0a1226'); bg.addColorStop(1, '#12204a');
  c.fillStyle = bg; c.fillRect(0, 0, W, H);

  let seed = 1969; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };  // same sky every time
  for (let i = 0; i < 170; i += 1) { c.globalAlpha = 0.25 + rnd() * 0.6; c.fillStyle = rnd() > 0.85 ? '#5ad8ff' : '#e8eef9'; c.beginPath(); c.arc(rnd() * W, rnd() * H, 0.6 + rnd() * 1.4, 0, 6.283); c.fill(); }
  c.globalAlpha = 1;
  c.lineWidth = 2; c.strokeStyle = 'rgba(90,216,255,.55)'; c.strokeRect(40, 40, W - 80, H - 80);
  c.strokeStyle = 'rgba(255,180,84,.4)'; c.lineWidth = 1; c.strokeRect(58, 58, W - 116, H - 116);

  // Badge artwork (the same SVG, drawn through an image)
  const img = new Image();
  img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(badgeSvg({ display: 'Georgia, serif', ui: 'Arial, sans-serif' }))}`;
  await new Promise((res) => { img.onload = res; img.onerror = res; });
  c.drawImage(img, 130, 280, 440, 440);

  const x = 680;
  const text = (s, y, font, color, spacing = '0px') => { c.font = font; c.fillStyle = color; if ('letterSpacing' in c) c.letterSpacing = spacing; c.fillText(s, x, y); if ('letterSpacing' in c) c.letterSpacing = '0px'; };
  c.textBaseline = 'alphabetic'; c.textAlign = 'left';
  text('GHOST MACHINES', 210, `500 26px ${mono}`, '#8fd8ee', '6px');
  text('CERTIFICATE OF ACHIEVEMENT', 262, `400 22px ${mono}`, '#8a9bb8', '4px');
  text('JUNIOR SPACE', 400, `600 112px ${display}`, '#ffd28a', '6px');
  text('ARCHAEOLOGIST', 515, `600 112px ${display}`, '#ffd28a', '6px');

  let y = 600;
  if (info.name) {
    let size = 54; c.font = `italic 400 ${size}px ${display}`;
    while (c.measureText(info.name).width > W - x - 120 && size > 28) { size -= 2; c.font = `italic 400 ${size}px ${display}`; }
    text(`Awarded to ${info.name}`, y, `italic 400 ${size}px ${display}`, '#e8eef9'); y += 80;
  }
  text(`Best score: ${info.correct} / ${info.total} (${info.percent}%)`, y + 10, `500 34px ${ui}`, '#e8eef9');
  text(`Completed: ${fmtDate(info.earnedAt)}`, y + 62, `400 30px ${ui}`, '#c3cee2');
  text('For exploring the eight machines NASA left behind on the Moon and Mars.', 830, `italic 400 28px ${display}`, '#8a9bb8');
  text('Unofficial educational project. Not affiliated with or endorsed by NASA.', 900, `400 20px ${mono}`, '#5b6b88');

  const blob = await new Promise((res) => canvas.toBlob(res, 'image/png'));
  const a = el('a', { download: 'junior-space-archaeologist-certificate.png', href: blob ? URL.createObjectURL(blob) : canvas.toDataURL('image/png') });
  document.body.append(a); a.click(); a.remove();
  if (blob) setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}

/** The achievement panel: badge, title, best score, date, optional name, certificate download. */
export function createBadgePanel() {
  const info = store.getBadgeInfo();
  if (!info) return { element: el('p', { class: 'badge-note', text: 'Score 70% or more on the quiz to earn this badge.' }), destroy() {} };

  const input = el('input', { type: 'text', maxlength: '40', autocomplete: 'off', value: info.name, 'aria-describedby': 'badge-name-hint' });
  const art = el('div', { class: 'badge-art' }); art.innerHTML = badgeSvg({ display: "'Cormorant Garamond', Georgia, serif", ui: "'IBM Plex Sans', system-ui, sans-serif" });
  const save = () => { if (input.value.trim() !== store.playerName) store.setPlayerName(input.value); };
  on(input, 'change', save);
  const download = el('button', { class: 'btn btn--amber', type: 'button', text: 'Download certificate (PNG)' });
  const note = el('p', { class: 'badge-note', role: 'status', 'aria-live': 'polite', text: 'Saved on this device only. No account needed.' });
  on(download, 'click', async () => {
    save();
    download.disabled = true; note.textContent = 'Making your certificate…';
    try { await downloadCertificate(store.getBadgeInfo()); note.textContent = 'Certificate downloaded.'; }
    catch { note.textContent = 'Sorry, the certificate could not be created in this browser.'; }
    download.disabled = false;
  });

  const element = el('div', { class: 'badge-panel' }, art,
    el('div', { class: 'badge-info' },
      el('p', { class: 'panel__eyebrow', text: 'Achievement' }),
      el('h3', { class: 'badge-title', text: BADGE_TITLE.toUpperCase() }),
      el('dl', { class: 'panel__facts' },
        el('div', {}, el('dt', { text: 'Best score' }), el('dd', { text: `${info.correct} / ${info.total} (${info.percent}%)` })),
        el('div', {}, el('dt', { text: 'Date completed' }), el('dd', { text: fmtDate(info.earnedAt) }))),
      el('label', { class: 'badge-name' }, el('span', { text: 'Name on certificate (optional)' }), input),
      el('p', { id: 'badge-name-hint', class: 'sr-only', text: 'Optional. Leave blank for a certificate without a name.' }),
      download, note));
  return { element, destroy() {} };
}

/** The Badge screen (#/badge): only reachable once the badge is earned. */
export function initBadgeScreen(router) {
  const root = qs('[data-badge-root]');
  router.addEventListener('route', (e) => {
    if (e.detail.screen !== 'badge') return;
    const panel = createBadgePanel();
    root.replaceChildren(el('div', { class: 'glass badge-card' }, panel.element),
      el('p', { class: 'quiz__links' }, el('a', { class: 'btn', href: '#/quiz', text: 'Retake the quiz' }), el('a', { class: 'btn btn--amber', href: '#/moon', text: 'Back to exploring' })));
  });
}
