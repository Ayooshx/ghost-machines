import { store } from '../core/store.js';
import { el, on, qs } from '../core/dom.js';

/** Expedition log: one place to see what has been discovered, heard, explored and scored. Reads only from the store. */
export function initLog(router) {
  const dialog = qs('[data-log]');
  const row = (label, value, max, note) => el('div', { class: 'log__row' },
    el('div', { class: 'log__head' }, el('span', { text: label }), el('b', { text: `${value} / ${max}` })),
    el('progress', { max: String(max), value: String(value), 'aria-label': label }),
    note && el('p', { class: 'log__note', text: note }));

  function render() {
    const total = store.total, best = store.bestQuiz;
    const quizNote = best ? `Best score ${best.correct} / ${best.total} (${best.percent}%)${store.hasBadge() ? ' · badge earned' : ' · badge not earned yet'}`
      : store.isQuizUnlocked() ? 'Unlocked. Not attempted yet.' : `Locked. Catalog ${total - store.catalogedCount} more ${total - store.catalogedCount === 1 ? 'machine' : 'machines'} to unlock it.`;
    const reset = el('button', { class: 'log__reset', type: 'button', text: 'Reset my progress' });
    on(reset, 'click', () => { if (confirm('Reset all expedition progress on this device? This cannot be undone.')) { store.reset(); render(); } });
    dialog.setAttribute('aria-labelledby', 'log-title');   // only once the title exists
    dialog.replaceChildren(el('div', { class: 'log__body' },
      el('form', { method: 'dialog', class: 'dossier__close' }, el('button', { class: 'btn btn--amber', type: 'submit', 'aria-label': 'Close expedition log' }, 'Close')),
      el('p', { class: 'panel__eyebrow', text: 'Field notes' }),
      el('h2', { id: 'log-title', class: 'panel__name', text: 'Expedition log' }),
      row('Artifacts discovered', store.discoveredCount, total, 'A dossier was opened.'),
      row('Artifacts cataloged', store.catalogedCount, total, 'Dossier opened and read, and its transmission heard. Cataloging all eight unlocks the quiz.'),
      row('Transmissions heard', store.transmissionCount, total, 'Listened to, or transcript marked as read.'),
      row('Timeline milestones explored', store.milestoneCount, store.milestoneTotal, 'A milestone counts once its details have been shown.'),
      row('Story chapters completed', store.storyDoneCount, 8, 'The Lost Mission visual novel. Chapters unlock one after another.'),
      row('Story evidence collected', store.evidenceCount, store.evidenceTotal, 'One piece of evidence per chapter.'),
      el('div', { class: 'log__row' },
        el('div', { class: 'log__head' }, el('span', { text: 'Quiz' }), el('b', { text: store.quizAttempts ? `${store.quizAttempts} ${store.quizAttempts === 1 ? 'attempt' : 'attempts'}` : 'Not started' })),
        el('p', { class: 'log__note', text: quizNote })),
      el('p', { class: 'log__actions' },
        el('a', { class: 'btn', href: '#/story', text: 'The Lost Mission' }),
        store.isQuizUnlocked() && el('a', { class: 'btn', href: '#/quiz', text: store.quizAttempts ? 'Retake the quiz' : 'Take the quiz' }),
        store.hasBadge() && el('a', { class: 'btn btn--amber', href: '#/badge', text: 'View my badge' })),
      el('p', { class: 'log__note', text: 'Saved on this device only. No account needed.' }), reset));
  }

  function open() { render(); dialog.showModal(); }
  on(dialog, 'click', (e) => { if (e.target === dialog) dialog.close(); });
  router.addEventListener('route', () => { if (dialog.open) dialog.close(); });   // following a link inside the log closes it
  on(qs('[data-open-log]'), 'click', open);
  return { open };
}
