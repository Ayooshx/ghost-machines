import { store } from '../core/store.js';
import { STATUS_LABEL, WORLD_NAME, getArtifact } from '../data/artifacts.js';
import { el, on } from '../core/dom.js';
import { createDossier } from './dossier.js';

const row = (k, v) => el('div', {}, el('dt', { text: k }), el('dd', { text: v }));

/**
 * Right-hand panel: the selected timeline milestone (with links to its related artifacts on the map)
 * above the selected artifact's summary and View dossier button.
 */
export function createPanel(root, dialog, { onSelectArtifact }) {
  let current = null, currentEvent = null;
  const dossier = createDossier(dialog);

  function milestone(ev, selectedId) {
    return el('section', { class: 'milestone', 'aria-label': 'Timeline milestone', dataset: { world: ev.world } },
      el('p', { class: 'panel__eyebrow', text: 'Timeline milestone' }),
      el('p', { class: 'milestone__date', text: ev.dateLabel }),
      el('h2', { class: 'milestone__title', text: ev.title }),
      el('p', { class: 'milestone__text', text: ev.text }),
      el('div', { class: 'milestone__related' },
        el('span', { class: 'milestone__label', text: 'Show on map' }),
        ...ev.artifactIds.map((id) => el('button', { class: 'chip-btn', type: 'button', 'aria-pressed': String(id === selectedId), dataset: { artifact: id }, text: getArtifact(id).shortName }))),
      ev.photo?.credit && el('p', { class: 'milestone__credit', text: `Image: ${ev.photo.credit}` }),
      ev.source && el('a', { class: 'milestone__source', href: ev.source.url, target: '_blank', rel: 'noopener noreferrer', text: `Source: ${ev.source.label}` }));
  }

  function render(id, ev) {
    const a = getArtifact(id), status = store.getStatus(id);
    const fresh = !current || current.id !== id || currentEvent?.id !== ev.id;
    current = a; currentEvent = ev;
    root.replaceChildren(
      milestone(ev, id),
      el('hr', { class: 'panel__sep' }),
      el('p', { class: 'panel__eyebrow', text: `Selected artifact · ${WORLD_NAME[a.world]}` }),
      el('h3', { class: 'panel__name', text: a.name }),
      el('span', { class: 'chip', dataset: { status }, text: STATUS_LABEL[status] }),
      el('dl', { class: 'panel__facts' }, row('Mission', a.mission), row('Location', a.location), row('Arrived', a.arrived)),
      el('p', { class: 'panel__desc', text: a.blurb }),
      el('button', { class: 'btn panel__open', type: 'button', 'data-open': true }, 'View dossier'),
    );
    if (fresh) { root.classList.remove('is-swapping'); void root.offsetWidth; root.classList.add('is-swapping'); }
  }

  on(root, 'click', (e) => {
    if (e.target.closest('[data-open]')) dossier.open(current.id);
    const chip = e.target.closest('[data-artifact]');
    if (chip) onSelectArtifact(chip.dataset.artifact);
  });
  on(dialog, 'close', () => root.querySelector('[data-open]')?.focus()); // the panel re-renders while open, so restore focus by hand
  on(dialog, 'click', (e) => { if (e.target === dialog) dialog.close(); }); // backdrop click
  return { render };
}
