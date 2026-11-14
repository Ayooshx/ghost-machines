import { store } from '../core/store.js';
import { STORY, CAST, CHAPTERS, EVIDENCE, getChapter } from '../data/visualNovelData.js';
import { getArtifact } from '../data/artifacts.js';
import { sceneSvg, portraitSvg } from '../data/sceneArt.js';
import { PLATES } from '../data/plates.js';
import { el, on, qs, prefersReducedMotion } from '../core/dom.js';
import { narrator } from './narrator.js';

const TYPE_MS = 18;   // typewriter speed; any click on the text skips to the full sentence
const shuffle = (list) => { const a = [...list]; for (let i = a.length - 1; i > 0; i -= 1) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const isVoiceId = (id) => id === 'vn' || id === 'vn-info';   // narrator ids used by this module
const tag = (text, kind) => el('span', { class: 'vn-tag', dataset: { kind }, text });

// Small teaching graphics for two challenges
const VISUALS = {
  heat: { label: 'Bar chart: the sensor deeper in the ground reads warmer than the shallow sensor.', svg: '<svg viewBox="0 0 320 120" role="img" aria-label="Bar chart: the sensor deeper in the ground reads warmer than the shallow sensor."><g font-family="sans-serif" font-size="12" fill="#e8eef9"><text x="8" y="28">Shallow sensor</text><rect x="120" y="14" width="80" height="20" fill="#5ad8ff"/><text x="206" y="28" fill="#8fd8ee">cooler</text><text x="8" y="78">Deeper sensor</text><rect x="120" y="64" width="170" height="20" fill="#ffb454"/><text x="190" y="108" fill="#ffb454">warmer</text></g></svg>' },
  ice: { label: 'Two photos of a trench: on day 0 it holds bright lumps, on day 4 they are gone.', svg: '<svg viewBox="0 0 320 120" role="img" aria-label="Two photos of a trench: on day 0 it holds bright lumps, on day 4 they are gone."><g font-family="sans-serif" font-size="12" fill="#e8eef9"><rect x="8" y="8" width="144" height="84" fill="#3a1d1a" stroke="#8d92a6"/><ellipse cx="60" cy="56" rx="12" ry="8" fill="#eaf6ff"/><ellipse cx="100" cy="64" rx="9" ry="6" fill="#eaf6ff"/><text x="8" y="112">Day 0</text><rect x="168" y="8" width="144" height="84" fill="#3a1d1a" stroke="#8d92a6"/><text x="168" y="112">Day 4</text></g></svg>' },
};

/**
 * THE LOST MISSION: a visual novel inside the existing app (#/story and #/story/<chapter>).
 * Story data lives in data/visualNovelData.js; art in data/sceneArt.js. This module is one reusable scene player.
 * Progress (chapters done, evidence, where you stopped) is saved through the shared store, never separately.
 */
export function initVisualNovel(router) {
  const root = qs('[data-vn-root]');
  const live = qs('#route-announcer');
  let run = null;           // the chapter being played: { ch, scenes, i, token, ui }
  let replayNext = false;   // set by "Replay" so the next chapter open starts from the beginning

  // ====================================================================== chapter select
  function continueTarget() {
    const started = CHAPTERS.find((c) => store.isChapterUnlocked(c.id) && !store.isChapterDone(c.id) && store.chapterScene(c.id) > 0);
    return started ?? CHAPTERS.find((c) => store.isChapterUnlocked(c.id) && !store.isChapterDone(c.id)) ?? null;
  }

  function showChapters() {
    endRun();
    root.dataset.mode = 'select';
    const next = continueTarget();
    const cards = CHAPTERS.map((c) => {
      const done = store.isChapterDone(c.id), open = store.isChapterUnlocked(c.id), started = store.chapterScene(c.id) > 0;
      const state = done ? 'done' : !open ? 'locked' : started ? 'progress' : 'ready';
      const label = { done: 'Completed', locked: 'Locked', progress: 'In progress', ready: 'Ready' }[state];
      const art = el('div', { class: 'vn-card__art', 'aria-hidden': 'true' }); art.innerHTML = sceneSvg(c.bg);
      let action;
      if (state === 'locked') action = el('p', { class: 'vn-card__lock', text: `Finish chapter ${c.number - 1} to unlock.` });
      else {
        action = el('a', { class: `btn ${done ? '' : 'btn--amber'}`, href: `#/story/${c.id}`, text: done ? 'Replay chapter' : started ? 'Continue' : 'Start chapter', 'aria-label': `${done ? 'Replay' : started ? 'Continue' : 'Start'} chapter ${c.number}: ${c.title}` });
        if (done) on(action, 'click', () => { replayNext = true; });
      }
      return el('li', { class: 'vn-card', dataset: { state, id: c.id } }, art,
        el('div', { class: 'vn-card__body' }, el('p', { class: 'vn-card__no', text: `Chapter ${c.number}` }), el('h3', { text: c.title }), el('p', { class: 'vn-card__loc', text: c.location }),
          el('span', { class: 'chip', dataset: { status: done ? 'cataloged' : 'undiscovered' }, text: label }), action));
    });
    const doneN = store.storyDoneCount;
    root.replaceChildren(el('div', { class: 'vn-select' },
      el('header', { class: 'vn-select__head' },
        el('p', { class: 'panel__eyebrow', text: 'Visual novel' }),
        el('h2', { class: 'vn-select__title', text: STORY.title }),
        el('p', { class: 'vn-select__sub', text: STORY.subtitle }),
        el('p', { class: 'vn-note' }, tag('FICTION', 'fiction'), ` ${STORY.fictionNote}`),
        el('div', { class: 'vn-select__progress' }, el('progress', { max: String(CHAPTERS.length), value: String(doneN), 'aria-label': 'Chapters completed' }), el('span', { text: `${doneN} / ${CHAPTERS.length} chapters · ${store.evidenceCount} / ${store.evidenceTotal} evidence` })),
        el('p', { class: 'vn-select__actions' },
          next && el('a', { class: 'btn btn--amber', href: `#/story/${next.id}`, text: store.chapterScene(next.id) > 0 ? 'Continue story' : doneN ? 'Next chapter' : 'Start the story' }),
          el('a', { class: 'btn', href: '#/moon', text: 'Return to Expedition' }))),
      el('ol', { class: 'vn-cards' }, ...cards)));
  }

  // ====================================================================== chapter player
  function openChapter(id) {
    const ch = getChapter(id);
    if (!ch || !store.isChapterUnlocked(id)) { router.go('story', undefined, { replace: true }); return; }
    endRun();
    const fresh = replayNext; replayNext = false;
    const scenes = [{ type: 'title' }, ...ch.scenes, { type: 'complete' }];
    const ui = buildStage(ch);
    run = { ch, scenes, i: 0, token: 0, ui, typer: { timer: 0, full: '', done: true }, off: [] };
    const saved = fresh ? 0 : store.chapterScene(id);
    refreshEvidence();
    goScene(Math.min(saved, scenes.length - 2));
    live.textContent = `Chapter ${ch.number}: ${ch.title}`;
  }

  function buildStage(ch) {
    const ui = {};
    ui.bgHost = el('div', { class: 'vn__bgs' });
    ui.hotspots = el('div', { class: 'vn__hotspots' });
    ui.variants = el('div', { class: 'vn__variants', role: 'group', 'aria-label': 'Choose a site', hidden: true });
    ui.info = el('aside', { class: 'vn__info glass', 'aria-label': 'Inspection notes', hidden: true });
    ui.overlay = el('div', { class: 'vn__overlay', hidden: true });
    ui.bar = el('i');
    ui.evBtn = el('button', { class: 'vn__evbtn', type: 'button', 'aria-expanded': 'false' });
    ui.voiceBtn = el('button', { class: 'vn__voice', type: 'button' });
    ui.evPanel = el('aside', { class: 'vn__evidence glass', 'aria-label': 'Evidence collected', hidden: true });
    ui.stage = el('div', { class: 'vn__stage', dataset: { world: ch.world } }, ui.bgHost,
      el('div', { class: 'vn__motes', 'aria-hidden': 'true' }, ...Array.from({ length: 16 }, (_, k) => el('span', { style: `--k:${k}` }))),
      el('div', { class: 'vn__vignette', 'aria-hidden': 'true' }), ui.hotspots, ui.variants, ui.info, ui.overlay,
      el('div', { class: 'vn__top' },
        el('a', { class: 'vn__back', href: '#/story', text: '‹ Chapters' }),
        el('span', { class: 'vn__where', text: `Chapter ${ch.number} · ${ch.title}` }),
        ui.voiceBtn, ui.evBtn),
      el('div', { class: 'vn__progress', role: 'progressbar', 'aria-label': 'Chapter progress', 'aria-valuemin': '0', 'aria-valuemax': '100' }, ui.bar),
      el('p', { class: 'vn__legend', 'aria-hidden': 'true' }, tag('FICTION', 'fiction'), ' story  ', tag('REAL', 'real'), ' facts · artwork is illustration', ), ui.evPanel);
    ui.portrait = el('div', { class: 'vn__portrait', 'aria-hidden': 'true' });
    ui.name = el('b', { class: 'vn__name' }); ui.role = el('span', { class: 'vn__role' });
    ui.text = el('p', { class: 'vn__text', 'aria-hidden': 'true' });
    ui.sr = el('p', { class: 'sr-only', 'aria-live': 'polite' });
    ui.choices = el('div', { class: 'vn__choices', role: 'group' });
    ui.hint = el('p', { class: 'vn__hint', role: 'status', 'aria-live': 'polite' });
    ui.next = el('button', { class: 'btn vn__next', type: 'button', text: 'Next' });
    ui.replay = el('button', { class: 'vn__replay', type: 'button', text: 'Replay voice' });
    ui.vnote = el('p', { class: 'vn__vnote', role: 'status', 'aria-live': 'polite' });
    ui.bars = el('span', { class: 'vn__bars', 'aria-hidden': 'true', hidden: true }, el('i'), el('i'), el('i'), el('i'));
    ui.dialogue = el('section', { class: 'vn__dialogue glass', 'aria-label': 'Dialogue' }, ui.portrait,
      el('div', { class: 'vn__main' }, el('p', { class: 'vn__who' }, ui.name, ui.role, tag('FICTION', 'fiction'), ui.bars), ui.text, ui.sr, ui.choices, ui.hint),
      el('div', { class: 'vn__actions' }, ui.next, ui.replay, ui.vnote));
    root.dataset.mode = 'play';
    root.replaceChildren(ui.stage, ui.dialogue);

    // keep hotspots aligned with the cropped artwork (the scene covers the stage like background-size: cover)
    const fit = () => { const w = ui.stage.clientWidth || 1, h = ui.stage.clientHeight || 1, s = Math.max(w / 1600, h / 900);
      ui.stage.style.setProperty('--s', `${s}px`); ui.stage.style.setProperty('--ox', `${(w - 1600 * s) / 2}px`); ui.stage.style.setProperty('--oy', `${(h - 900 * s) / 2}px`); };
    fit(); const ro = new ResizeObserver(fit); ro.observe(ui.stage); ui.ro = ro;

    on(ui.text, 'click', () => finishType());
    on(ui.next, 'click', () => ui.onNext?.());
    on(ui.evBtn, 'click', () => toggleEvidence());
    on(ui.voiceBtn, 'click', toggleVoice);
    on(ui.replay, 'click', () => speakLine(run.typer.full));
    // the portrait glows and the bars move while a story line is being spoken
    ui.pending = [narrator.on('state', (s) => { if (!run) return; const talking = s.artifactId === 'vn' && (s.state === 'speaking' || s.state === 'starting'); ui.dialogue.dataset.speaking = String(talking); ui.bars.hidden = !talking; }),
      narrator.on('error', (e) => { if (run && isVoiceId(e.artifactId)) ui.vnote.textContent = e.reason === 'not-allowed' ? 'The browser blocked the voice. Press “Replay voice”.' : 'The voice could not start on this device. The text is still here.'; }),
      narrator.on('ended', (e) => { if (run && isVoiceId(e.artifactId)) ui.vnote.textContent = ''; })];
    syncVoiceUi(ui);
    on(root, 'keydown', (e) => { if (e.key === 'Escape') { ui.info.hidden = true; if (!ui.evPanel.hidden) toggleEvidence(false); } });
    refreshEvidence();
    return ui;
  }

  function endRun() {
    if (!run) return;
    clearInterval(run.typer.timer);
    run.ui.pending?.forEach((off) => off());
    if (isVoiceId(narrator.artifactId)) narrator.stop();
    run.ui.ro?.disconnect();
    run.token += 1;
    run = null;
  }

  // ---------------------------------------------------------------- scene player
  function goScene(i) {
    const { ui, ch, scenes } = run;
    run.i = i; run.token += 1;
    const token = run.token, scene = scenes[i];
    clearScene();
    ui.bar.style.width = `${(i / (scenes.length - 1)) * 100}%`;
    ui.stage.querySelector('.vn__progress').setAttribute('aria-valuenow', String(Math.round((i / (scenes.length - 1)) * 100)));
    if (i > 0 && i < scenes.length - 1) store.setChapterScene(ch.id, i);   // saved silently so "Continue" resumes here
    setBg(scene.bg ?? ch.bg);
    const advance = () => { if (run && run.token === token) goScene(i + 1); };
    ({ title: sceneTitle, dialogue: sceneDialogue, choice: sceneChoice, explore: sceneExplore, evidence: sceneEvidence, challenge: sceneChallenge, history: sceneHistory, complete: sceneComplete })[scene.type](scene, advance, token);
  }

  function clearScene() {
    const { ui } = run;
    clearInterval(run.typer.timer); run.typer.done = true;
    if (isVoiceId(narrator.artifactId)) narrator.stop();   // a new scene never talks over the old one
    ui.vnote.textContent = '';
    ui.hotspots.replaceChildren(); ui.info.hidden = true; ui.overlay.hidden = true; ui.overlay.replaceChildren();
    ui.choices.replaceChildren(); ui.variants.replaceChildren(); ui.variants.hidden = true; ui.hint.textContent = '';
    ui.next.hidden = false; ui.next.disabled = false; ui.next.textContent = 'Next'; ui.dialogue.hidden = false; ui.onNext = null;
  }

  function setBg(bg) {
    const { ui } = run;
    if (ui.bgId === bg) return;
    ui.bgId = bg;
    const layer = el('div', { class: 'vn__bg' }); layer.innerHTML = sceneSvg(bg);
    ui.bgHost.append(layer);
    requestAnimationFrame(() => layer.classList.add('is-in'));
    const old = [...ui.bgHost.children].filter((n) => n !== layer);
    setTimeout(() => old.forEach((n) => n.remove()), 800);
  }

  // typewriter: instant under reduced motion; clicking the text (or Next) completes the sentence
  function setSpeaker(who) {
    const { ui } = run, c = CAST[who];
    ui.name.textContent = c.name; ui.role.textContent = c.role; ui.portrait.innerHTML = portraitSvg(c.portrait); ui.dialogue.dataset.who = who;
  }
  function startType(text) {
    const { ui, typer } = run;
    clearInterval(typer.timer); typer.full = text; ui.sr.textContent = text;
    if (store.vnVoice) speakLine(text);
    if (prefersReducedMotion()) { ui.text.textContent = text; typer.done = true; return; }
    typer.done = false; ui.text.textContent = ''; ui.text.classList.add('is-typing');
    let n = 0;
    typer.timer = setInterval(() => { n += 1; ui.text.textContent = text.slice(0, n); if (n >= text.length) finishType(); }, TYPE_MS);
  }
  function finishType() {
    if (!run) return;
    const { ui, typer } = run;
    clearInterval(typer.timer); typer.timer = 0; ui.text.textContent = typer.full; ui.text.classList.remove('is-typing'); typer.done = true;
  }
  // ---------------------------------------------------------------- voice (Web Speech API, via narrator.js)
  /** Speaks one story line in the current speaker's voice. Never blocks the story: Next always works. */
  function speakLine(text) {
    if (!run || !text || !narrator.supported) return;
    const profile = CAST[run.ui.dialogue.dataset.who]?.voice ?? {};
    narrator.speak('vn', [text], { role: profile.role, rate: profile.rate, pitch: profile.pitch });
  }
  function syncVoiceUi(ui = run?.ui) {
    if (!ui) return;
    const ok = narrator.supported, on_ = ok && store.vnVoice;
    ui.voiceBtn.disabled = !ok;
    ui.voiceBtn.setAttribute('aria-pressed', String(on_));
    ui.voiceBtn.textContent = ok ? `Voice: ${on_ ? 'On' : 'Off'}` : 'Voice: not available';
    ui.voiceBtn.title = ok ? 'Read the story aloud with your browser’s voices' : 'This browser cannot read text aloud';
    ui.replay.hidden = !ok;
  }
  function toggleVoice() {
    if (!run || !narrator.supported) return;
    store.setVnVoice(!store.vnVoice);
    syncVoiceUi();
    if (store.vnVoice) speakLine(run.typer.full); else if (isVoiceId(narrator.artifactId)) narrator.stop();
  }
  /** Read-aloud button for the hotspot notes and the history card (works even when story voice is off). */
  function readAloudButton(getParagraphs) {
    const b = el('button', { class: 'vn__read', type: 'button', text: 'Read aloud', hidden: !narrator.supported });
    on(b, 'click', () => narrator.speak('vn-info', getParagraphs(), { role: 'narrator' }));
    return b;
  }

  /** Shows lines one at a time. Next completes the sentence first, then moves on. */
  function say(lines, then, lastLabel = 'Next') {
    const { ui } = run, token = run.token;
    let k = 0;
    const show = () => { setSpeaker(lines[k].who); startType(lines[k].text); ui.next.hidden = false; ui.next.textContent = k === lines.length - 1 ? lastLabel : 'Next'; ui.next.focus(); };
    ui.onNext = () => {
      if (!run || run.token !== token) return;
      if (!run.typer.done) { finishType(); return; }
      k += 1;
      if (k < lines.length) show(); else then();
    };
    show();
  }

  // ---------------------------------------------------------------- scene types
  function sceneTitle(scene, advance) {
    const { ui, ch } = run;
    ui.dialogue.hidden = true; ui.overlay.hidden = false;
    const begin = el('button', { class: 'btn btn--amber', type: 'button', text: 'Begin chapter' }); on(begin, 'click', advance);
    ui.overlay.replaceChildren(el('div', { class: 'vn__titlecard' }, el('p', { class: 'vn__kicker', text: `Chapter ${ch.number}` }), el('h2', { text: ch.title }), el('p', { class: 'vn__loc', text: ch.location }),
      el('p', { class: 'vn-note' }, tag('FICTION', 'fiction'), ' story, ', tag('REAL', 'real'), ' facts'), begin));
    begin.focus();
  }
  function sceneDialogue(scene, advance) { say(scene.lines, advance); }

  function sceneChoice(scene, advance, token) {
    const { ui } = run;
    setSpeaker(scene.who); startType(scene.prompt); ui.next.hidden = true;
    let locked = false;
    ui.choices.setAttribute('aria-label', 'Choose a response');
    const buttons = scene.options.map((o) => el('button', { class: 'vn__choice', type: 'button', text: o.text }));
    buttons.forEach((b, k) => on(b, 'click', () => {
      if (locked || !run || run.token !== token) return;     // a choice can only fire once
      locked = true; finishType();
      buttons.forEach((x, j) => { x.disabled = true; x.dataset.state = j === k ? 'chosen' : 'idle'; });
      say(scene.options[k].reply, advance);
    }));
    ui.choices.append(...buttons); buttons[0].focus();
  }

  function sceneExplore(scene, advance, token) {
    const { ui } = run;
    const variants = scene.variants ?? [{ id: 'main', spots: scene.spots }];
    const seen = new Set(); let vi = 0;
    setSpeaker('archie'); startType(scene.prompt);
    ui.next.textContent = 'Continue'; ui.next.disabled = true;
    const satisfied = () => (scene.perVariant ? variants.every((v) => v.spots.filter((s) => seen.has(`${v.id}:${s.id}`)).length >= scene.need) : seen.size >= scene.need);
    const progressText = () => (scene.perVariant ? `${variants.filter((v) => v.spots.some((s) => seen.has(`${v.id}:${s.id}`))).length} of ${variants.length} sites inspected` : `${Math.min(seen.size, scene.need)} of ${scene.need} inspected`);
    const update = () => { ui.next.disabled = !satisfied(); ui.hint.textContent = satisfied() ? 'Ready to continue.' : progressText(); };

    const showInfo = (spot) => {
      ui.info.replaceChildren(
        el('div', { class: 'vn__infohead' }, tag('REAL FACT', 'real'), readAloudButton(() => [`${spot.name}.`, `What it did: ${spot.does}`, `Why it matters: ${spot.matters}`, `Interesting fact: ${spot.fact}`]), el('button', { class: 'vn__x', type: 'button', 'aria-label': 'Close notes', text: '×' })),
        el('h3', { text: spot.name }),
        el('dl', {}, el('div', {}, el('dt', { text: 'What it did' }), el('dd', { text: spot.does })), el('div', {}, el('dt', { text: 'Why it matters' }), el('dd', { text: spot.matters })), el('div', {}, el('dt', { text: 'Interesting fact' }), el('dd', { text: spot.fact }))));
      on(ui.info.querySelector('.vn__x'), 'click', () => { ui.info.hidden = true; if (narrator.artifactId === 'vn-info') narrator.stop(); });
      ui.info.hidden = false;
    };
    const renderVariant = () => {
      const v = variants[vi];
      ui.hotspots.replaceChildren(); ui.info.hidden = true;
      if (v.bg) setBg(v.bg);
      v.spots.forEach((s) => {
        const b = el('button', { class: 'vn__spot', type: 'button', 'aria-label': `Inspect: ${s.label}`, dataset: { id: s.id, seen: String(seen.has(`${v.id}:${s.id}`)) } }, el('span', { class: 'vn__spot-ring' }), el('span', { class: 'vn__spot-label', text: s.label }));
        b.style.setProperty('--hx', s.x); b.style.setProperty('--hy', s.y);
        on(b, 'click', () => { if (!run || run.token !== token) return; seen.add(`${v.id}:${s.id}`); b.dataset.seen = 'true'; showInfo(s); update(); });
        ui.hotspots.append(b);
      });
    };
    if (scene.variants) {
      ui.variants.hidden = false;
      const tabs = variants.map((v, k) => el('button', { class: 'vn__variant', type: 'button', 'aria-pressed': String(k === 0), text: v.label }));
      tabs.forEach((t, k) => on(t, 'click', () => { vi = k; tabs.forEach((x, j) => x.setAttribute('aria-pressed', String(j === k))); renderVariant(); }));
      ui.variants.append(...tabs);
    }
    renderVariant(); update();
    ui.onNext = () => { if (!run || run.token !== token) return; if (!run.typer.done) { finishType(); return; } if (satisfied()) advance(); };
    (ui.hotspots.firstChild ?? ui.next).focus();
  }

  function sceneEvidence(scene, advance) {
    const { ui } = run;
    const isNew = store.collectEvidence(scene.id);
    refreshEvidence();
    ui.overlay.hidden = false;
    const icon = el('span', { class: 'vn__plate', 'aria-hidden': 'true' }); icon.innerHTML = PLATES[scene.plate] ?? '';
    ui.overlay.replaceChildren(el('div', { class: 'vn__card vn__card--evidence', role: 'group', 'aria-label': 'Evidence collected' }, icon, el('div', {},
      tag('EVIDENCE', 'real'), el('h3', { text: scene.title }), el('p', { class: 'vn__kind', text: scene.kind }), el('p', { text: scene.text }), el('p', { class: 'vn__added', text: isNew ? 'Added to your evidence panel.' : 'Already in your evidence panel.' }))));
    say(scene.lines, advance, 'Continue');
  }

  function sceneChallenge(scene, advance, token) {
    const { ui } = run;
    let qi = 0;
    const showQ = () => {
      const q = scene.questions[qi], last = qi === scene.questions.length - 1;
      ui.choices.replaceChildren(); ui.next.hidden = true; ui.hint.textContent = scene.questions.length > 1 ? `Question ${qi + 1} of ${scene.questions.length}` : '';
      setSpeaker('archie'); startType(q.prompt);
      if (scene.visual) { ui.overlay.hidden = false; const v = VISUALS[scene.visual]; const card = el('div', { class: 'vn__card vn__card--visual', role: 'group', 'aria-label': v.label }); card.innerHTML = v.svg; ui.overlay.replaceChildren(card, el('p', { class: 'vn__sim', text: 'Simplified teaching graphic' })); }
      let locked = false;
      const pairs = shuffle(q.options).map((o) => ({ o, b: el('button', { class: 'vn__choice', type: 'button', text: o.text }) }));
      const opts = pairs.map((p) => p.b);
      pairs.forEach(({ o: picked, b }) => on(b, 'click', () => {
        if (locked || !run || run.token !== token) return;     // one answer per question
        locked = true; finishType();
        const right = q.options.find((x) => x.ok);
        pairs.forEach(({ o, b: x }) => { x.disabled = true; x.dataset.state = o.ok ? 'correct' : x === b ? 'wrong' : 'idle'; });
        startType(`${picked.ok ? 'Correct! ' : 'Not quite. '}${picked.why}${picked.ok ? '' : ` The answer: ${right.text}`}`);
        ui.next.hidden = false; ui.next.textContent = last ? 'Continue' : 'Next question'; ui.next.focus();
        ui.onNext = () => { if (!run || run.token !== token) return; if (!run.typer.done) { finishType(); return; } if (last) advance(); else { qi += 1; showQ(); } };
      }));
      ui.choices.append(...opts); opts[0].focus();
    };
    showQ();
  }

  function sceneHistory(scene, advance) {
    const { ui } = run;
    ui.overlay.hidden = false;
    ui.overlay.replaceChildren(el('div', { class: 'vn__card vn__card--history', role: 'group', 'aria-label': 'Real history' },
      tag('REAL HISTORY', 'real'), readAloudButton(() => [scene.title, ...scene.text]), el('h3', { text: scene.title }), ...scene.text.map((t) => el('p', { text: t })),
      el('p', { class: 'vn__sources' }, 'NASA sources: ', ...scene.sources.flatMap((s, k) => [k ? ' · ' : '', el('a', { href: s.url, target: '_blank', rel: 'noopener noreferrer', text: s.label })]))));
    say([{ who: 'archie', text: 'That is the real history, separate from our story. Take a moment to read it.' }], advance, 'Continue');
  }

  function sceneComplete(scene, advance) {
    const { ui, ch } = run;
    store.completeChapter(ch.id);
    const art = getArtifact(ch.artifactId), nextCh = CHAPTERS[CHAPTERS.findIndex((c) => c.id === ch.id) + 1], all = store.storyDoneCount === CHAPTERS.length;
    ui.dialogue.hidden = true; ui.overlay.hidden = false;
    const replay = el('a', { class: 'btn', href: `#/story/${ch.id}`, text: 'Replay chapter' }); on(replay, 'click', () => { replayNext = true; });
    const finale = all && !nextCh;
    ui.overlay.replaceChildren(el('div', { class: 'vn__card vn__card--complete', role: 'group', 'aria-label': 'Chapter complete' },
      el('p', { class: 'vn__kicker', text: finale ? 'The Lost Mission' : `Chapter ${ch.number} complete` }),
      el('h2', { text: finale ? 'Expedition complete' : ch.title }),
      el('p', { text: finale
        ? 'You investigated all eight forgotten explorers. Every machine you met is on the map in the main expedition. Open each dossier, listen to each Last Transmission, then take the final quiz.'
        : `You investigated ${art.name}. Evidence in your log: ${store.evidenceCount} of ${store.evidenceTotal}.` }),
      el('p', { class: 'vn__links' },
        nextCh && el('a', { class: 'btn btn--amber', href: `#/story/${nextCh.id}`, text: `Next: ${nextCh.title}` }),
        finale && el('a', { class: 'btn btn--amber', href: '#/moon', text: 'Go to the artifact catalogue' }),
        finale && store.isQuizUnlocked() && el('a', { class: 'btn', href: '#/quiz', text: 'Take the quiz' }),
        el('a', { class: 'btn', href: `#/${ch.world}/${ch.artifactId}`, text: 'Open this dossier' }),
        replay, el('a', { class: 'btn', href: '#/story', text: 'All chapters' }), el('a', { class: 'btn', href: '#/moon', text: 'Return to Expedition' }))));
    ui.overlay.querySelector('a.btn')?.focus();
    live.textContent = finale ? 'Expedition complete. All eight chapters finished.' : `Chapter ${ch.number} complete.`;
  }

  // ---------------------------------------------------------------- evidence panel
  function refreshEvidence() {
    if (!run) return;
    const { ui } = run;
    ui.evBtn.textContent = `Evidence ${store.evidenceCount} / ${store.evidenceTotal}`;
    ui.evPanel.replaceChildren(el('h3', { text: 'Evidence collected' }), el('ul', {}, ...EVIDENCE.map((e) => {
      const has = store.hasEvidence(e.id), n = CHAPTERS.find((c) => c.id === e.chapterId).number;
      return el('li', { dataset: { state: has ? 'found' : 'locked' } }, el('b', { text: has ? e.title : `Chapter ${n}: not found yet` }), has && el('span', { text: e.kind }));
    })));
  }
  function toggleEvidence(force) {
    const { ui } = run, open = force ?? ui.evPanel.hidden;
    ui.evPanel.hidden = !open; ui.evBtn.setAttribute('aria-expanded', String(open));
  }

  // ---------------------------------------------------------------- routing
  router.addEventListener('route', (e) => {
    if (e.detail.screen !== 'story') { endRun(); return; }
    e.detail.artifactId ? openChapter(e.detail.artifactId) : showChapters();   // for #/story the "artifactId" slot carries the chapter id
  });
}
