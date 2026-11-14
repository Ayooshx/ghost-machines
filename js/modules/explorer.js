import { store } from '../core/store.js';
import { artifactsByWorld, getArtifact } from '../data/artifacts.js';
import { EVENTS, getEvent, anchorEvent } from '../data/timeline.js';
import { qs, qsa, on } from '../core/dom.js';
import { createMap } from './map.js';
import { createPanel } from './panel.js';
import { createTimeline } from './timeline.js';

/**
 * Coordinator for the exploration console. The router is the single source of selection:
 * every select goes through the URL (#/moon/surveyor-3/apollo-12-visit), then the map, panel and timeline
 * all render from that route, so they can never disagree.
 *   marker click    -> artifact (keeps the current milestone if it relates to that artifact)
 *   milestone click -> its primary artifact + that milestone, switching worlds if needed
 */
export function initExplorer(router) {
  const root = qs('.explorer');
  const tabs = qsa('[role="tab"]', root);
  const dialog = qs('[data-dossier]', root);
  const announcer = qs('#route-announcer');

  let world = 'moon';
  let selected = artifactsByWorld('moon')[0].id;
  let eventId = anchorEvent(selected).id;

  const selectArtifact = (id) => {
    const keep = getEvent(eventId)?.artifactIds.includes(id) ? eventId : null;
    router.go(getArtifact(id).world, id, { replace: true, eventId: keep });
  };
  const selectEvent = (id) => {
    const primary = getEvent(id).artifactIds[0];
    router.go(getArtifact(primary).world, primary, { replace: true, eventId: id });
  };

  const map = createMap(qs('[data-canvas]', root), { onSelect: selectArtifact });
  const panel = createPanel(qs('[data-panel]', root), dialog, { onSelectArtifact: selectArtifact });
  const timeline = createTimeline(qs('[data-timeline-root]', root), { onSelect: selectEvent });

  function render() {
    for (const t of tabs) {
      const active = t.dataset.world === world;
      t.setAttribute('aria-selected', String(active));
      t.tabIndex = active ? 0 : -1;
    }
    qs('.map__stage', root).setAttribute('aria-labelledby', `tab-${world}`);
    const ev = getEvent(eventId);
    map.setWorld(world);
    map.setSelected(selected, ev.artifactIds);   // related artifacts glow on the map
    panel.render(selected, ev);
    timeline.render(ev.id);
  }

  router.addEventListener('route', (e) => {
    if (dialog.open) dialog.close();   // leaving or switching: close the dossier, which stops any narration
    const { screen, artifactId, eventId: routeEvent } = e.detail;
    if (screen !== 'moon' && screen !== 'mars') return;
    world = screen;
    if (artifactId) selected = artifactId;
    else if (getArtifact(selected).world !== world) selected = artifactsByWorld(world)[0].id;
    eventId = routeEvent ?? anchorEvent(selected).id;
    render();
    announcer.textContent = `${getEvent(eventId).title}. ${getArtifact(selected).name} selected`;
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
