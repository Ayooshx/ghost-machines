/**
 * Single source of truth for expedition progress.
 * Everything (HUD, maps, dossiers, quiz gate, badge) reads from here; nothing else persists progress.
 * Persisted under ONE localStorage key. Derived values (status, quiz unlock, badge) are computed, never stored,
 * so they cannot drift out of sync.
 */
import { ARTIFACT_IDS, getArtifact } from '../data/artifacts.js';
import { EVENTS } from '../data/timeline.js';
import { CHAPTER_IDS, EVIDENCE_IDS } from '../data/visualNovelData.js';

export const STORAGE_KEY = 'ghostMachines:v1';
export const BADGE_TITLE = 'Junior Space Archaeologist';
export const PASS_PERCENT = 70;
export const STEPS = Object.freeze(['opened', 'read', 'transmission', 'both-sites']);
export const BASE_STEPS = Object.freeze(['opened', 'read', 'transmission']);

const EVENT_IDS = EVENTS.map((e) => e.id);
const emptyState = () => ({ v: 1, artifacts: {}, milestones: [], settings: { vnVoice: true }, story: { done: [], evidence: [], at: {} }, quiz: { best: null, attempts: 0, earnedAt: null }, player: { name: '' } });
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
  if (Array.isArray(raw.milestones)) s.milestones = [...new Set(raw.milestones.filter((id) => EVENT_IDS.includes(id)))];
  if (typeof raw.settings?.vnVoice === 'boolean') s.settings.vnVoice = raw.settings.vnVoice;
  const st = raw.story;
  if (st && typeof st === 'object') {
    if (Array.isArray(st.done)) s.story.done = [...new Set(st.done.filter((id) => CHAPTER_IDS.includes(id)))];
    if (Array.isArray(st.evidence)) s.story.evidence = [...new Set(st.evidence.filter((id) => EVIDENCE_IDS.includes(id)))];
    for (const [id, n] of Object.entries(st.at ?? {})) if (CHAPTER_IDS.includes(id) && Number.isInteger(n) && n > 0 && n < 100) s.story.at[id] = n;
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

  // ---- Progress counters (all derived from the one stored state) ---------
  get discoveredCount() { return ARTIFACT_IDS.filter((id) => this.getStatus(id) !== 'undiscovered').length; }  // dossier opened
  get transmissionCount() { return ARTIFACT_IDS.filter((id) => this.#state.artifacts[id]?.steps.includes('transmission')).length; }

  // ---- Timeline milestones: explored once their details have been shown ----
  get milestoneTotal() { return EVENT_IDS.length; }
  get milestoneCount() { return this.#state.milestones.length; }
  isMilestoneExplored(id) { return this.#state.milestones.includes(id); }
  recordMilestone(id) {
    if (!EVENT_IDS.includes(id) || this.#state.milestones.includes(id)) return false;
    this.#state.milestones.push(id);
    this.#commit('milestone', { id });
    return true;
  }

  // ---- Settings ------------------------------------------------------------
  get vnVoice() { return this.#state.settings.vnVoice; }
  setVnVoice(on) { this.#state.settings.vnVoice = !!on; this.#commit('settings', {}); }

  // ---- The Lost Mission (visual novel): chapters, evidence, where you stopped ----
  get storyDoneCount() { return this.#state.story.done.length; }
  get evidenceCount() { return this.#state.story.evidence.length; }
  get evidenceTotal() { return EVIDENCE_IDS.length; }
  isChapterDone(id) { return this.#state.story.done.includes(id); }
  /** Chapter 1 is open; each later chapter opens when the one before it is complete. */
  isChapterUnlocked(id) { const i = CHAPTER_IDS.indexOf(id); return i === 0 || (i > 0 && this.isChapterDone(CHAPTER_IDS[i - 1])); }
  chapterScene(id) { return this.#state.story.at[id] ?? 0; }
  /** Remembers the scene reached. Saved quietly (no change event) because it happens on every click. */
  setChapterScene(id, n) {
    if (!CHAPTER_IDS.includes(id) || !Number.isInteger(n) || n < 1) return;
    this.#state.story.at[id] = n; this.#save();
  }
  completeChapter(id) {
    if (!CHAPTER_IDS.includes(id) || !this.isChapterUnlocked(id)) return false;
    const was = this.isChapterDone(id);
    delete this.#state.story.at[id];
    if (!was) this.#state.story.done.push(id);
    this.#commit('story', { id });
    if (!was) this.#emit('chapter-complete', { id, count: this.storyDoneCount });
    return !was;
  }
  hasEvidence(id) { return this.#state.story.evidence.includes(id); }
  collectEvidence(id) {
    if (!EVIDENCE_IDS.includes(id) || this.hasEvidence(id)) return false;
    this.#state.story.evidence.push(id); this.#commit('evidence', { id }); return true;
  }

  // ---- Quiz and badge -----------------------------------------------------
  get quizAttempts() { return this.#state.quiz.attempts; }
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
  #save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(this.#state)); this.#persistent = true; }
    catch { this.#persistent = false; } // private mode / quota: keep working in memory
  }
  #commit(reason, detail) { this.#save(); this.#emit('change', { reason, ...detail }); }
  #emit(type, detail = {}) { this.dispatchEvent(new CustomEvent(type, { detail })); }
}

export const store = new Store();
