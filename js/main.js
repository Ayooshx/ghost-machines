import { store } from './core/store.js';
import { Router } from './core/router.js';
import { qs, qsa } from './core/dom.js';
import { initStarfield } from './modules/starfield.js';
import { initHud } from './modules/hud.js';
import { initLanding } from './modules/landing.js';
import { initExplorer } from './modules/explorer.js';

const screens = new Map(qsa('[data-screen]').flatMap((n) => n.dataset.screen.split(' ').map((name) => [name, n])));
const router = new Router({ screens, announcer: qs('#route-announcer') });

initStarfield(qs('#starfield'));
initHud(router);
initLanding(router);
initExplorer(router);   // subscribe before start() so the first route is received
router.start();

// Console helpers for local testing only
if (['localhost', '127.0.0.1'].includes(location.hostname) || new URLSearchParams(location.search).has('dev')) {
  window.ghost = { store, router };
}
