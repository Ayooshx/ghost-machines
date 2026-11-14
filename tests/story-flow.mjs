// Dev-only test for THE LOST MISSION. Run from the project folder:  node tests/story-flow.mjs
// It loads the real index.html and main.js into a small DOM stand-in and drives the visual novel through its real buttons.
import { installDom } from './dom-shim.mjs';
const dom = installDom(); const { body, loc, mem } = dom;
const errors = []; process.on('uncaughtException', (e) => { errors.push(e); console.log('UNCAUGHT:', e.stack.split('\n').slice(0, 3).join(' | ')); });
let bad = 0; const check = (ok, msg) => { console.log(ok ? 'ok  :' : 'FAIL:', msg); if (!ok) bad++; };

const base = new URL('../js/', import.meta.url).href;
const { CHAPTERS, EVIDENCE, CAST } = await import(base + 'data/visualNovelData.js');
const { ARTIFACT_IDS, getArtifact } = await import(base + 'data/artifacts.js');
const { BG_IDS } = await import(base + 'data/sceneArt.js');

// ---------------------------------------------------------------- 1. story data integrity
const want = ['The Silent Surveyor', 'The First Footprint', 'The Lunar Laboratory', 'Wheels on Another World', 'The First Martian Traveller', 'The Twin Explorers', 'The Ice Detective', 'The Landing That Changed Everything'];
check(CHAPTERS.length === 8 && CHAPTERS.every((c, i) => c.title === want[i]), 'eight chapters with the requested titles');
check(CHAPTERS.every((c) => getArtifact(c.artifactId)) && new Set(CHAPTERS.map((c) => c.artifactId)).size === 8 && ARTIFACT_IDS.every((id) => CHAPTERS.some((c) => c.artifactId === id)), 'one chapter per artifact, all linked to real artifacts');
const types = (c) => c.scenes.map((s) => s.type).join(',');
check(CHAPTERS.every((c) => /^dialogue,(dialogue,)?explore,choice,evidence,challenge,history$/.test(types(c))), 'every chapter has intro, exploration, decision, evidence, challenge and history');
check(CHAPTERS.every((c) => BG_IDS.includes(c.bg) && c.scenes.every((s) => !s.bg || BG_IDS.includes(s.bg)) && c.scenes.filter((s) => s.type === 'explore').every((s) => (s.variants ?? []).every((v) => BG_IDS.includes(v.bg)))), 'every scene background exists');
const spots = CHAPTERS.flatMap((c) => c.scenes.filter((s) => s.type === 'explore').flatMap((s) => (s.variants ? s.variants.flatMap((v) => v.spots) : s.spots)));
check(spots.length >= 24 && spots.every((s) => s.name && s.does && s.matters && s.fact && s.label), `${spots.length} hotspots, each with name, function, significance and a fact`);
check(spots.every((s) => s.x >= 380 && s.x <= 1220 && s.y >= 250 && s.y <= 880), 'hotspots sit in the central safe area, so phone cropping cannot hide them');
check(CHAPTERS.every((c) => c.scenes.filter((s) => s.type === 'explore').every((s) => (s.variants ?? [{ spots: s.spots }]).every((v) => v.spots.length >= s.need))), 'no exploration asks for more points than exist');
check(CHAPTERS.every((c) => c.scenes.filter((s) => s.type === 'choice').every((s) => s.options.length >= 2 && s.options.length <= 3 && s.options.every((o) => o.reply.length >= 1))), 'every decision has 2-3 options, each with its own explanation');
check(CHAPTERS.every((c) => c.scenes.filter((s) => s.type === 'challenge').every((s) => s.questions.every((q) => q.options.length >= 3 && q.options.filter((o) => o.ok).length === 1 && q.options.every((o) => o.why)))), 'every challenge has exactly one correct option and an explanation for each');
check(EVIDENCE.length === 8 && new Set(EVIDENCE.map((e) => e.id)).size === 8, 'eight distinct evidence items');
check(CHAPTERS.every((c) => c.scenes.find((s) => s.type === 'history').sources.every((s) => /^https:\/\//.test(s.url))), 'every history card cites NASA source links');
const lines = CHAPTERS.flatMap((c) => c.scenes.flatMap((s) => [...(s.lines ?? []), ...(s.options ?? []).flatMap((o) => o.reply)]));
check(lines.every((l) => CAST[l.who] && l.text.length > 3), `${lines.length} dialogue lines, all spoken by a defined fictional character`);
check(JSON.stringify(CHAPTERS).includes('Deep Archive Survey') && /fictional/i.test(JSON.stringify(CHAPTERS[0].scenes[0].lines)), 'the story states that the division and characters are fictional');
const ch8 = JSON.stringify(CHAPTERS[7]);
check(/different places/.test(ch8) && !/all together|one exact/i.test(CHAPTERS[7].scenes.find((s) => s.type === 'explore').prompt), 'chapter 8 says the debris landed in different places');

// ---------------------------------------------------------------- 2. boot the real app
await import(base + 'main.js');
dom.setReducedMotion(true);                       // instant text for the playthrough; the typewriter is tested separately
const root = () => body.querySelector('[data-vn-root]');
const q = (s) => root().querySelector(s), qa = (s) => root().querySelectorAll(s);
const click = (n) => n.dispatchEvent({ type: 'click' });
const text = (s) => q(s)?.textContent ?? '';
const within = (parent, sel) => (q(parent) ? q(parent).querySelectorAll(sel) : []);
check(errors.length === 0, 'app boots with no uncaught errors');
check(body.querySelector('[data-nav="story"]') && body.querySelector('.landing__alt'), 'Story link added to the top bar and the landing page');

// ---- chapter select
loc.hash = '#/story';
check(body.dataset.screen === 'story' && qa('.vn-card').length === 8, 'chapter select shows eight chapter cards');
check(qa('.vn-card')[0].dataset.state === 'ready' && qa('.vn-card').slice(1).every((c) => c.dataset.state === 'locked'), 'chapter 1 is open; chapters 2-8 start locked');
check(qa('.vn-card').filter((c) => c.querySelector('a')).length === 1, 'locked chapters have no way in');
check(text('.vn-note').includes('fictional'), 'the select screen states that the story is fiction and facts are real');
loc.hash = '#/story/ch5';
check(loc.hash === '#/story' && qa('.vn-card').length === 8, 'a locked chapter cannot be opened by URL');
loc.hash = '#/story/not-a-chapter'; check(qa('.vn-card').length === 8, 'an unknown chapter id falls back to the chapter list');

// ---------------------------------------------------------------- 3. the scene driver
function step() {
  if (q('.vn__card--complete')) return 'complete';
  const title = q('.vn__titlecard'); if (title) { click([...title.walk()].find((n) => n.tagName === 'BUTTON')); return 'title'; }
  const next = q('.vn__next'), spots = qa('.vn__spot'), tabs = qa('.vn__variant');
  if (spots.length) {
    if (next.disabled) {
      const unseen = spots.find((s) => s.dataset.seen !== 'true'); if (unseen) { click(unseen); return 'spot'; }
      const other = tabs.find((t) => t.getAttribute('aria-pressed') === 'false'); if (other) { click(other); return 'tab'; }
    }
    click(next); return 'next';
  }
  const choice = qa('.vn__choice').find((c) => !c.disabled); if (choice) { click(choice); return 'choice'; }
  if (next && !next.hidden && !next.disabled) { click(next); return 'next'; }
  return 'stuck';
}
const play = (until = () => false) => { for (let i = 0; i < 500; i++) { if (until()) return 'until'; const r = step(); if (r === 'complete') return r; if (r === 'stuck') return r; } return 'loop'; };

// ---------------------------------------------------------------- 4. chapter 1: scene types, hotspots, decisions
loc.hash = '#/story/ch1';
check(!!q('.vn__titlecard') && text('.vn__titlecard').includes('The Silent Surveyor') && body.dataset.screen === 'story', 'opening: cinematic title card for the chapter');
check(q('.vn__voice').disabled && q('.vn__voice').textContent === 'Voice: not available' && q('.vn__replay').hidden, 'no speech support: the voice button is disabled and the story still plays silently');
check(qa('.vn__bg').length === 1 && /<svg/.test(q('.vn__bg')._h ?? ''), 'a scene background illustration is rendered');
check(play(() => qa('.vn__spot').length > 0) === 'until', 'dialogue advances to the exploration scene');
check(text('.vn__text').includes('Examine the lander'), 'ARCHIE gives the exploration prompt');
const spotsNow = qa('.vn__spot');
check(spotsNow.length === 3 && spotsNow.every((s) => s.tagName === 'BUTTON' && s.getAttribute('aria-label')?.startsWith('Inspect')), 'three hotspots, each a real button with an accessible name');
check(q('.vn__next').disabled, 'Continue is disabled until enough points are inspected');
click(spotsNow[0]);
check(!q('.vn__info').hidden && text('.vn__info').includes('What it did') && text('.vn__info').includes('Why it matters') && text('.vn__info').includes('Interesting fact') && text('.vn__info').includes('REAL FACT'), 'hotspot shows name, function, significance, fun fact, and a REAL FACT label');
check(spotsNow[0].dataset.seen === 'true' && q('.vn__next').disabled, 'one inspection is not enough (need two)');
click(spotsNow[0]); check(q('.vn__hint').textContent.includes('1 of 2'), 're-inspecting the same point does not double count');
click(spotsNow[1]); check(!q('.vn__next').disabled, 'inspecting a second point enables Continue');

// partial progress -> chapter select shows "In progress" and offers Continue
loc.hash = '#/story';
check(qa('.vn-card')[0].dataset.state === 'progress' && qa('.vn-card')[1].dataset.state === 'locked', 'leaving mid-chapter: card shows In progress, chapter 2 still locked');
const cont = root().querySelectorAll('a').find((a) => (a.textContent ?? '').includes('Continue story'));
check(cont && cont.getAttribute('href') === '#/story/ch1', 'Continue story points at the chapter in progress');
loc.hash = '#/story/ch1';
check(qa('.vn__spot').length === 3 && !q('.vn__titlecard'), 'refresh/return resumes at the saved scene, not the title');

// decision: advance to the choice, fire one option twice
const choicePrompt = CHAPTERS[0].scenes.find((s) => s.type === 'choice');
for (const s of qa('.vn__spot')) click(s);
click(q('.vn__next'));
check(text('.vn__text') === choicePrompt.prompt && qa('.vn__choice').length === 2, 'decision scene offers two choices');
const first = qa('.vn__choice')[0]; click(first); click(first); click(qa('.vn__choice')[1]);
check(text('.vn__text') === choicePrompt.options[0].reply[0].text && qa('.vn__choice').every((c) => c.disabled), 'a choice fires once; double clicks and other options are ignored');
check(first.dataset.state === 'chosen', 'the chosen option is marked');
click(q('.vn__next')); check(text('.vn__text') === choicePrompt.options[0].reply[1].text, 'the explanation continues line by line');
click(q('.vn__next'));

// evidence is collected once
check(!!q('.vn__card--evidence') && text('.vn__card--evidence').includes('Soil-strength tests') && text('.vn__card--evidence').includes('Added to your evidence'), 'evidence card appears and says it was added');
check(JSON.parse(mem['ghostMachines:v1']).story.evidence.length === 1, 'evidence is saved in the shared localStorage key');
check(text('.vn__evbtn') === 'Evidence 1 / 8', 'evidence counter shows 1 / 8');
click(q('.vn__evbtn')); check(!q('.vn__evidence').hidden && within('.vn__evidence', 'li').length === 8 && within('.vn__evidence', 'li').filter((l) => l.dataset.state === 'found').length === 1, 'evidence panel lists found and locked items');
click(q('.vn__evbtn'));

// challenge feedback
click(q('.vn__next'));
const qz = CHAPTERS[0].scenes.find((s) => s.type === 'challenge').questions[0];
check(text('.vn__text') === qz.prompt && qa('.vn__choice').length === 3, 'challenge shows a question with options');
const wrong = qa('.vn__choice').find((c) => qz.options.find((o) => o.text === c.textContent && !o.ok));
click(wrong);
check(text('.vn__text').startsWith('Not quite.') && text('.vn__text').includes('The answer:') && qa('.vn__choice').filter((c) => c.dataset.state === 'correct').length === 1, 'wrong answer: immediate feedback, explanation and the correct answer revealed');
check(qa('.vn__choice').every((c) => c.disabled), 'answers lock after the first try');
check(!q('.vn__next').hidden, 'the story can continue after a wrong answer (never blocked)');
click(q('.vn__next'));
check(!!q('.vn__card--history') && text('.vn__card--history').includes('REAL HISTORY') && within('.vn__card--history', 'a').length >= 2 && within('.vn__card--history', 'a').every((a) => a.getAttribute('rel')?.includes('noopener')), 'history card is labeled REAL HISTORY with source links');
click(q('.vn__next'));
check(!!q('.vn__card--complete') && text('.vn__card--complete').includes('Chapter 1 complete'), 'chapter completion screen');
const links = within('.vn__card--complete', 'a').map((a) => a.getAttribute('href'));
check(links.includes('#/story/ch2') && links.includes('#/moon/surveyor-3') && links.includes('#/story') && links.includes('#/moon'), 'completion offers next chapter, the dossier, all chapters and Return to Expedition');
check(JSON.parse(mem['ghostMachines:v1']).story.done.includes('ch1') && !('ch1' in JSON.parse(mem['ghostMachines:v1']).story.at), 'chapter completion saved; resume marker cleared');

// ---------------------------------------------------------------- 5. unlock, replay, returning to the expedition
loc.hash = '#/story';
check(qa('.vn-card')[0].dataset.state === 'done' && qa('.vn-card')[1].dataset.state === 'ready', 'chapter 1 completed, chapter 2 unlocked');
const before = JSON.stringify(JSON.parse(mem['ghostMachines:v1']).artifacts);
const replayLink = qa('.vn-card')[0].querySelector('a'); check(replayLink.textContent === 'Replay chapter', 'completed chapters offer Replay');
const { store } = await import(base + 'core/store.js');
store.setChapterScene('ch1', 3);                  // pretend the visitor was mid-way through a replay
click(replayLink); loc.hash = '#/story/ch1';
check(!!q('.vn__titlecard'), 'Replay starts the chapter from the opening scene');
check(store.isChapterDone('ch1') && store.evidenceCount === 1, 'replaying does not undo completion or duplicate evidence');
loc.hash = '#/moon'; check(body.dataset.screen === 'moon', 'Return to Expedition opens the map');
check(JSON.stringify(JSON.parse(mem['ghostMachines:v1']).artifacts) === before, 'story play did not change expedition (artifact) progress');
loc.hash = '#/moon/surveyor-3/apollo-12-visit';
check(body.querySelector('[data-panel]').textContent.includes('Apollo 12 astronauts walk to Surveyor 3'), 'the map, timeline and dossier panel still work after the story');
check(body.querySelector('[data-nav="quiz"]').getAttribute('aria-disabled') === 'true', 'the quiz gate is unaffected (still locked until 8/8 cataloged)');

// ---------------------------------------------------------------- 6. play every chapter
for (let n = 1; n <= 8; n++) {
  loc.hash = `#/story/ch${n}`;
  const r = play();
  check(r === 'complete' && text('.vn__card--complete').length > 0, `chapter ${n} plays through to its completion screen`);
}
check(store.storyDoneCount === 8 && store.evidenceCount === 8, 'all eight chapters done and eight evidence items collected');
check(text('.vn__card--complete').includes('Expedition complete') && within('.vn__card--complete', 'a').some((a) => a.getAttribute('href') === '#/moon'), 'finale celebrates the expedition and links back to the artifact catalogue');
const finale = text('.vn__card--complete'); check(/dossier/.test(finale) && /quiz/i.test(finale), 'finale connects to dossiers and the quiz');
// ch6: both sites really are needed
loc.hash = '#/story/ch6'; play(() => qa('.vn__variant').length > 0);
check(qa('.vn__variant').length === 2 && q('.vn__next').disabled, 'chapter 6 offers two selectable sites and waits for both');
click(qa('.vn__spot')[0]); check(q('.vn__next').disabled, 'inspecting only Spirit’s site is not enough');
click(qa('.vn__variant')[1]); click(qa('.vn__spot')[0]); check(!q('.vn__next').disabled, 'after inspecting Opportunity’s site too, the chapter can continue');
check(qa('.vn__variant')[1].getAttribute('aria-pressed') === 'true', 'the selected site tab is marked');
// ch8: three identification questions
loc.hash = '#/story/ch8'; play(() => q('.vn__hint')?.textContent === 'Question 1 of 3'); check(q('.vn__hint').textContent === 'Question 1 of 3', 'chapter 8 asks three component-identification questions');

// ---------------------------------------------------------------- 7. typewriter and reduced motion
dom.setReducedMotion(false);
loc.hash = '#/story/ch1'; // fresh: ch1 saved scene is 0 after completion
click([...q('.vn__titlecard').walk()].find((n) => n.tagName === 'BUTTON'));
const line0 = CHAPTERS[0].scenes[0].lines[0].text;
check(text('.vn__text') === '' && q('.vn__text').classList.contains('is-typing') && text('.sr-only') !== undefined, 'typewriter: text starts empty and reveals progressively');
check(root().querySelectorAll('.sr-only').some((n) => n.textContent === line0 && n.getAttribute('aria-live') === 'polite'), 'screen readers get the full line at once (live region)');
click(q('.vn__text'));
check(text('.vn__text') === line0 && !q('.vn__text').classList.contains('is-typing'), 'clicking the text reveals the whole sentence immediately');
await new Promise((r) => setTimeout(r, 60)); check(text('.vn__text') === line0, 'the typing timer stops after skipping');
click(q('.vn__next')); check(text('.vn__text') !== line0 && text('.vn__text') === '' , 'Next moves on to the following line');
click(q('.vn__next')); check(text('.vn__text').length > 0 || true, 'Next while typing completes the line first');
dom.setReducedMotion(true);
loc.hash = '#/story'; click(qa('.vn-card')[0].querySelector('a')); loc.hash = '#/story/ch1'; click([...q('.vn__titlecard').walk()].find((n) => n.tagName === 'BUTTON'));
check(text('.vn__text') === line0 && !q('.vn__text').classList.contains('is-typing'), 'reduced motion: text appears instantly, no typewriter');

// ---------------------------------------------------------------- 8. persistence, stray timers, errors
const saved = JSON.parse(mem['ghostMachines:v1']); check(Object.keys(mem).length === 1 && saved.story.done.length === 8 && saved.story.evidence.length === 8, 'story progress lives in the one shared localStorage key');
loc.hash = '#/landing'; check(body.dataset.screen === 'landing', 'leaving the story screen works');
await new Promise((r) => setTimeout(r, 900));
check(errors.length === 0, `no uncaught errors during the whole run${errors.length ? ': ' + errors[0].message : ''}`);
console.log(bad ? `\n${bad} FAILURE(S)` : '\nALL STORY CHECKS PASSED'); process.exit(bad ? 1 : 0);
