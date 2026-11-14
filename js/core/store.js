/**
 * Single source of truth for expedition progress.
 * Everything (HUD, maps, dossiers, quiz gate, badge) reads from here; nothing else persists progress.
 * Persisted under ONE localStorage key. Derived values (status, quiz unlock, badge) are computed, never stored,
 * so they cannot drift out of sync.
 */
import { ARTIFACT_IDS, getArtifact } from '../data/artifacts.js';

export const STORAGE_KEY = 'ghostMachines:v1';
export const BADGE_TITLE = 'Junior Space Archaeologist';
export const PASS_PERCENT = 70;
export const STEPS = Object.freeze(['opened', 'read', 'transmission', 'both-sites']);
export const BASE_STEPS = Object.freeze(['opened', 'read', 'transmission']);

const emptyState = () => ({ v: 1, artifacts: {}, quiz: { best: null, attempts: 0, earnedAt: null }, player: { name: '' } });
const isoOrNull = (s) => (typeof s === 'string' && !Number.isNaN(Date.parse(s)) ? s : null);
const passes = (correct, total) => total > 0 && correct * 100 >= PASS_PERCENT * total;

/** Rebuild a clean state from untrusted stored data. */
function sanitize(raw) {
  const s = emptyState();
  if (!raw || typeof raw !== 'object') return s;
  for (const id of ARTIFACT_IDS) {
    const e = raw.artifacts?.[id];
    if (!e || !Array.isArray(e.steps)) continue;
    const steps = [...new Set(e.steps.filter((x) => STEPS.includes(x)))];
    if (steps.length) s.artifacts[id] = { steps, firstOpenedAt: isoOrNull(e.firstOpenedAt) };
  }
  const q = raw.quiz, b = q?.best;
  if (Number.isInteger(q?.attempts) && q.attempts >= 0) s.quiz.attempts = q.attempts;
  if (b && Number.isInteger(b.correct) && Number.isInteger(b.total) && b.total > 0 && b.correct >= 0 && b.correct <= b.total) {
    s.quiz.best = { correct: b.correct, total: b.total, at: isoOrNull(b.at) };
    if (passes(b.correct, b.total)) s.quiz.earnedAt = isoOrNull(q.earnedAt) ?? s.quiz.best.at;
  }
  if (typeof raw.player?.name === 'string') s.player.name = cleanName(raw.player.name);
  return s;
}
const cleanName = (n) => String(n ?? '').replace(/[\u0000-\u001f\u007f]/g, '').replace(/\s+/g, ' ').trim().slice(0, 40);

class Store extends EventTarget {
  #state;
  #persistent = true;

  constructor() {
    super();
    this.#state = this.#load();
    // Keep multiple tabs consistent.
    addEventListener('storage', (e) => {
      if (e.key === STORAGE_KEY || e.key === null) { this.#state = this.#load(); this.#emit('change', { reason: 'sync' }); }
    });
  }

  get persistent() { return this.#persistent; }
  get total() { return ARTIFACT_IDS.length; }

  // ---- Artifact discovery -------------------------------------------------
  requiredSteps(id) { return [...BASE_STEPS, ...(getArtifact(id)?.extraSteps ?? [])]; }
  getSteps(id) { return [...(this.#state.artifacts[id]?.steps ?? [])]; }

  /** 'undiscovered' | 'opened' | 'cataloged', derived from recorded steps. */
  getStatus(id) {
    const steps = this.#state.artifacts[id]?.steps;
    if (!steps?.length) return 'undiscovered';
    return this.requiredSteps(id).every((s) => steps.includes(s)) ? 'cataloged' : 'opened';
  }
  isCataloged(id) { return this.getStatus(id) === 'cataloged'; }
  get catalogedCount() { return ARTIFACT_IDS.filter((id) => this.isCataloged(id)).length; }

  /** Record that the visitor did one exploration step. Any step implies the dossier was opened. */
  recordStep(id, step) {
    if (!ARTIFACT_IDS.includes(id) || !STEPS.includes(step)) return false;
    const before = this.getStatus(id), beforeUnlocked = this.isQuizUnlocked();
    const entry = (this.#state.artifacts[id] ??= { steps: [], firstOpenedAt: null });
    const added = ['opened', step].filter((s, i, a) => a.indexOf(s) === i && !entry.steps.includes(s));
    if (!added.length) return false;
    entry.steps.push(...added);
    entry.firstOpenedAt ??= new Date().toISOString();
    this.#commit('step', { id, step });
    if (before !== 'cataloged' && this.isCataloged(id)) this.#emit('cataloged', { id, count: this.catalogedCount });
    if (!beforeUnlocked && this.isQuizUnlocked()) this.#emit('quiz-unlocked');
    return true;
  }

  // ---- Quiz and badge -----------------------------------------------------
  isQuizUnlocked() { return this.catalogedCount === this.total; }
  get bestQuiz() {
    const b = this.#state.quiz.best;
    return b ? { ...b, percent: Math.round((100 * b.correct) / b.total) } : null;
  }
  hasBadge() { const b = this.#state.quiz.best; return !!b && passes(b.correct, b.total); }

  /** Returns null if the quiz is locked. The highest score is retained; the badge is earned once. */
  recordQuizResult({ correct, total }) {
    if (!this.isQuizUnlocked() || !Number.isInteger(correct) || !Number.isInteger(total) || total < 1 || correct < 0 || correct > total) return null;
    const q = this.#state.quiz, hadBadge = this.hasBadge();
    q.attempts += 1;
    const isNewBest = !q.best || correct / total > q.best.correct / q.best.total;
    const now = new Date().toISOString();
    if (isNewBest) q.best = { correct, total, at: now };
    if (this.hasBadge() && !q.earnedAt) q.earnedAt = now;
    this.#commit('quiz', {});
    const badgeJustEarned = !hadBadge && this.hasBadge();
    if (badgeJustEarned) this.#emit('badge-earned');
    return { percent: Math.round((100 * correct) / total), passed: passes(correct, total), isNewBest, badgeJustEarned };
  }

  /** Data for the certificate, or null until the badge is earned. */
  getBadgeInfo() {
    if (!this.hasBadge()) return null;
    const q = this.#state.quiz;
    return { title: BADGE_TITLE, ...this.bestQuiz, earnedAt: q.earnedAt, name: this.#state.player.name };
  }

  // ---- Player (optional, name only) --------------------------------------
  get playerName() { return this.#state.player.name; }
  setPlayerName(name) { this.#state.player.name = cleanName(name); this.#commit('player', {}); }

  reset() { this.#state = emptyState(); this.#commit('reset', {}); }

  // ---- Internals ----------------------------------------------------------
  #load() {
    try { return sanitize(JSON.parse(localStorage.getItem(STORAGE_KEY))); }
    catch { return emptyState(); }
  }
  #commit(reason, detail) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(this.#state)); this.#persistent = true; }
    catch { this.#persistent = false; } // private mode / quota: keep working in memory
    this.#emit('change', { reason, ...detail });
  }
  #emit(type, detail = {}) { this.dispatchEvent(new CustomEvent(type, { detail })); }
}

export const store = new Store();
