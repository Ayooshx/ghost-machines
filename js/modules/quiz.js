import { store, PASS_PERCENT } from '../core/store.js';
import { QUESTIONS } from '../data/quiz.js';
import { getArtifact } from '../data/artifacts.js';
import { el, on, qs } from '../core/dom.js';
import { createBadgePanel } from './badge.js';

const shuffle = (list) => { const a = [...list]; for (let i = a.length - 1; i > 0; i -= 1) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const KEYS = ['A', 'B', 'C', 'D'];

/**
 * The Junior Space Archaeologist challenge: intro, one question at a time with instant feedback,
 * a results screen and retake. Questions and answer options are shuffled on every attempt.
 * The result goes to the store, which keeps the best score and decides the badge.
 */
export function initQuiz(router) {
  const root = qs('[data-quiz-root]');
  const live = qs('#route-announcer');
  let run = null;
  let panel = null;
  let offKey = () => {};   // removes the 1-4 answer shortcut of the current question

  const card = (...kids) => el('div', { class: 'glass quiz__card' }, ...kids);
  const show = (...kids) => { offKey(); offKey = () => {}; panel?.destroy(); panel = null; root.replaceChildren(...kids); };
  const bestLine = () => { const b = store.bestQuiz; return b ? `Best score: ${b.correct} / ${b.total} (${b.percent}%)${store.hasBadge() ? ' · Badge earned' : ''}` : null; };

  // ---------- intro ----------
  function intro() {
    run = null;
    const best = bestLine();
    const start = el('button', { class: 'btn', type: 'button', text: store.quizAttempts ? 'Take the challenge again' : 'Start the challenge' });
    on(start, 'click', begin);
    show(card(
      el('p', { class: 'panel__eyebrow', text: 'Final challenge' }),
      el('h2', { class: 'quiz__title', text: 'Show what you learned' }),
      el('p', { text: `You have cataloged all eight machines. Answer ${QUESTIONS.length} questions about them. Each answer has a short explanation. Score ${PASS_PERCENT}% or more to earn the Junior Space Archaeologist badge. You can retake the quiz as often as you like, and your best score is kept.` }),
      best && el('p', { class: 'chip', dataset: { status: 'cataloged' }, text: best }),
      el('p', {}, start)));
  }

  // ---------- one attempt ----------
  function begin() {
    run = {
      qs: shuffle(QUESTIONS).map((q) => ({ ...q, opts: shuffle(q.options.map((text, i) => ({ text, ok: i === q.answer }))), done: false })),
      i: 0, score: 0, marks: [],
    };
    question();
  }

  function question() {
    const q = run.qs[run.i], total = run.qs.length, a = getArtifact(q.artifactId);
    const dots = run.qs.map((_, i) => el('i', { dataset: { state: i < run.marks.length ? (run.marks[i] ? 'right' : 'wrong') : i === run.i ? 'now' : 'todo' } }));
    const title = el('h2', { id: 'q-title', class: 'quiz__prompt', tabindex: '-1', text: q.prompt });
    const feedback = el('div', { class: 'quiz__feedback', role: 'status', 'aria-live': 'polite' });
    const next = el('button', { class: 'btn', type: 'button', hidden: true, text: run.i === total - 1 ? 'See my results' : 'Next question' });
    const score = el('span', { text: `Score: ${run.score}` });
    const opts = q.opts.map((o, k) => el('button', { class: 'opt', type: 'button', dataset: { k } },
      el('span', { class: 'opt__key', 'aria-hidden': 'true', text: KEYS[k] }), el('span', { class: 'opt__text', text: o.text }), el('span', { class: 'opt__mark' })));

    function pick(k) {
      if (q.done) return;
      q.done = true;
      const ok = q.opts[k].ok;
      run.marks.push(ok); if (ok) run.score += 1;
      opts.forEach((b, i) => {
        b.disabled = true;
        const state = q.opts[i].ok ? 'correct' : i === k ? 'wrong' : 'idle';
        b.dataset.state = state;
        b.querySelector('.opt__mark').textContent = state === 'correct' ? (i === k ? 'Your answer: correct' : 'Correct answer') : state === 'wrong' ? 'Your answer' : '';
      });
      dots[run.i].dataset.state = ok ? 'right' : 'wrong';
      score.textContent = `Score: ${run.score}`;
      feedback.replaceChildren(el('p', { class: 'quiz__verdict', dataset: { ok }, text: ok ? 'Correct!' : 'Not quite.' }), el('p', { text: q.explanation }));
      next.hidden = false; next.focus();
    }
    opts.forEach((b, k) => on(b, 'click', () => pick(k)));
    on(next, 'click', () => { run.i += 1; run.i < total ? question() : finish(); });

    const onKey = (e) => { const k = '1234'.indexOf(e.key); if (k >= 0 && !e.metaKey && !e.ctrlKey && !e.altKey && document.activeElement?.tagName !== 'INPUT') pick(k); };
    show(card(
      el('div', { class: 'quiz__top' }, el('span', { text: `Question ${run.i + 1} of ${total}` }), score),
      el('div', { class: 'quiz__dots', 'aria-hidden': 'true' }, ...dots),
      el('p', { class: 'quiz__about', text: `About: ${a.shortName}` }),
      title,
      el('div', { class: 'quiz__options', role: 'group', 'aria-labelledby': 'q-title' }, ...opts),
      feedback, next,
      el('p', { class: 'quiz__hint', text: 'Tip: press 1 to 4 to answer.' })));
    root.addEventListener('keydown', onKey);
    offKey = () => root.removeEventListener('keydown', onKey);
    title.focus();
  }

  // ---------- results ----------
  function finish() {
    const total = run.qs.length, correct = run.score;
    const r = store.recordQuizResult({ correct, total });     // null only if the quiz were still locked
    const missed = [...new Set(run.qs.filter((_, i) => !run.marks[i]).map((q) => q.artifactId))];
    const tryAgain = el('button', { class: 'btn', type: 'button', text: 'Retake quiz' });
    on(tryAgain, 'click', begin);
    const pct = Math.round((100 * correct) / total);
    const verdict = !r ? 'The quiz is locked until all eight machines are cataloged.'
      : r.passed ? (correct === total ? 'A perfect expedition!' : 'Great work, space archaeologist!')
      : `So close. You need ${PASS_PERCENT}% for the badge. Review the dossiers and try again.`;

    const kids = [
      el('p', { class: 'panel__eyebrow', text: 'Your results' }),
      el('h2', { id: 'results-title', class: 'quiz__title', tabindex: '-1', text: 'Challenge complete' }),
      el('p', { class: 'quiz__score' }, el('b', { text: `${correct} / ${total}` }), el('span', { text: ` · ${pct}%` })),
      el('p', { class: 'quiz__verdict-line', text: verdict }),
    ];
    if (r && !r.passed && store.hasBadge()) kids.push(el('p', { class: 'quiz__note', text: `Your badge is safe. Your best score is ${store.bestQuiz.correct} / ${store.bestQuiz.total}.` }));
    if (r && r.isNewBest && store.quizAttempts > 1 && r.passed) kids.push(el('p', { class: 'quiz__note', text: 'That is a new best score!' }));
    if (missed.length) {
      kids.push(el('div', { class: 'quiz__review' }, el('p', { text: 'Want another look? These dossiers cover the questions you missed:' }),
        el('p', {}, ...missed.map((id) => el('a', { class: 'chip-btn', href: `#/${getArtifact(id).world}/${id}`, text: getArtifact(id).shortName })))));
    }
    const wrap = [card(...kids)];
    if (store.hasBadge()) {
      panel = createBadgePanel();
      wrap.push(el('div', { class: 'glass quiz__card quiz__badge', dataset: { fresh: String(!!r?.badgeJustEarned) } },
        r?.badgeJustEarned && el('p', { class: 'quiz__unlock', text: 'Achievement unlocked!' }), panel.element));
    }
    wrap.push(el('p', { class: 'quiz__links' }, tryAgain, el('a', { class: 'btn btn--amber', href: '#/moon', text: 'Back to exploring' })));
    const keep = panel; panel = null;
    show(...wrap); panel = keep;
    live.textContent = r?.badgeJustEarned ? 'Achievement unlocked: Junior Space Archaeologist' : `Quiz finished: ${correct} out of ${total}`;
    qs('#results-title', root)?.focus();
  }

  router.addEventListener('route', (e) => { if (e.detail.screen === 'quiz') intro(); });
}
