import { narrator, speechSupported } from './narrator.js';
import { el, on, prefersReducedMotion } from '../core/dom.js';

const WORDS_PER_SECOND = 2.6;
const PLAY = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>';
const PAUSE = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M7 5h4v14H7zM13 5h4v14h-4z" fill="currentColor"/></svg>';
const STOP = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M6 6h12v12H6z" fill="currentColor"/></svg>';

const MESSAGES = {
  unsupported: 'Audio narration isn’t supported in this browser. Read the transcript below.',
  empty: 'This transmission has no text to read.',
  'no-voice': 'No speech voice could be started on this device. Read the transcript below, or try another browser.',
  'not-allowed': 'The browser blocked audio. Press play again, or read the transcript below.',
  other: 'The voice stopped unexpectedly. You can try again or read the transcript below.',
};

/** Animated bars drawn on a canvas. Speech synthesis exposes no audio data, so the motion is a visualization of the speaking state. */
function createWave(canvas) {
  const ctx = canvas.getContext('2d');
  const N = 36, level = new Float32Array(N), seed = Array.from({ length: N }, () => Math.random() * 6.28);
  const reduced = prefersReducedMotion();
  let w = 0, h = 0, raf = 0, mode = 'idle', energy = 0;

  const color = () => (mode === 'speaking' ? '#ffb454' : mode === 'paused' ? 'rgba(255,180,84,.5)' : 'rgba(138,155,184,.45)');
  const target = (i, t) => {
    if (mode === 'speaking') return reduced ? 0.25 + 0.5 * Math.abs(Math.sin(seed[i] * 3)) : 0.1 + (0.3 + 0.55 * energy) * Math.abs(Math.sin(t / (150 + i * 9) + seed[i]));
    return mode === 'paused' ? 0.12 + 0.1 * Math.abs(Math.sin(seed[i] * 2)) : 0.06;
  };
  const draw = () => {
    ctx.clearRect(0, 0, w, h); ctx.fillStyle = color();
    const bw = w / N;
    for (let i = 0; i < N; i += 1) { const bh = Math.max(2, level[i] * h); ctx.fillRect(i * bw + bw * 0.2, (h - bh) / 2, bw * 0.6, bh); }
  };
  const frame = (t) => {
    let moving = false;
    for (let i = 0; i < N; i += 1) { const d = target(i, t) - level[i]; level[i] += d * (reduced ? 1 : 0.18); if (Math.abs(d) > 0.003) moving = true; }
    energy *= 0.94; draw();
    raf = mode === 'speaking' || moving ? requestAnimationFrame(frame) : 0;
  };
  const fit = () => {
    const r = canvas.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
    w = r.width; h = r.height; canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); draw();
  };
  const ro = new ResizeObserver(fit); ro.observe(canvas);
  return {
    setMode(m) { mode = m; raf ||= requestAnimationFrame(frame); },
    bump() { energy = 1; },
    destroy() { cancelAnimationFrame(raf); ro.disconnect(); },
  };
}

/**
 * The Last Transmission section: FICTIONAL DRAMATIZATION label, compact audio player, transcript.
 * `onHeard` fires when the visitor finishes listening, or marks the transcript as read.
 */
export function createTransmission({ artifact, transmission, onHeard }) {
  const id = artifact.id;
  const paragraphs = (transmission?.text ?? []).map((s) => String(s).trim()).filter(Boolean);
  const seconds = Math.round(paragraphs.join(' ').split(/\s+/).length / WORDS_PER_SECOND);
  const usable = speechSupported && paragraphs.length > 0;
  let outcome = 'ready', lastPara = -1;

  const listen = el('button', { class: 'btn btn--amber tx__listen', type: 'button' }, 'LISTEN TO LAST TRANSMISSION');
  const toggle = el('button', { class: 'tx__toggle', type: 'button' });
  const stop = el('button', { class: 'tx__stop', type: 'button', 'aria-label': 'Stop narration' }, el('span', { class: 'tx__stop-icon' }), 'Stop');
  stop.firstChild.innerHTML = STOP;
  const canvas = el('canvas', { class: 'tx__wave', 'aria-hidden': 'true' });
  const live = el('span', { class: 'tx__live', hidden: true }, el('i', { 'aria-hidden': 'true' }), el('b', { text: 'SPEAKING' }));
  const status = el('p', { class: 'tx__status', role: 'status', 'aria-live': 'polite' });
  const voice = el('span', { class: 'tx__voice' });
  const transcript = paragraphs.map((t, i) => el('p', { dataset: { i }, text: t }));
  const markRead = el('button', { class: 'tx__markread', type: 'button', text: 'Mark transcript as read' });
  const wave = createWave(canvas);

  const root = el('section', { class: 'tx', 'aria-labelledby': 'tx-title', dataset: { state: 'idle' } },
    el('h3', { id: 'tx-title', class: 'tx__title', text: 'Last Transmission' }),
    el('p', { class: 'tx__disclaimer' }, el('strong', { text: 'Not a real recording. ' }),
      'This is a dramatized educational narration written for this project. It is not an actual spacecraft transmission.'),
    el('div', { class: 'tx__player' },
      el('div', { class: 'tx__row tx__row--top' }, el('span', { class: 'tx__fiction', text: 'FICTIONAL DRAMATIZATION' }), live),
      listen,
      el('div', { class: 'tx__row tx__controls' }, toggle, canvas, stop),
      el('p', { class: 'tx__now' }, 'Transmission from ', el('strong', { text: artifact.name }), voice),
      status),
    el('div', { class: 'tx__transcript', role: 'group', 'aria-label': `Transcript of the fictional Last Transmission from ${artifact.name}` }, ...transcript),
    markRead);

  const setStatus = (t) => { status.textContent = t; };
  const idleStatus = () => ({
    ready: `Ready · about ${seconds} seconds read aloud`,
    finished: 'Transmission complete. This was a fictional narration, not a real recording.',
    stopped: 'Stopped. Press play to listen again.',
  }[outcome] ?? MESSAGES[outcome] ?? MESSAGES.other);

  function apply(s) {
    const mine = s.artifactId === id && s.state !== 'idle';
    const state = mine ? s.state : 'idle';
    root.dataset.state = state;
    root.classList.toggle('is-live', mine);
    listen.hidden = mine;
    stop.disabled = !mine || !usable;
    toggle.disabled = !usable;
    const playing = state === 'speaking' || state === 'starting';
    toggle.innerHTML = playing ? PAUSE : PLAY;
    toggle.setAttribute('aria-label', playing ? 'Pause narration' : state === 'paused' ? 'Resume narration' : 'Play Last Transmission');
    live.hidden = !(state === 'speaking' || state === 'paused');
    live.dataset.paused = String(state === 'paused');
    live.lastChild.textContent = state === 'paused' ? 'PAUSED' : 'SPEAKING';
    wave.setMode(state === 'speaking' ? 'speaking' : state === 'idle' ? 'idle' : 'paused');
    voice.textContent = mine ? ` · Voice: ${s.voice ?? 'device default'}` : '';

    transcript.forEach((p, i) => {
      p.classList.toggle('is-current', mine && i === s.paragraph);
      p.classList.toggle('is-done', mine && i < s.paragraph);
    });
    if (mine && s.paragraph !== lastPara) {
      lastPara = s.paragraph;
      transcript[s.paragraph]?.scrollIntoView({ block: 'nearest', behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    }
    if (!mine) lastPara = -1;

    if (!mine) setStatus(idleStatus());
    else if (state === 'starting') setStatus('Starting the voice…');
    else setStatus(`${state === 'paused' ? 'Paused' : 'Speaking'} · part ${s.paragraph + 1} of ${s.total}`);
  }

  function start() {
    outcome = 'ready';
    const r = narrator.speak(id, paragraphs);
    if (!r.ok) { outcome = r.reason; apply(narrator.snapshot()); }
  }
  on(listen, 'click', start);
  on(toggle, 'click', () => {
    const s = narrator.snapshot();
    if (s.artifactId !== id || s.state === 'idle') start();
    else if (s.state === 'paused') narrator.resume();
    else narrator.pause();
  });
  on(stop, 'click', () => narrator.stop());
  const heard = () => { markRead.textContent = 'Transcript counted ✓'; markRead.disabled = true; onHeard(); };
  on(markRead, 'click', heard);

  const offs = [
    narrator.on('state', apply),
    narrator.on('pulse', () => wave.bump()),
    narrator.on('ended', (e) => { if (e.artifactId === id) { outcome = 'finished'; markRead.hidden = true; onHeard(); } }),
    narrator.on('stopped', (e) => { if (e.artifactId === id) outcome = 'stopped'; }),
    narrator.on('error', (e) => { if (e.artifactId === id) outcome = MESSAGES[e.reason] ? e.reason : 'other'; }),
  ];

  // First paint: unsupported, empty, or missing voices
  if (!speechSupported) outcome = 'unsupported';
  else if (!paragraphs.length) { outcome = 'empty'; markRead.hidden = true; }
  listen.disabled = !usable;
  apply(narrator.snapshot());
  if (usable && narrator.voicesLoaded === false && narrator.voiceCount === 0) {
    setStatus(`Ready · about ${seconds} seconds read aloud. If you hear nothing, no speech voice may be installed; the transcript is below.`);
  }

  return {
    element: root,
    destroy() { offs.forEach((off) => off()); wave.destroy(); narrator.stop(); },
  };
}
