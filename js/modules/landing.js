import { qs, on, prefersReducedMotion } from '../core/dom.js';

const LAUNCH_MS = 950;   // matches the CSS launch transition
const SETTLE_MS = 900;   // keep the "arriving" state until the next screen has faded in

/** Begin expedition: play the launch transition, then route to the Moon without reloading. */
export function initLanding(router) {
  const cta = qs('[data-begin]');
  let launching = false;

  on(cta, 'click', (e) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return; // let the browser handle new-tab clicks
    e.preventDefault();
    if (launching) return;
    if (prefersReducedMotion()) { router.go('moon'); return; }

    launching = true;
    cta.setAttribute('aria-disabled', 'true');
    document.body.classList.add('is-launching');
    setTimeout(() => {
      router.go('moon');
      setTimeout(() => {
        document.body.classList.remove('is-launching');
        cta.removeAttribute('aria-disabled');
        launching = false;
      }, SETTLE_MS);
    }, LAUNCH_MS);
  });
}
