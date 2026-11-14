import { store } from '../core/store.js';
import { STATUS_LABEL, WORLD_NAME, getArtifact } from '../data/artifacts.js';
import { el, on } from '../core/dom.js';
import { createDossier } from './dossier.js';

const row = (k, v) => el('div', {}, el('dt', { text: k }), el('dd', { text: v }));

/** Right-hand summary panel plus the full dossier dialog (native <dialog>: focus trap and Esc for free). */
export function createPanel(root, dialog) {
  let current = null;
  const dossier = createDossier(dialog);

  function render(id) {
    const a = getArtifact(id), status = store.getStatus(id);
    const fresh = !current || current.id !== id;
    current = a;
    root.replaceChildren(
      el('p', { class: 'panel__eyebrow', text: `Selected artifact · ${WORLD_NAME[a.world]}` }),
      el('h2', { class: 'panel__name', text: a.name }),
      el('span', { class: 'chip', dataset: { status }, text: STATUS_LABEL[status] }),
      el('dl', { class: 'panel__facts' }, row('Mission', a.mission), row('Location', a.location), row('Arrived', a.arrived)),
      el('p', { class: 'panel__desc', text: a.blurb }),
      el('button', { class: 'btn panel__open', type: 'button', 'data-open': true }, 'View dossier'),
    );
    if (fresh) { root.classList.remove('is-swapping'); void root.offsetWidth; root.classList.add('is-swapping'); }
  }

  on(root, 'click', (e) => { if (e.target.closest('[data-open]')) dossier.open(current.id); });
  on(dialog, 'close', () => root.querySelector('[data-open]')?.focus()); // the panel re-renders while open, so restore focus by hand
  on(dialog, 'click', (e) => { if (e.target === dialog) dialog.close(); }); // backdrop click
  return { render };
}
