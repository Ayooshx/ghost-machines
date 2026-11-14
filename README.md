# GHOST MACHINES: A Tour of NASA's Left-Behind Explorers

Vanilla HTML/CSS/JS, no build step. ES modules need a local server:

    python3 -m http.server 8000     # then open http://localhost:8000

## Fonts (self-hosted, open license)
Download these woff2 files (Fontsource or google-webfonts-helper) into `assets/fonts/`.
Until then the site uses the fallback stacks from `css/tokens.css`.
cormorant-garamond-400 / 600 / 400-italic, ibm-plex-sans-400 / 500 / 600, ibm-plex-mono-400 / 500 (all `.woff2`)

## Phase 1 smoke test (browser console, on localhost)
    ghost.store.recordStep('surveyor-3', 'opened')   // HUD segment turns outlined
    ['opened','read','transmission'].forEach(s => ghost.store.recordStep('surveyor-3', s))  // cataloged
    location.hash = '#/quiz'                          // redirects to Moon until 8/8
    ghost.store.reset()

## Progress rules (js/core/store.js is the only place these live)
Status is derived, never stored: undiscovered -> opened -> cataloged.
Cataloged = steps `opened`, `read`, `transmission` (plus `both-sites` for Spirit/Opportunity).
Quiz unlocks at 8/8. Badge at >= 70%, best score kept.

## Timeline
Milestones live in `js/data/timeline.js` (1966-2024, 14 events, each linked to map artifacts). Selecting one updates the URL,
map, panel and dossier link together. The small images are illustrated "plates" (`js/data/plates.js`).
To use a NASA photo instead, add `photo: { src: 'assets/timeline/name.jpg', alt: '', credit: 'NASA/JPL-Caltech' }` to an event;
the credit is then shown in the panel, and the plate is the fallback if the file is missing.
