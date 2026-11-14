import { store } from '../core/store.js';
import { WORLD_NAME, getArtifact } from '../data/artifacts.js';
import { DOSSIERS } from '../data/dossiers.js';
import { el, on } from '../core/dom.js';
import { createTransmission } from './transmission.js';

const KIND_LABEL = { confirmed: 'Confirmed', interpretation: 'Interpretation' };
const row = (k, v) => el('div', {}, el('dt', { text: k }), el('dd', { text: v }));
const section = (title, ...kids) => el('section', { class: 'dossier__section' }, el('h3', { text: title }), ...kids);

/**
 * The single, reusable dossier layout. Every artifact renders through this function:
 * name, mission, launch, landing, planet and location, objective, what it did, what scientists learned,
 * why it matters, one surprising fact, Last Transmission, and NASA sources.
 * Exploration steps ('read', 'transmission', 'both-sites') are recorded in the store, which decides cataloging.
 */
export function createDossier(dialog) {
  let cleanup = () => {};

  function open(id) {
    cleanup();
    const a = getArtifact(id), d = DOSSIERS[id];
    const undo = [];

    // ---- Facts (and the two-site switch for Spirit / Opportunity) ----
    const sites = d.sites ?? null;
    const seen = new Set();
    let site = sites?.[0] ?? null;
    const facts = el('dl', { class: 'panel__facts dossier__grid' });
    const siteNote = el('p', { class: 'dossier__note', dataset: { kind: 'site' } });
    const toggles = (sites ?? []).map((s) => el('button', { class: 'site-toggle', type: 'button', 'aria-pressed': 'false', dataset: { site: s.id }, text: s.label }));
    const fill = () => {
      const s = site ?? {};
      facts.replaceChildren(
        row('Launch', s.launch ?? d.launch), row('Landing', s.landing ?? d.landing),
        row('Planet and location', s.place ?? d.place), row('Status today', s.today ?? a.status));
      if (!sites) return;
      siteNote.textContent = site.note;
      toggles.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.site === site.id)));
      seen.add(site.id);
      if (seen.size === sites.length) store.recordStep(id, 'both-sites');
    };
    toggles.forEach((b, i) => on(b, 'click', () => { site = sites[i]; fill(); }));
    fill();

    // ---- Last Transmission: fictional narration with spoken playback (see transmission.js) ----
    const tx = createTransmission({ artifact: a, transmission: d.transmission, onHeard: () => store.recordStep(id, 'transmission') });
    undo.push(() => tx.destroy());

    const end = el('div', { class: 'dossier__end', 'aria-hidden': 'true' });
    const body = el('div', { class: 'dossier__body' },
      el('header', { class: 'dossier__head' },
        el('p', { class: 'panel__eyebrow', text: `${WORLD_NAME[a.world]} · ${a.mission}` }),
        el('h2', { id: 'dossier-title', class: 'panel__name', text: a.name }),
        el('p', { class: 'dossier__mission', text: a.mission })),
      sites && el('div', { class: 'site-switch', role: 'group', 'aria-label': 'Choose a landing site' }, ...toggles),
      facts,
      d.datesNote && el('p', { class: 'dossier__dates', text: d.datesNote }),
      sites && siteNote,
      a.featuredNote && el('p', { class: 'dossier__note', dataset: { kind: 'featured' } }, el('strong', { text: 'Featured site. ' }), a.featuredNote),
      a.widerNote && el('p', { class: 'dossier__note', dataset: { kind: 'wider' } }, el('strong', { text: 'Wider history. ' }), a.widerNote),
      section('Mission objective', el('p', { text: d.objective })),
      section('What the machine did', ...d.did.map((t) => el('p', { text: t }))),
      section('What scientists learned',
        el('p', { class: 'dossier__legend', text: 'Confirmed means documented in NASA records or directly observed. Interpretation means what scientists concluded or suspect from the evidence.' }),
        el('ul', { class: 'learned' }, ...d.learned.map((l) =>
          el('li', { dataset: { kind: l.kind } }, el('span', { class: 'badge', text: KIND_LABEL[l.kind] }), el('span', { text: l.text }))))),
      section('Why the discovery still matters', el('p', { text: d.matters })),
      el('aside', { class: 'dossier__surprise', 'aria-label': 'One surprising fact' }, el('h3', { text: 'One surprising fact' }), el('p', { text: d.surprise })),
      tx.element,
      section('NASA sources', el('ul', { class: 'sources' }, ...d.sources.map((s) =>
        el('li', {}, el('a', { href: s.url, target: '_blank', rel: 'noopener noreferrer', text: s.label }))))),
      end);

    dialog.setAttribute('aria-labelledby', 'dossier-title');
    dialog.replaceChildren(
      el('form', { method: 'dialog', class: 'dossier__close' }, el('button', { class: 'btn btn--amber', type: 'submit', 'aria-label': 'Close dossier' }, 'Close')),
      body);
    store.recordStep(id, 'opened');
    dialog.showModal();
    body.scrollTop = 0;

    // "Read" = the visitor scrolled to the end of the dossier.
    const io = new IntersectionObserver((entries) => { if (entries.some((e) => e.isIntersecting)) store.recordStep(id, 'read'); }, { root: body, threshold: 1 });
    io.observe(end);
    undo.push(() => io.disconnect());
    cleanup = () => { undo.forEach((fn) => fn()); cleanup = () => {}; };
    dialog.addEventListener('close', cleanup, { once: true });
  }

  return { open };
}
