import { store } from '../core/store.js';
import { ARTIFACTS } from '../data/artifacts.js';
import { qs, qsa, el, on } from '../core/dom.js';

/** Top bar: current-screen marker, progress meter, quiz lock and badge link. All state comes from the store. */
export function initHud(router, { onLockedQuiz } = {}) {
  const links = qsa('[data-nav]');
  const bar = qs('[data-progress-bar]');
  const count = qs('[data-progress-count]');
  const quizLink = qs('[data-nav="quiz"]');
  const badgeLink = qs('[data-nav="badge"]');
  const live = qs('#route-announcer');
  const logButton = qs('[data-open-log]');
  const segs = ARTIFACTS.map((a) => bar.appendChild(el('i', { dataset: { id: a.id } })));
  let lastCount = store.catalogedCount, lastUnlocked = store.isQuizUnlocked();

  const render = () => {
    segs.forEach((s) => { s.dataset.status = store.getStatus(s.dataset.id); });
    count.textContent = `${store.catalogedCount} / ${store.total}`;
    logButton.setAttribute('aria-label', `Open expedition log. ${store.catalogedCount} of ${store.total} artifacts cataloged.`);
    const unlocked = store.isQuizUnlocked();
    quizLink.toggleAttribute('aria-disabled', !unlocked);
    if (!unlocked) { quizLink.setAttribute('aria-disabled', 'true'); quizLink.title = 'Catalog all eight artifacts to unlock'; }
    else { quizLink.removeAttribute('aria-disabled'); quizLink.removeAttribute('title'); }
    badgeLink.hidden = !store.hasBadge();
    if (store.catalogedCount > lastCount) live.textContent = `${store.catalogedCount} of ${store.total} artifacts cataloged`;
    if (unlocked && !lastUnlocked) live.textContent = 'All artifacts cataloged. The quiz is unlocked.';
    lastCount = store.catalogedCount; lastUnlocked = unlocked;
  };

  on(quizLink, 'click', (e) => {
    if (quizLink.getAttribute('aria-disabled') === 'true') { e.preventDefault(); live.textContent = 'Quiz locked. Catalog all eight artifacts first.'; onLockedQuiz?.(); }
  });
  const sector = qs('[data-sector]');
  router.addEventListener('route', (e) => {
    const w = document.body.dataset.world;
    if (w === 'moon' || w === 'mars') sector.textContent = w === 'moon' ? 'Moon' : 'Mars';
    links.forEach((l) => (l.dataset.nav === e.detail.screen ? l.setAttribute('aria-current', 'page') : l.removeAttribute('aria-current')));
  });
  store.addEventListener('change', render);
  render();
}
