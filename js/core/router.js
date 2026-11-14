import { getArtifact } from '../data/artifacts.js';
import { store } from './store.js';
import { on } from './dom.js';

/** world: which atmosphere to show. null keeps the last world (or Moon). */
export const SCREENS = Object.freeze({
  landing:  { title: 'GHOST MACHINES', world: 'deep' },
  moon:     { title: 'The Moon', world: 'moon' },
  mars:     { title: 'Mars', world: 'mars' },
  quiz:     { title: 'Junior Space Archaeologist quiz', world: null },
  badge:    { title: 'Expedition complete', world: null },
});

export const hashFor = (screen, artifactId) => `#/${screen}${artifactId ? `/${encodeURIComponent(artifactId)}` : ''}`;

function parse(hash) {
  let parts = [];
  try { parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent); } catch { /* malformed */ }
  return { screen: parts[0] ?? 'landing', artifactId: parts[1] ?? null };
}

/** Turn a requested route into a valid, allowed one. */
function resolve({ screen, artifactId }) {
  if (!(screen in SCREENS)) return { screen: 'landing', artifactId: null };
  if (artifactId) {
    const a = getArtifact(artifactId);
    if (!a || (screen !== 'moon' && screen !== 'mars')) artifactId = null;
    else screen = a.world; // deep links land on the artifact's own world
  }
  if (screen === 'quiz' && !store.isQuizUnlocked()) return { screen: 'moon', artifactId: null, redirectedFrom: 'quiz' };
  if (screen === 'badge' && !store.hasBadge()) return { screen: store.isQuizUnlocked() ? 'quiz' : 'moon', artifactId: null, redirectedFrom: 'badge' };
  return { screen, artifactId };
}

/** Emits 'route' with { screen, artifactId, previous, redirectedFrom }. */
export class Router extends EventTarget {
  #screens; #announcer; #current = null; #world = 'moon'; #first = true;

  constructor({ screens, announcer }) { super(); this.#screens = screens; this.#announcer = announcer; }
  get current() { return this.#current; }
  /** replace: true updates the URL without adding a history entry (used for marker selection). */
  go(screen, artifactId, { replace = false } = {}) {
    const h = hashFor(screen, artifactId);
    if (replace) { history.replaceState(null, '', h); this.#sync(); } else location.hash = h;
  }

  start() {
    on(window, 'hashchange', () => this.#sync());
    store.addEventListener('change', () => this.#sync()); // re-check gates (e.g. after reset)
    this.#sync();
  }

  #sync() {
    const target = resolve(parse(location.hash));
    const canonical = hashFor(target.screen, target.artifactId);
    if (location.hash !== canonical) history.replaceState(null, '', canonical);
    const prev = this.#current;
    if (prev && prev.screen === target.screen && prev.artifactId === target.artifactId) return;
    this.#current = { screen: target.screen, artifactId: target.artifactId };
    if (!prev || prev.screen !== target.screen) this.#activate(target.screen, prev?.screen);
    this.dispatchEvent(new CustomEvent('route', { detail: { ...this.#current, previous: prev, redirectedFrom: target.redirectedFrom ?? null } }));
  }

  #activate(name, from) {
    const meta = SCREENS[name];
    if (meta.world && meta.world !== 'deep') this.#world = meta.world;
    document.body.dataset.screen = name;
    document.body.dataset.world = meta.world === 'deep' ? 'deep' : this.#world;
    document.title = name === 'landing' ? 'GHOST MACHINES · A Tour of NASA’s Left-Behind Explorers' : `${meta.title} · GHOST MACHINES`;
    const active = this.#screens.get(name);
    for (const node of new Set(this.#screens.values())) {
      node.classList.toggle('is-active', node === active);
      node.toggleAttribute('inert', node !== active);
    }
    if (this.#announcer) this.#announcer.textContent = meta.title;
    // Moon <-> Mars share one console: keep scroll and focus where they are.
    if (!(from && this.#screens.get(from) === active)) {
      active.scrollTop = 0;
      if (!this.#first) (active.querySelector('[data-screen-title]') ?? active).focus({ preventScroll: true });
    }
    this.#first = false;
  }
}
