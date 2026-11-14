import { store } from '../core/store.js';
import { artifactsByWorld, getArtifact } from '../data/artifacts.js';
import { qs, qsa, on } from '../core/dom.js';
import { createMap } from './map.js';
import { createPanel } from './panel.js';
import { createTimeline } from './timeline.js';

/**
 * Coordinator for the exploration console. The router is the single source of selection:
 * every select() goes through the URL (#/moon/surveyor-3), then all views render from the route.
 */
export function initExplorer(router) {
  const root = qs('.explorer');
  const tabs = qsa('[role="tab"]', root);
  const announcer = qs('#route-announcer');
  const select = (id) => router.go(getArtifact(id).world, id, { replace: true });

  const map = createMap(qs('[data-canvas]', root), { onSelect: select });
  const panel = createPanel(qs('[data-panel]', root), qs('[data-dossier]', root));
  const timeline = createTimeline(qs('[data-timeline]', root), { onSelect: select });

  let world = 'moon';
  let selected = artifactsByWorld('moon')[0].id;

  function render() {
    for (const t of tabs) {
      const active = t.dataset.world === world;
      t.setAttribute('aria-selected', String(active));
      t.tabIndex = active ? 0 : -1;
    }
    qs('[data-canvas]', root).parentElement.setAttribute('aria-labelledby', `tab-${world}`);
    map.setWorld(world);
    map.setSelected(selected);
    panel.render(selected);
    timeline.render(world, selected);
  }

  const dialog = qs('[data-dossier]', root);
  router.addEventListener('route', (e) => {
    if (dialog.open) dialog.close();   // leaving or switching: close the dossier, which stops any narration
    const { screen, artifactId } = e.detail;
    if (screen !== 'moon' && screen !== 'mars') return;
    world = screen;
    if (artifactId) selected = artifactId;
    else if (getArtifact(selected).world !== world) selected = artifactsByWorld(world)[0].id;
    render();
    announcer.textContent = `${getArtifact(selected).name} selected`;
  });
  store.addEventListener('change', render);

  for (const t of tabs) on(t, 'click', () => router.go(t.dataset.world));
  on(qs('[data-tabs]', root), 'keydown', (e) => {
    if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
    e.preventDefault();
    const next = world === 'moon' ? 'mars' : 'moon';
    router.go(next);
    qs(`#tab-${next}`, root).focus();
  });

  render();
}
