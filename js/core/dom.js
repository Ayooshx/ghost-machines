export const qs = (sel, root = document) => root.querySelector(sel);
export const qsa = (sel, root = document) => [...root.querySelectorAll(sel)];
export const prefersReducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/** addEventListener that returns an unsubscribe function. */
export function on(target, type, handler, options) {
  target.addEventListener(type, handler, options);
  return () => target.removeEventListener(type, handler, options);
}

/** Tiny element builder: el('i', { class: 'x', dataset: { id: 1 } }, 'text') */
export function el(tag, props = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (v == null || v === false) continue;
    if (k === 'class') node.className = v;
    else if (k === 'text') node.textContent = v;
    else if (k === 'dataset') Object.assign(node.dataset, v);
    else node.setAttribute(k, v === true ? '' : v);
  }
  node.append(...children.filter((c) => c != null && c !== false));
  return node;
}

/** Arrow keys / Home / End move focus between matching items inside container. */
export function rovingKeys(container, selector) {
  const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
  return on(container, 'keydown', (e) => {
    if (!(e.key in step) && e.key !== 'Home' && e.key !== 'End') return;
    const items = qsa(selector, container).filter((n) => !n.closest('[inert]'));
    const i = items.indexOf(document.activeElement);
    if (i < 0) return;
    e.preventDefault();
    items[e.key === 'Home' ? 0 : e.key === 'End' ? items.length - 1 : (i + step[e.key] + items.length) % items.length].focus();
  });
}
