// Dev-only. A tiny browser stand-in that parses the REAL index.html, so tests can run the real app in Node with no packages.
import fs from 'fs';
class T { constructor(t) { this.nodeType = 3; this.t = t; } get textContent() { return this.t; } }
const camel = (k) => k.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
export class N {
  constructor(tag) { this.tagName = tag.toUpperCase(); this.children = []; this.attrs = {}; this.dataset = {}; this.L = {}; this.cls = new Set(); this._t = ''; this.hidden = false; this.disabled = false;
    this.style = { setProperty(k, v) { this[k] = v; } }; this.nodeType = 1; this.parentElement = null; this.scrollTop = 0; this.offsetLeft = 0; this.offsetWidth = 100; this.clientWidth = 800; this.clientHeight = 450; this.scrollWidth = 800; this.open = false; this.title = ''; this.tabIndex = 0; this.value = ''; }
  set className(v) { this.cls = new Set(String(v).split(/\s+/).filter(Boolean)); } get className() { return [...this.cls].join(' '); }
  get classList() { const s = this.cls; return { add: (c) => s.add(c), remove: (c) => s.delete(c), contains: (c) => s.has(c), toggle: (c, f) => ((f ?? !s.has(c)) ? s.add(c) : s.delete(c)) }; }
  adopt(c) { if (c.nodeType === 1) c.parentElement = this; return c; }
  append(...k) { for (const c of k) this.children.push(this.adopt(typeof c === 'string' ? new T(c) : c)); }
  appendChild(c) { this.append(c); return c; } prepend(c) { this.children.unshift(this.adopt(c)); }
  remove() { const p = this.parentElement; if (p) p.children = p.children.filter((c) => c !== this); }
  replaceChildren(...k) { this.children = []; this._t = ''; this.append(...k); }
  set textContent(v) { this.children = []; this._t = String(v); } get textContent() { return this._t + this.children.map((c) => c.textContent).join(''); }
  set innerHTML(v) { this._h = v; } get firstChild() { return this.children[0]; } get lastChild() { return this.children.at(-1); }
  insertAdjacentHTML() {}
  setAttribute(k, v) { this.attrs[k] = String(v); if (k === 'class') this.className = v; if (k === 'hidden') this.hidden = true; if (k.startsWith('data-')) this.dataset[camel(k.slice(5))] = String(v); }
  getAttribute(k) { return this.attrs[k] ?? null; } removeAttribute(k) { delete this.attrs[k]; } hasAttribute(k) { return k in this.attrs; }
  toggleAttribute(k, f) { (f ?? !(k in this.attrs)) ? this.attrs[k] = '' : delete this.attrs[k]; }
  addEventListener(t, f) { (this.L[t] ??= []).push(f); } removeEventListener(t, f) { this.L[t] = (this.L[t] ?? []).filter((x) => x !== f); }
  dispatchEvent(e) { e.target ??= this; (this.L[e.type] ?? []).slice().forEach((f) => f(e)); return true; }
  focus() { N.focused = this; } scrollTo() {} scrollIntoView() {} showModal() { this.open = true; } close() { this.open = false; this.dispatchEvent({ type: 'close' }); }
  getBoundingClientRect() { return { width: 300, height: 56 }; } getContext() { return new Proxy({}, { get: () => () => ({ addColorStop() {} }) }); }
  closest(sel) { let n = this; while (n) { if (n.match?.(sel)) return n; n = n.parentElement; } return null; }
  *walk() { for (const c of this.children) if (c.nodeType === 1) { yield c; yield* c.walk(); } }
  match(sel) {
    let m;
    if (sel.startsWith('.')) return this.cls.has(sel.slice(1));
    if (sel.startsWith('#')) return this.attrs.id === sel.slice(1);
    if ((m = sel.match(/^\[([\w-]+)(?:="([^"]*)")?\]$/))) return m[1] in this.attrs && (m[2] === undefined || this.attrs[m[1]] === m[2]);
    return this.tagName === sel.toUpperCase();
  }
  querySelector(sel) { for (const n of this.walk()) if (n.match(sel)) return n; return null; }
  querySelectorAll(sel) { return [...this.walk()].filter((n) => n.match(sel)); }
}
const VOID = new Set(['link', 'meta', 'input', 'br', 'hr', 'img']);
function parse(html) {
  const root = new N('body'); const stack = [root]; const re = /<!--[\s\S]*?-->|<(\/?)([a-zA-Z][\w-]*)((?:\s+[^\s>=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?)*)\s*\/?>|([^<]+)/g; let m, skipUntil = null;
  while ((m = re.exec(html))) {
    if (m[0].startsWith('<!--')) continue;
    if (m[4] !== undefined) { if (!skipUntil && m[4].trim()) stack.at(-1).append(m[4].trim().replace(/\s+/g, ' ')); continue; }
    const [, close, tag, attrs] = m; const t = tag.toLowerCase();
    if (skipUntil) { if (close && t === skipUntil) skipUntil = null; continue; }
    if (close) { stack.pop(); continue; }
    const n = new N(t); stack.at(-1).append(n);
    for (const a of attrs.matchAll(/([^\s>=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) n.setAttribute(a[1], a[2] ?? a[3] ?? a[4] ?? '');
    if (t === 'script' || t === 'noscript') skipUntil = t; else if (!VOID.has(t)) stack.push(n);
  }
  return root;
}

/** Installs browser globals and returns handles for the test. Call once, then import js/main.js. */
export function installDom() {
  const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const body = parse(html.slice(html.indexOf('<body'), html.indexOf('</body>')).replace(/^<body[^>]*>/, ''));
  const hashListeners = []; const mem = {};
  const loc = { _h: '', get hash() { return this._h; }, set hash(v) { this._h = v.startsWith('#') ? v : `#${v}`; hashListeners.forEach((f) => f({})); }, hostname: 'localhost', search: '' };
  const state = { reduced: false };
  Object.assign(globalThis, {
    window: globalThis, location: loc, history: { replaceState: (_s, _t, h) => { loc._h = h; } },
    addEventListener: (t, f) => { if (t === 'hashchange') hashListeners.push(f); },
    document: { body, title: '', createElement: (t) => new N(t), querySelector: (s) => body.querySelector(s), querySelectorAll: (s) => body.querySelectorAll(s), addEventListener() {}, hidden: false, get activeElement() { return N.focused; }, fonts: { ready: Promise.resolve() } },
    matchMedia: (q) => ({ matches: /reduce/.test(q) ? state.reduced : false }),
    ResizeObserver: class { observe() {} disconnect() {} }, IntersectionObserver: class { observe() {} disconnect() {} },
    requestAnimationFrame: () => 0, cancelAnimationFrame: () => {}, innerWidth: 1200, innerHeight: 800, devicePixelRatio: 1,
    localStorage: { getItem: (k) => mem[k] ?? null, setItem: (k, v) => { mem[k] = v; } }, confirm: () => true,
  });
  body.dataset.screen = 'landing';
  return { body, loc, mem, setReducedMotion: (v) => { state.reduced = v; } };
}
