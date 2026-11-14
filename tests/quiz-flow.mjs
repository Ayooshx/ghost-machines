// Dev-only test (not shipped to visitors). Run from the project folder:  node tests/quiz-flow.mjs
// Uses a tiny built-in stand-in for the browser DOM, so it needs no packages.
// Minimal DOM stand-in, just enough to drive js/modules/quiz.js end to end.
class T { constructor(t) { this.nodeType = 3; this.t = t; } get textContent() { return this.t; } }
class N {
  constructor(tag) { this.tagName = tag.toUpperCase(); this.children = []; this.attrs = {}; this.dataset = {}; this.L = {}; this.cls = new Set(); this._t = ''; this.hidden = false; this.disabled = false; this.style = {}; this.nodeType = 1; }
  set className(v) { this.cls = new Set(String(v).split(/\s+/).filter(Boolean)); } get className() { return [...this.cls].join(' '); }
  get classList() { const s = this.cls; return { add: (c) => s.add(c), remove: (c) => s.delete(c), contains: (c) => s.has(c), toggle: (c, f) => (f ?? !s.has(c) ? s.add(c) : s.delete(c)) }; }
  append(...k) { for (const c of k) this.children.push(typeof c === 'string' ? new T(c) : c); }
  replaceChildren(...k) { this.children = []; this._t = ''; this.append(...k); }
  set textContent(v) { this.children = []; this._t = String(v); }
  get textContent() { return this._t + this.children.map((c) => c.textContent).join(''); }
  set innerHTML(v) { this._h = v; } get firstChild() { return this.children[0]; }
  setAttribute(k, v) { this.attrs[k] = String(v); if (k === 'class') this.className = v; if (k === 'hidden') this.hidden = true; if (k === 'id') this.id = v; }
  getAttribute(k) { return this.attrs[k] ?? null; } removeAttribute(k) { delete this.attrs[k]; } hasAttribute(k) { return k in this.attrs; }
  toggleAttribute(k, f) { f ? this.attrs[k] = '' : delete this.attrs[k]; }
  addEventListener(t, f) { (this.L[t] ??= []).push(f); } removeEventListener(t, f) { this.L[t] = (this.L[t] ?? []).filter((x) => x !== f); }
  dispatchEvent(e) { (this.L[e.type] ?? []).slice().forEach((f) => f(e)); return true; }
  focus() { N.focused = this; }
  *walk() { for (const c of this.children) if (c.nodeType === 1) { yield c; yield* c.walk(); } }
  match(sel) {
    if (sel.startsWith('.')) return this.cls.has(sel.slice(1));
    if (sel.startsWith('#')) return this.attrs.id === sel.slice(1);
    if (sel.startsWith('[')) return sel.slice(1, -1) in this.attrs;
    return this.tagName === sel.toUpperCase();
  }
  querySelector(sel) { for (const n of this.walk()) if (n.match(sel)) return n; return null; }
  querySelectorAll(sel) { return [...this.walk()].filter((n) => n.match(sel)); }
}
const body = new N('body');
globalThis.document = { createElement: (t) => new N(t), querySelector: (s) => body.querySelector(s), querySelectorAll: (s) => body.querySelectorAll(s), body, get activeElement() { return N.focused; }, fonts: { ready: Promise.resolve() } };
globalThis.addEventListener = () => {}; globalThis.confirm = () => true;
const mem = {}; globalThis.localStorage = { getItem: (k) => mem[k] ?? null, setItem: (k, v) => { mem[k] = v; } };
const root = new N('div'); root.setAttribute('data-quiz-root', ''); const ann = new N('div'); ann.setAttribute('id', 'route-announcer'); body.append(root, ann);

const base = new URL('../js/', import.meta.url).href;
const { store, PASS_PERCENT } = await import(base + 'core/store.js');
const { initQuiz } = await import(base + 'modules/quiz.js');
const { QUESTIONS } = await import(base + 'data/quiz.js');
const { ARTIFACT_IDS } = await import(base + 'data/artifacts.js');
const { EVENTS } = await import(base + 'data/timeline.js');

let bad = 0; const check = (ok, msg) => { if (!ok) { bad++; console.log('FAIL:', msg); } else console.log('ok  :', msg); };

// ---- data integrity ----
check(QUESTIONS.length >= 8 && QUESTIONS.length <= 10, `question count ${QUESTIONS.length} is within 8-10`);
check(QUESTIONS.every((q) => q.options.length === 4 && q.answer >= 0 && q.answer < 4 && new Set(q.options).size === 4), 'every question has 4 distinct options and a valid answer');
check(ARTIFACT_IDS.every((id) => QUESTIONS.some((q) => q.artifactId === id)), 'all eight artifacts are covered');
check(QUESTIONS.every((q) => q.explanation.length > 20 && q.explanation.length < 300), 'explanations are short');

// ---- progress tracking in the store ----
check(store.quizAttempts === 0 && store.milestoneCount === 0 && store.discoveredCount === 0, 'starts empty');
store.recordStep('surveyor-3', 'opened'); check(store.discoveredCount === 1 && store.catalogedCount === 0, 'opening a dossier counts as discovered');
store.recordMilestone(EVENTS[0].id); store.recordMilestone(EVENTS[0].id); store.recordMilestone('nope');
check(store.milestoneCount === 1 && store.isMilestoneExplored(EVENTS[0].id), 'milestones count once; unknown ids ignored');
check(store.recordQuizResult({ correct: 9, total: 10 }) === null, 'quiz result refused while locked');
for (const id of ARTIFACT_IDS) for (const s of ['opened', 'read', 'transmission', 'both-sites']) store.recordStep(id, s);
check(store.transmissionCount === 8 && store.isQuizUnlocked(), 'transmissions counted; quiz unlocked at 8/8');

// ---- drive the real quiz module ----
const router = new EventTarget(); initQuiz(router);
router.dispatchEvent(new CustomEvent('route', { detail: { screen: 'quiz' } }));
const buttons = () => [...root.walk()].filter((n) => n.tagName === 'BUTTON');
const byText = (t) => buttons().find((b) => b.textContent === t);
check(!!byText('Start the challenge'), 'intro shows a start button');
const play = (rightCount) => {
  const seenPrompts = new Set(); let right = 0, shuffled = false;
  for (let n = 0; n < QUESTIONS.length; n++) {
    const prompt = root.querySelector('.quiz__prompt').textContent;
    const q = QUESTIONS.find((x) => x.prompt === prompt); seenPrompts.add(prompt);
    const opts = [...root.walk()].filter((x) => x.cls.has('opt'));
    if (opts.length !== 4) check(false, 'question has 4 options');
    const correctIdx = opts.findIndex((o) => o.querySelector('.opt__text').textContent === q.options[q.answer]);
    if (correctIdx !== 0) shuffled = true;
    const wantRight = n < rightCount; const pickIdx = wantRight ? correctIdx : (correctIdx + 1) % 4;
    opts[pickIdx].dispatchEvent({ type: 'click' });
    const fb = root.querySelector('.quiz__feedback').textContent;
    if (wantRight !== fb.startsWith('Correct!')) check(false, 'feedback verdict matches the answer');
    if (!fb.includes(q.explanation)) check(false, 'explanation shown after answering');
    if (!opts.every((o) => o.disabled)) check(false, 'options locked after answering');
    if (opts[correctIdx].dataset.state !== 'correct') check(false, 'correct option highlighted');
    if (wantRight) right++;
    const next = buttons().find((b) => b.textContent === 'Next question' || b.textContent === 'See my results');
    if (!next || next.hidden) check(false, 'next button appears after answering');
    next.dispatchEvent({ type: 'click' });
  }
  return { seenPrompts: seenPrompts.size, right, shuffled };
};
byText('Start the challenge').dispatchEvent({ type: 'click' });
const a1 = play(8);
check(a1.seenPrompts === QUESTIONS.length, 'each question asked exactly once per attempt');
const score1 = root.querySelector('.quiz__score').textContent;
check(score1.includes('8 / 10') && score1.includes('80%'), `results show the score (${score1})`);
check(store.bestQuiz.correct === 8 && store.hasBadge(), 'best score saved and badge earned at 80%');
const info = store.getBadgeInfo(); check(info.title === 'Junior Space Archaeologist' && info.earnedAt && info.percent === 80, 'badge info has title, score, date');
check(!!root.querySelector('.badge-panel') && root.textContent.includes('Achievement unlocked!'), 'results show the achievement and badge panel');
check(!!byText('Retake quiz'), 'retake button present');
const missed = [...root.walk()].filter((n) => n.tagName === 'A' && n.cls.has('chip-btn')); check(missed.length >= 1, `links to dossiers for missed questions (${missed.length})`);

byText('Retake quiz').dispatchEvent({ type: 'click' });
const a2 = play(0);
check(root.querySelector('.quiz__score').textContent.includes('0 / 10'), 'retake scores independently');
check(store.bestQuiz.correct === 8 && store.hasBadge(), 'highest score and badge are kept after a worse retake');
check(root.textContent.includes('Your badge is safe'), 'worse retake explains the badge is kept');
check(store.quizAttempts === 2, 'attempts tracked');
byText('Retake quiz').dispatchEvent({ type: 'click' });
play(10); check(store.bestQuiz.correct === 10 && root.textContent.includes('perfect'), 'perfect run recorded as new best');

// stored data is one JSON object under one key
const saved = JSON.parse(mem['ghostMachines:v1']);
check(Object.keys(mem).length === 1 && saved.milestones.length === 1 && saved.quiz.attempts === 3, 'everything persists in a single localStorage key');
// threshold boundary: exactly 70% passes, 60% does not
store.reset(); for (const id of ARTIFACT_IDS) for (const s of ['opened', 'read', 'transmission', 'both-sites']) store.recordStep(id, s);
check(store.recordQuizResult({ correct: 6, total: 10 }).passed === false && !store.hasBadge(), '6/10 does not earn the badge');
check(store.recordQuizResult({ correct: 7, total: 10 }).passed === true && store.hasBadge(), '7/10 (70%) earns the badge');
console.log(bad ? `\n${bad} FAILURE(S)` : '\nALL CHECKS PASSED'); process.exit(bad ? 1 : 0);
