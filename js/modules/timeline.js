import { store } from '../core/store.js';
import { timelineFor } from '../data/artifacts.js';
import { el, on, rovingKeys, prefersReducedMotion } from '../core/dom.js';

/** Horizontal, chronological timeline for the current world. Each node selects its artifact. */
export function createTimeline(list, { onSelect }) {
  let world = null;
  const node = (a) => el('li', { class: 'tl__item' },
    el('button', { class: 'tl__node', type: 'button', dataset: { id: a.id } },
      el('span', { class: 'tl__dot', 'aria-hidden': 'true' }),
      el('span', { class: 'tl__year', text: a.date.slice(0, 4) }),
      el('span', { class: 'tl__name', text: a.shortName }),
      el('span', { class: 'tl__date', text: a.arrived }),
      el('span', { class: 'tl__note', text: a.note })));

  on(list, 'click', (e) => { const b = e.target.closest('[data-id]'); if (b) onSelect(b.dataset.id); });
  rovingKeys(list, '.tl__node');

  return {
    render(w, selectedId) {
      if (w !== world) {
        world = w;
        list.replaceChildren(...timelineFor(w).map(node));
        list.classList.remove('is-swapping'); void list.offsetWidth; list.classList.add('is-swapping');
      }
      for (const b of list.querySelectorAll('[data-id]')) {
        const sel = b.dataset.id === selectedId;
        b.setAttribute('aria-current', String(sel));
        b.dataset.status = store.getStatus(b.dataset.id);
        if (sel) list.scrollTo({ left: b.parentElement.offsetLeft - (list.clientWidth - b.parentElement.offsetWidth) / 2, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
      }
    },
  };
}
