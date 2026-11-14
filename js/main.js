import { store } from './core/store.js';
import { Router } from './core/router.js';
import { qs, qsa } from './core/dom.js';
import { initStarfield } from './modules/starfield.js';
import { initHud } from './modules/hud.js';
import { initLanding } from './modules/landing.js';
import { initExplorer } from './modules/explorer.js';
import { initLog } from './modules/log.js';
import { initQuiz } from './modules/quiz.js';
import { initBadgeScreen } from './modules/badge.js';
import { initVisualNovel } from './modules/visualNovel.js';

const screens = new Map(qsa('[data-screen]').flatMap((n) => n.dataset.screen.split(' ').map((name) => [name, n])));
const router = new Router({ screens, announcer: qs('#route-announcer') });

initStarfield(qs('#starfield'));
const log = initLog(router);
initHud(router, { onLockedQuiz: log.open });
initLanding(router);
initExplorer(router);
initQuiz(router);
initBadgeScreen(router);
initVisualNovel(router);
router.start();   // last: every module above must be subscribed before the first route fires

// Console helpers for local testing only
if (['localhost', '127.0.0.1'].includes(location.hostname) || new URLSearchParams(location.search).has('dev')) {
  window.ghost = { store, router };
}
