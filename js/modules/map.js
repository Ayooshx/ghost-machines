import { store } from '../core/store.js';
import { MAP_ART } from '../data/map-art.js';
import { STATUS_LABEL, WORLD_NAME, artifactsByWorld } from '../data/artifacts.js';
import { el, on, rovingKeys } from '../core/dom.js';

/** Two stylized world layers sharing one normalized (0-1) coordinate system. Markers are real buttons. */
export function createMap(canvas, { onSelect }) {
  const worlds = {};
  for (const world of ['moon', 'mars']) {
    const layer = el('div', { class: 'map__world', dataset: { world }, inert: true });
    layer.innerHTML = MAP_ART[world];
    const markers = artifactsByWorld(world).map((a) => {
      const label = el('span', { class: 'marker__label', text: a.shortName });
      const m = el('button', { class: 'marker', type: 'button', 'aria-pressed': 'false', dataset: { id: a.id, side: a.map.side } },
        el('span', { class: 'marker__pulse' }), el('span', { class: 'marker__dot' }), label);
      m.style.setProperty('--x', a.map.x);
      m.style.setProperty('--y', a.map.y);
      return m;
    });
    layer.append(...markers);
    canvas.append(layer);
    worlds[world] = { layer, markers };
  }

  on(canvas, 'click', (e) => { const m = e.target.closest('.marker'); if (m) onSelect(m.dataset.id); });
  rovingKeys(canvas, '.marker');

  let selected = null, related = new Set();
  const refresh = () => {
    for (const [world, { markers }] of Object.entries(worlds)) {
      for (const m of markers) {
        const a = artifactsByWorld(world).find((x) => x.id === m.dataset.id);
        const status = store.getStatus(a.id);
        m.dataset.status = status;
        const rel = related.has(a.id) && a.id !== selected;
        m.dataset.related = String(rel);
        m.setAttribute('aria-pressed', String(a.id === selected));
        m.setAttribute('aria-label', `${a.shortName}, ${WORLD_NAME[world]}. ${STATUS_LABEL[status]}.${rel ? ' Related to the selected milestone.' : ''}`);
      }
    }
  };

  return {
    setWorld(world) {
      canvas.dataset.world = world;
      for (const [w, { layer }] of Object.entries(worlds)) {
        layer.classList.toggle('is-active', w === world);
        layer.toggleAttribute('inert', w !== world);
      }
    },
    setSelected(id, relatedIds = []) { selected = id; related = new Set(relatedIds); refresh(); },
    refresh,
  };
}
