import { store } from '../core/store.js';
import { EVENTS } from '../data/timeline.js';
import { PLATES } from '../data/plates.js';
import { el, on, rovingKeys, prefersReducedMotion } from '../core/dom.js';

const GAP_YEARS = 8; // show a "N years later" marker when the archive jumps this far
const year = (e) => Number(e.date.slice(0, 4));

/**
 * Horizontal archive timeline, 1966 onward. Native touch scrolling, wheel-to-scroll, arrow keys,
 * previous/next buttons and a progress indicator. Selection is owned by the explorer (via the URL);
 * this component only reports clicks and renders `render(eventId)`.
 */
export function createTimeline(root, { onSelect }) {
  const N = EVENTS.length;
  const idx = (id) => EVENTS.findIndex((e) => e.id === id);

  // ---- bar: previous / progress / next ----
  const mkNav = (dir, label, arrow) => el('button', { class: 'tl__nav', type: 'button', dataset: { dir } },
    ...(dir < 0 ? [el('span', { 'aria-hidden': 'true', text: arrow }), el('span', { class: 'tl__nav-label', text: label })]
                : [el('span', { class: 'tl__nav-label', text: label }), el('span', { 'aria-hidden': 'true', text: arrow })]));
  const prev = mkNav(-1, 'Previous', '‹'), next = mkNav(1, 'Next', '›');
  const fill = el('i');
  const progress = el('div', { class: 'tl__progress', role: 'progressbar', 'aria-label': 'Timeline progress', 'aria-valuemin': '1', 'aria-valuemax': String(N) },
    el('span', { class: 'tl__yr', text: String(year(EVENTS[0])) }), el('span', { class: 'tl__track' }, fill), el('span', { class: 'tl__yr', text: String(year(EVENTS[N - 1])) }));
  const count = el('span', { class: 'tl__count' });

  // ---- reel: one card per milestone, with "N years later" gaps ----
  const list = el('ol', { class: 'tl' });
  const nodes = new Map();
  EVENTS.forEach((e, i) => {
    if (i && year(e) - year(EVENTS[i - 1]) >= GAP_YEARS) {
      list.append(el('li', { class: 'tl__gap', 'aria-hidden': 'true' }, el('span', { text: `${year(e) - year(EVENTS[i - 1])} years later` })));
    }
    const plate = el('span', { class: 'plate', 'aria-hidden': 'true' }, el('span', { class: 'plate__no', text: `No. ${String(i + 1).padStart(2, '0')}` }));
    plate.insertAdjacentHTML('afterbegin', PLATES[e.plate]);
    if (e.photo) {
      const img = el('img', { src: e.photo.src, alt: '', loading: 'lazy' });
      img.addEventListener('error', () => img.remove());   // fall back to the illustrated plate
      plate.prepend(img);
    }
    const node = el('button', { class: 'tl__node', type: 'button', dataset: { id: e.id } },
      el('span', { class: 'tl__dot', 'aria-hidden': 'true' }), plate,
      el('span', { class: 'tl__text' },
        el('span', { class: 'tl__date', text: e.dateLabel }),
        el('span', { class: 'tl__title', text: e.title }),
        e.span && el('span', { class: 'tl__range', text: 'range of years' })));
    nodes.set(e.id, node);
    list.append(el('li', { class: 'tl__item', dataset: { world: e.world } }, node));
  });

  root.replaceChildren(el('div', { class: 'tl__bar' }, prev, progress, count, next), list);

  on(list, 'click', (e) => { const b = e.target.closest('[data-id]'); if (b) onSelect(b.dataset.id); });
  on(prev, 'click', () => { const i = idx(current); if (i > 0) onSelect(EVENTS[i - 1].id); });
  on(next, 'click', () => { const i = idx(current); if (i < N - 1) onSelect(EVENTS[i + 1].id); });
  rovingKeys(list, '.tl__node');
  // Mouse wheel scrolls the reel sideways (touch and trackpads already scroll natively).
  on(list, 'wheel', (e) => {
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX) && list.scrollWidth > list.clientWidth) { list.scrollLeft += e.deltaY; e.preventDefault(); }
  }, { passive: false });

  let current = EVENTS[0].id;
  return {
    render(eventId) {
      current = eventId;
      const i = idx(eventId);
      for (const [id, node] of nodes) {
        const e = EVENTS[idx(id)];
        node.setAttribute('aria-current', String(id === eventId));
        node.dataset.status = store.getStatus(e.artifactIds[0]);   // marker fills in as the related artifact is explored
      }
      fill.style.width = `${(i / (N - 1)) * 100}%`;
      count.textContent = `${i + 1} / ${N}`;
      progress.setAttribute('aria-valuenow', String(i + 1));
      progress.setAttribute('aria-valuetext', `Milestone ${i + 1} of ${N}: ${EVENTS[i].title}`);
      prev.disabled = i === 0; next.disabled = i === N - 1;
      prev.setAttribute('aria-label', i > 0 ? `Previous milestone: ${EVENTS[i - 1].title}` : 'Previous milestone');
      next.setAttribute('aria-label', i < N - 1 ? `Next milestone: ${EVENTS[i + 1].title}` : 'Next milestone');
      const item = nodes.get(eventId).parentElement;
      list.scrollTo({ left: item.offsetLeft - (list.clientWidth - item.offsetWidth) / 2, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    },
  };
}
