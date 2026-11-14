// Dev-only test for the visual novel's voice. Run from the project folder:  node tests/story-voice.mjs
// A fake speechSynthesis records what would be spoken, with which voice, pitch and rate.
import { installDom } from './dom-shim.mjs';
const spoken = []; let cancels = 0;
const voices = [
  { name: 'Microsoft Guy Online (Natural) - English (United States)', lang: 'en-US', localService: false },
  { name: 'Microsoft Jenny Online (Natural) - English (United States)', lang: 'en-US', localService: false },
  { name: 'Microsoft Aria Online (Natural) - English (United States)', lang: 'en-US', localService: false },
  { name: 'Amelie', lang: 'fr-CA', localService: true },
];
globalThis.SpeechSynthesisUtterance = class { constructor(t) { this.text = t; } };
globalThis.speechSynthesis = { speaking: false, pending: false, getVoices: () => voices, addEventListener() {}, pause() {}, resume() {},
  speak(u) { spoken.push({ text: u.text, pitch: u.pitch, rate: u.rate, voice: u.voice?.name ?? null, u }); this.speaking = true; },
  cancel() { cancels++; this.speaking = false; } };
const dom = installDom(); const { body, loc, mem } = dom;
const errors = []; process.on('uncaughtException', (e) => { errors.push(e); console.log('UNCAUGHT:', e.stack.split('\n').slice(0, 3).join(' | ')); });
let bad = 0; const check = (ok, msg) => { console.log(ok ? 'ok  :' : 'FAIL:', msg); if (!ok) bad++; };
const wait = (ms = 130) => new Promise((r) => setTimeout(r, ms));   // narrator waits ~80 ms after a cancel before speaking again

const base = new URL('../js/', import.meta.url).href;
const { CHAPTERS, CAST } = await import(base + 'data/visualNovelData.js');
const { store } = await import(base + 'core/store.js');
await import(base + 'main.js');
dom.setReducedMotion(true);
const root = () => body.querySelector('[data-vn-root]');
const q = (s) => root().querySelector(s), qa = (s) => root().querySelectorAll(s);
const click = (n) => n.dispatchEvent({ type: 'click' });
const last = () => spoken.at(-1);

check(CAST.vale.voice && CAST.archie.voice && CAST.you.voice && new Set(Object.values(CAST).map((c) => `${c.voice.role}/${c.voice.pitch}`)).size === 3, 'each character has its own voice profile');

loc.hash = '#/story/ch1';
check(store.vnVoice === true && q('.vn__voice').getAttribute('aria-pressed') === 'true' && q('.vn__voice').textContent === 'Voice: On', 'voice is on by default, with a visible toggle');
check(spoken.length === 0, 'nothing is spoken on the silent title card');
click([...q('.vn__titlecard').walk()].find((n) => n.tagName === 'BUTTON'));
const lines = CHAPTERS[0].scenes[0].lines;
check(spoken.length === 1 && last().text === lines[0].text, 'the first line is spoken as soon as it appears');
check(last().voice.includes('Jenny') && last().pitch === CAST.vale.voice.pitch && last().rate === CAST.vale.voice.rate, 'Director Vale uses the warm narrator voice and her own pitch/rate');

// advance line by line: each new line is spoken once, replacing the previous one
const cancelsBefore = cancels;
click(q('.vn__next')); await wait();
check(spoken.length === 2 && last().text === lines[1].text, 'Next speaks the following line, exactly once');
check(cancels > cancelsBefore, 'advancing cancels the previous line, so voices never overlap');
click(q('.vn__next')); await wait(); click(q('.vn__next')); await wait();
check(last().text === lines[3].text && last().voice.includes('Guy') && last().pitch === CAST.archie.voice.pitch, 'ARCHIE uses a different voice with a higher, faster robotic delivery');
for (let i = 0; i < 12 && !spoken.some((s) => s.text === 'What was the big worry?'); i++) { click(q('.vn__next')); await wait(); }
const you = spoken.find((s) => s.text === 'What was the big worry?');
check(you && you.voice.includes('Aria') && you.pitch === CAST.you.voice.pitch, 'the recruit gets a third, younger voice');
check(new Set([spoken[0].voice, spoken.find((s) => s.text === lines[3].text).voice, you.voice]).size === 3, 'three characters, three distinct voices');

// toggle off / on, replay
const n0 = spoken.length, c0 = cancels;
click(q('.vn__voice'));
check(store.vnVoice === false && q('.vn__voice').textContent === 'Voice: Off' && q('.vn__voice').getAttribute('aria-pressed') === 'false' && cancels > c0, 'turning voice off stops the current line');
check(JSON.parse(mem['ghostMachines:v1']).settings.vnVoice === false, 'the setting is saved in the shared localStorage key');
click(q('.vn__next')); await wait();
check(spoken.length === n0, 'with voice off, new lines are not spoken');
click(q('.vn__voice')); await wait();
check(store.vnVoice === true && spoken.length === n0 + 1, 'turning voice back on speaks the line on screen');
click(q('.vn__replay')); await wait();
check(spoken.length === n0 + 2 && last().text === spoken.at(-2).text, 'Replay voice repeats the current line');

// browser blocks or fails to start speech: the story must carry on
last().u.onerror({ error: 'not-allowed' });
check(q('.vn__vnote').textContent.includes('blocked') && !q('.vn__next').hidden, 'a blocked voice shows a note and the story still works');
click(q('.vn__next')); check(q('.vn__vnote').textContent === '', 'the note clears when the story moves on');

// speaking indicator
last().u.onstart?.();
click(q('.vn__replay')); await wait(); last().u.onstart();
check(q('.vn__dialogue').dataset.speaking === 'true' && !q('.vn__bars').hidden, 'portrait glow and speaking bars show while a line is spoken');
last().u.onend();
check(q('.vn__dialogue').dataset.speaking === 'false', 'the speaking indicator stops when the line ends');

// read-aloud for hotspot notes
for (let i = 0; i < 60 && qa('.vn__spot').length === 0; i++) { const n = q('.vn__next'); if (n && !n.hidden && !n.disabled) { click(n); await wait(20); } }
check(qa('.vn__spot').length === 3, 'reached the exploration scene');
click(qa('.vn__spot')[0]);
const readBtn = [...q('.vn__info').walk()].find((n) => n.tagName === 'BUTTON' && n.textContent === 'Read aloud');
check(!!readBtn && !readBtn.hidden, 'hotspot notes offer a Read aloud button');
const n1 = spoken.length; click(readBtn);
check(spoken.length === n1 + 4 && spoken.slice(n1).map((s) => s.text).join(' ').includes('What it did:') && spoken[n1].voice.includes('Jenny'), 'Read aloud speaks the name, function, significance and fact');
const c1 = cancels; click(q('.vn__x'));
check(q('.vn__info').hidden && cancels > c1, 'closing the notes stops the reading');

// leaving the story stops all speech
click(q('.vn__replay')); await wait(); const c2 = cancels;
loc.hash = '#/moon';
check(cancels > c2 && body.dataset.screen === 'moon', 'leaving the story stops the voice');
await wait(300);
check(errors.length === 0, `no uncaught errors${errors.length ? ': ' + errors[0].message : ''}`);
console.log(bad ? `\n${bad} FAILURE(S)` : '\nALL VOICE CHECKS PASSED'); process.exit(bad ? 1 : 0);
