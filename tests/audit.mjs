// Dev-only release audit. Run from the project folder:  node tests/audit.mjs
// Opens every screen state of the real app in a DOM stand-in and checks accessibility structure, navigation and errors.
// It cannot judge appearance, layout or real screen-reader behaviour: those need a browser.
import { installDom, N } from './dom-shim.mjs';
const dom = installDom(); const { body, loc, mem } = dom;
const errors = []; process.on('uncaughtException', (e) => { errors.push(e); console.log('UNCAUGHT:', e.stack.split('\n').slice(0, 3).join(' | ')); });
const base = new URL('../js/', import.meta.url).href;
const { store } = await import(base + 'core/store.js');
const { ARTIFACT_IDS, getArtifact } = await import(base + 'data/artifacts.js');
const { CHAPTERS } = await import(base + 'data/visualNovelData.js');
await import(base + 'main.js');
dom.setReducedMotion(true);

const click = (n) => n.dispatchEvent({ type: 'click' });
const all = (sel, root = body) => root.querySelectorAll(sel);
const issues = []; let scans = 0, elements = 0;
const nameOf = (n) => (n.getAttribute('aria-label') || n.getAttribute('title') || n.textContent || '').trim();

function scan(label) {
  scans++;
  const add = (msg) => issues.push(`[${label}] ${msg}`);
  const everything = [...body.walk()]; elements += everything.length;
  // ids unique, and every reference points at something real
  const ids = new Map(); for (const n of everything) if (n.attrs.id) ids.set(n.attrs.id, (ids.get(n.attrs.id) ?? 0) + 1);
  for (const [id, c] of ids) if (c > 1) add(`duplicate id "${id}" x${c}`);
  for (const n of everything) for (const a of ['aria-labelledby', 'aria-controls', 'aria-describedby']) {
    const v = n.attrs[a]; if (v) for (const ref of v.split(/\s+/)) if (!ids.has(ref)) add(`${n.tagName}.${n.className || '-'} ${a}="${ref}" points at nothing`);
  }
  for (const n of everything) {
    const tag = n.tagName;
    if ((tag === 'BUTTON' || tag === 'A') && !nameOf(n) && !n.querySelector?.('svg')) add(`${tag}.${n.className || '-'} has no accessible name`);
    if (tag === 'BUTTON' && !n.attrs.type) add(`button "${nameOf(n).slice(0, 30)}" has no type`);
    if (tag === 'IMG' && !('alt' in n.attrs)) add('img without alt');
    if (tag === 'INPUT' && !(n.attrs['aria-label'] || n.closest('label'))) add('input without a label');
    if (n.attrs.tabindex && Number(n.attrs.tabindex) > 0) add(`positive tabindex on ${tag}`);
    if (tag === 'A' && n.attrs.target === '_blank' && !/noopener/.test(n.attrs.rel ?? '')) add(`external link "${nameOf(n).slice(0, 30)}" lacks rel=noopener`);
    if (n.attrs.role === 'progressbar' && n.attrs['aria-valuenow'] === undefined && !n.attrs['aria-label']) add('progressbar without value or label');
    if (tag === 'PROGRESS' && !n.attrs['aria-label']) add('<progress> without a label');
    if (tag === 'DIALOG' && n.open && !(n.attrs['aria-labelledby'] || n.attrs['aria-label'])) add('open dialog without a name');
    if (/^H[1-6]$/.test(tag) && !n.textContent.trim()) add(`empty ${tag}`);
  }
}
const visibleHeadings = (root) => [...root.walk()].filter((n) => /^H[1-6]$/.test(n.tagName)).map((n) => Number(n.tagName[1]));
function headingOrder(label, root) { const h = visibleHeadings(root); for (let i = 1; i < h.length; i++) if (h[i] > h[i - 1] + 1) issues.push(`[${label}] heading level jumps h${h[i - 1]} -> h${h[i]}`); }

// ---------- landing, explorer, all eight dossiers ----------
scan('landing');
loc.hash = '#/landing'; scan('landing (after nav)');
loc.hash = '#/moon'; scan('explorer: Moon');
loc.hash = '#/mars'; scan('explorer: Mars');
const hrefs = new Set();
for (const id of ARTIFACT_IDS) {
  loc.hash = `#/${getArtifact(id).world}/${id}`;
  click(body.querySelector('[data-open]'));
  const dlg = body.querySelector('[data-dossier]');
  scan(`dossier: ${id}`); headingOrder(`dossier ${id}`, dlg);
  if (!dlg.open) issues.push(`[dossier ${id}] did not open`);
  const sec = [...dlg.walk()].filter((n) => n.tagName === 'SECTION' || n.tagName === 'ASIDE').length;
  if (sec < 6) issues.push(`[dossier ${id}] only ${sec} sections rendered`);
  for (const a of dlg.querySelectorAll('a')) if (a.attrs.href) hrefs.add(a.attrs.href);
  dlg.close();
}
// ---------- log, quiz, badge ----------
click(body.querySelector('[data-open-log]')); scan('expedition log'); headingOrder('log', body.querySelector('[data-log]')); body.querySelector('[data-log]').close();
for (const id of ARTIFACT_IDS) for (const s of ['opened', 'read', 'transmission', 'both-sites']) store.recordStep(id, s);
store.recordQuizResult({ correct: 7, total: 10 });   // earn the badge first, so the results screen AND the badge screen both contain a badge panel
loc.hash = '#/quiz'; scan('quiz intro');
click([...body.querySelector('[data-quiz-root]').walk()].find((n) => n.tagName === 'BUTTON' && /Start the challenge|Take the challenge again/.test(n.textContent))); scan('quiz question');
const qroot = body.querySelector('[data-quiz-root]');
for (let i = 0; i < 10; i++) { click(qroot.querySelectorAll('.opt')[0]); if (i === 0) scan('quiz feedback'); click([...qroot.walk()].find((n) => n.tagName === 'BUTTON' && /Next question|See my results/.test(n.textContent))); }
scan('quiz results');
loc.hash = '#/badge'; scan('badge screen (quiz results still in the DOM)');
// ---------- story ----------
loc.hash = '#/story'; scan('story: chapter select'); headingOrder('story select', body.querySelector('[data-vn-root]'));
loc.hash = '#/story/ch1'; const vn = () => body.querySelector('[data-vn-root]'); scan('story: title card');
const step = () => { const t = vn().querySelector('.vn__titlecard'); if (t) { click([...t.walk()].find((n) => n.tagName === 'BUTTON')); return; }
  const next = vn().querySelector('.vn__next'), spots = vn().querySelectorAll('.vn__spot');
  if (spots.length && next.disabled) { const u = spots.find((s) => s.dataset.seen !== 'true'); if (u) { click(u); return; } }
  const c = vn().querySelectorAll('.vn__choice').find((x) => !x.disabled); if (c) { click(c); return; } if (next && !next.hidden && !next.disabled) click(next); };
const seenScenes = new Set();
for (let i = 0; i < 80 && !vn().querySelector('.vn__card--complete'); i++) {
  step();
  const k = vn().querySelector('.vn__spot') ? 'explore' : vn().querySelector('.vn__card--evidence') ? 'evidence' : vn().querySelector('.vn__card--history') ? 'history' : vn().querySelector('.vn__choice') ? 'choice' : 'dialogue';
  if (!seenScenes.has(k)) { seenScenes.add(k); scan(`story: ${k} scene`); }
  if (k === 'explore' && !seenScenes.has('info') && vn().querySelector('.vn__info') && !vn().querySelector('.vn__info').hidden) { seenScenes.add('info'); scan('story: hotspot notes'); }
}
scan('story: chapter complete'); headingOrder('story complete', vn());
loc.hash = '#/story'; click(vn().querySelector('.vn__voice') ?? new N('a')); 

// ---------- navigation: every in-app link must land somewhere sensible ----------
const links = new Set(); for (const a of body.querySelectorAll('a')) { const h = a.attrs.href; if (h?.startsWith('#/')) links.add(h); }
const bad = []; for (const h of links) { loc.hash = h; const s = body.dataset.screen; if (!['landing', 'moon', 'mars', 'story', 'quiz', 'badge'].includes(s)) bad.push(`${h} -> ${s}`); }
for (const h of ['#/', '#', '#/nonsense', '#/moon/not-an-artifact', '#/mars/surveyor-3', '#/moon/surveyor-3/not-an-event', '#/story/ch99']) { loc.hash = h; if (!body.dataset.screen) bad.push(`${h} -> no screen`); }
loc.hash = '#/mars/surveyor-3'; if (body.dataset.screen !== 'moon') bad.push('artifact deep link in the wrong world did not correct itself');
for (const h of hrefs) if (h.startsWith('http') && !/^https:\/\//.test(h)) bad.push(`insecure link ${h}`);
console.log(`scanned ${scans} screen states, ${elements} elements, ${links.size} in-app links, ${hrefs.size} external links`);
console.log(issues.length ? issues.map((i) => ' - ' + i).join('\n') : 'accessibility structure: no issues found');
console.log(bad.length ? 'navigation problems:\n' + bad.map((b) => ' - ' + b).join('\n') : 'navigation: every link and malformed URL resolves to a valid screen');
console.log(errors.length ? `${errors.length} uncaught error(s)` : 'no uncaught errors');
process.exit(issues.length || bad.length || errors.length ? 1 : 0);
