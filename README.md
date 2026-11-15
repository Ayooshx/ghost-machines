# GHOST MACHINES: A Tour of NASA's Left-Behind Explorers

An interactive educational website. Visitors play space archaeologists exploring the abandoned NASA robotic hardware on the Moon and Mars: eight machines, each with a map marker, a dossier, a fictional first-person "Last Transmission" that can be read aloud, and a chapter in a visual novel.

> **Unofficial educational project.** Not affiliated with, sponsored by, or endorsed by NASA. No NASA logos or insignia are used.
>
>  ## Team contributions

| Team member | Role | What this person actually did |
|---|---|---|
| *Ayush Mondal* | *[Code, research* | 
| *Ahana Das* | *Research, Design* |
| *Devarshi Joshi* | *Research* |
---

## Setup

Native ES modules need a local web server (opening `index.html` directly will not work). Open the `ghost-machines` folder itself so that `css/` and `js/` sit beside `index.html`.

```
python3 -m http.server 8000      # then open http://localhost:8000
```

Or use the VS Code "Live Server" extension on `index.html`. No installation, build step or internet connection is needed. Use a current Chrome, Edge, Firefox or Safari.

## Completed features

Each item below was exercised by an automated test (see [Testing](#testing)) unless marked.

- **Landing page** with a staged entrance and a launch transition into the console. *(Visual quality not seen.)*
- **Exploration console:** Moon and Mars tabs, stylized 2D maps with **eight artifact markers** (mouse, touch, keyboard and arrow keys), a selected-artifact panel, and a top bar with expedition progress.
- **Eight dossiers** from one reusable component: objective, what it did, what scientists learned (each item tagged *Confirmed* or *Interpretation*), why it matters, a surprising fact, **NASA source links**, and the Last Transmission. Spirit and Opportunity have a two-site switch.
- **Last Transmission:** fictional first-person narrations (45–60 seconds), clearly labeled as dramatizations, read aloud with the browser's built-in speech, with play/pause/stop, a waveform, a speaking indicator, a highlighted transcript, and fallbacks for browsers without speech. *(Real audio not heard.)*
- **Timeline:** 14 milestones (1966 onward), horizontal with touch/wheel/keyboard scrolling, previous/next buttons and a progress indicator. Selecting a milestone shows its details and highlights related artifacts on the map.
- **Junior Space Archaeologist quiz:** 10 multiple-choice questions, instant feedback, explanations, score tracking, results, retakes. The best score is kept.
- **Achievement badge:** awarded at 70% or more, with title, score, completion date, an optional name, and a downloadable PNG certificate made in the browser. No account.
- **THE LOST MISSION visual novel:** 8 chapters with dialogue, clickable scene hotspots, decisions, evidence collection, science challenges, "Real history" cards with source links, chapter select with locked/in-progress/completed states, replay and resume. Characters are **fictional and labeled**; facts are labeled **REAL**. Dialogue can be read aloud, with a different voice for each character.
- **Expedition log:** artifacts discovered and cataloged, transmissions heard, timeline milestones explored, story chapters and evidence, quiz attempts.
- **Progress persistence:** one `localStorage` key, on the visitor's device. No registration or backend.
- **Accessibility:** keyboard navigation, visible focus, ARIA labels, skip link, live regions for status, reduced-motion support, native dialogs (focus trapping and Esc), 44px touch targets on touch screens.

## Testing

Tests are plain Node scripts with no packages. They load the real `index.html` and `main.js` into a small DOM stand-in.

```
node tests/audit.mjs        # 27 screen states: ids, ARIA references, button names, headings, all in-app links, malformed URLs
node tests/boot-test.mjs    # app boots; quiz screen renders; log; deep links
node tests/quiz-flow.mjs    # quiz scoring, badge, retake, storage
node tests/story-flow.mjs   # all 8 chapters through their real buttons; unlock, replay, resume, typewriter
node tests/story-voice.mjs  # story voices, toggle, replay, blocked-voice handling
```

These cannot judge how the site **looks** or behaves on a real device. Please also do a manual pass in a browser: every screen at phone, tablet and laptop widths, keyboard only, and with "reduce motion" turned on.

## Technology stack

HTML5, CSS3 (custom properties, grid, flexbox, container-query units, `color-mix`), vanilla JavaScript (ES modules), CSS animations. Browser APIs: `localStorage`, `<dialog>`, Canvas 2D, `IntersectionObserver`, `ResizeObserver`, Web Speech API. **No framework, no npm packages, no build step, no CDN.**

## External dependencies and fonts

**None.** 

## Third-party resource acknowledgements

- **NASA, JPL and the NASA Planetary Data System** mission pages and technical reports are the primary research sources. Every URL is listed in [`ATTRIBUTION.md`](ATTRIBUTION.md) §8. NASA does not endorse this project.
- **Fonts:** IBM Plex (© IBM Corp.) and Cormorant (Christian Thalmann and the Cormorant Project Authors), SIL OFL 1.1, only if installed on the visitor's device.
- **Voices:** the visitor's own browser or device voices. No audio is shipped.
- **Artwork:** no images from third parties. All illustrations (maps, plates, story scenes, portraits, badge) are original SVG drawings made for this project.


## Project structure

```
index.html            single page; screens are sections
css/                  tokens, base, layout, animations, components/
js/core/              dom helpers, hash router, progress store
js/data/              artifacts, dossiers, timeline, quiz, story script, map art, plates, scene art
js/modules/           starfield, hud, landing, explorer, map, panel, timeline, dossier, transmission,
                      narrator, quiz, badge, log, visualNovel
tests/                dev-only Node tests (not shipped)
```
