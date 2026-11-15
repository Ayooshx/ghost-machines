# ATTRIBUTION.md — Resource Register for GHOST MACHINES

**Project:** GHOST MACHINES: A Tour of NASA's Left-Behind Explorers
**Register last updated:** 2026-11-13 (final-release review)
**Status:** Living document. Anything marked **REVIEW** needs a human decision before submission.

> **Unofficial project.** Not affiliated with, sponsored by, or endorsed by NASA. No NASA logo, insignia, logotype or seal is used anywhere.


## 1. Project files and their provenance


| File | What it is |
| `ATTRIBUTION.md` | This register |
| `README.md` | Documentation |
| `THIRD_PARTY_LICENSES.md` | Licence notes |
| `css/animations.css` | Keyframes, reduced-motion rules |
| `css/base.css` | Base styles, font fallbacks |
| `css/components/dossier.css` | Dossier layout |
| `css/components/explorer.css` | Exploration console |
| `css/components/glass-panel.css` | Panel style |
| `css/components/landing.css` | Landing page |
| `css/components/quiz.css` | Quiz, badge panel, expedition log |
| `css/components/timeline.css` | Timeline |
| `css/components/transmission.css` | Last Transmission player |
| `css/components/visualNovel.css` | Visual novel styles |
| `css/layout.css` | Layout, top bar |
| `css/tokens.css` | Design tokens |
| `index.html` | Page structure. Title, subtitle and intro paragraph text were **supplied by the team (class A, confirm)** |
| `js/core/dom.js` | DOM helpers |
| `js/core/router.js` | Hash router |
| `js/core/store.js` | Single progress store (one localStorage key) |
| `js/data/artifacts.js` | Artifact list and illustrative map positions |
| `js/data/dossiers.js` | Dossier text for all eight artifacts, including fictional Last Transmission narrations |
| `js/data/map-art.js` | Stylized Moon and Mars map art (original SVG, not NASA/USGS data) |
| `js/data/plates.js` | Timeline line-art plates (original SVG) |
| `js/data/quiz.js` | Quiz questions and explanations |
| `js/data/sceneArt.js` | Visual novel scene art and portraits (original SVG, not NASA photographs) |
| `js/data/timeline.js` | Timeline milestones |
| `js/data/visualNovelData.js` | THE LOST MISSION script (fictional story over real facts) |
| `js/main.js` | Entry point |
| `js/modules/badge.js` | Badge art and PNG certificate |
| `js/modules/dossier.js` | Reusable dossier component |
| `js/modules/explorer.js` | Console coordinator |
| `js/modules/hud.js` | Top bar |
| `js/modules/landing.js` | Landing transition |
| `js/modules/log.js` | Expedition log |
| `js/modules/map.js` | Map and markers |
| `js/modules/narrator.js` | Speech engine (Web Speech API) |
| `js/modules/panel.js` | Selected-artifact panel |
| `js/modules/quiz.js` | Quiz |
| `js/modules/starfield.js` | Starfield (contains the mulberry32 routine, section 5) |
| `js/modules/timeline.js` | Timeline component |
| `js/modules/transmission.js` | Last Transmission player (contains the play-icon path, section 5) |
| `js/modules/visualNovel.js` | Visual novel engine |
| `tests/audit.mjs`, `tests/boot-test.mjs`, `tests/dom-shim.mjs`, `tests/quiz-flow.mjs`, `tests/story-flow.mjs`, `tests/story-voice.mjs` | Dev-only Node tests (not shipped to visitors). They load the real `index.html` and `main.js` into a small DOM stand-in. No packages. They cannot judge appearance. |


## 2. Fonts

The CSS names **IBM Plex Sans**, **IBM Plex Mono** and **Cormorant Garamond**, but only through `local()`: the fonts are used **only if already installed** on the visitor's device. **No font files are in the repository and none are requested over the network**, so they cannot cause missing-file errors. Without them the site uses system fallbacks (Georgia, system-ui, ui-monospace).


Licence status was checked against the projects' published notices (2026-11-10). If the team bundles font files: use the official web builds, copy each font's own `OFL.txt` into `assets/fonts/licenses/`, record the exact version and file hashes here, and replace each `local()` source in `css/base.css` with a `url()` source. See `THIRD_PARTY_LICENSES.md` §2.

## 3. Scientific research and factual sources (final list)

NASA and NASA-hosted pages are the primary sources. Other sources were consulted only to cross-check; **their wording was not copied.** The links the app shows to visitors are the NASA ones in 8.1.

**Status key:** **OPENED** = the page was fetched and read. **EXCERPT** = the URL and an excerpt were returned by a search; the full page was not opened. Re-open every source before submission.

### 3.1 Primary sources linked in the app

| Topic | Source | URL | Status |
|---|---|---|---|
| Surveyor program, Surveyor 1 (June 2, 1966) | NASA: 55 Years Ago, Surveyor 1 Makes a Soft Landing on the Moon | https://www.nasa.gov/feature/55-years-ago-surveyor-1-makes-a-soft-landing-on-the-moon | EXCERPT |
| Surveyor 3 | NASA Science: Surveyor 3 | https://science.nasa.gov/mission/lunar-rangers-and-surveyors/surveyor-3/ | EXCERPT |
| Apollo 12 visit to Surveyor 3 | NASA History: 55 Years Ago, Apollo 12 Makes a Pinpoint Landing on the Moon | https://www.nasa.gov/history/55-years-ago-apollo-12-makes-a-pinpoint-landing-on-the-moon | EXCERPT |
| Apollo 11 | NASA: Apollo 11 Mission Overview | https://www.nasa.gov/missions/apollo/apollo-11/apollo-11-mission-overview/ | OPENED |
| ALSEP, instruments, power source | NASA PDS Geosciences Node: Apollo 12 ALSEP overview | https://pds-geosciences.wustl.edu/lunar/urn-nasa-pds-a12sws_solar_wind_28s_1hr/document/a12a_alsep.txt | OPENED |
| ALSEP (Apollo 17 instruments, switch-on) | NASA PDS Geosciences Node: Apollo 17 ALSEP overview | https://pds-geosciences.wustl.edu/lunar/urn-nasa-pds-a15_17_hfe_concatenated/document/hfe/a17a_alsep.txt | EXCERPT |
| ALSEP shutdown, history | NASA ALSEP Termination Report (RP-1036), PDF | https://www.nasa.gov/wp-content/uploads/static/history/alsj/19790014808_1979014808.pdf | EXCERPT |
| ALSEP report record | NASA Technical Reports Server | https://ntrs.nasa.gov/citations/19790014808 | EXCERPT |
| Apollo 17 launch and landing dates | NASA NSSDCA: Apollo 17 | https://nssdc.gsfc.nasa.gov/planetary//lunar/apollo17info.html | EXCERPT |
| Lunar Roving Vehicle, Apollo 15 | NASA: Apollo 15 Mission Details | https://www.nasa.gov/missions/apollo/apollo-15-mission-details/ | OPENED |
| Pathfinder, Sojourner | NASA/JPL: Mars Pathfinder Winds Down After Phenomenal Mission | https://science.nasa.gov/solar-system/planets/mars/mars-pathfinder-winds-down-after-phenomenal-mission | OPENED |
| Pathfinder | NASA Science: Mars Pathfinder | https://science.nasa.gov/mission/mars-pathfinder/ | EXCERPT |
| Spirit and Opportunity | NASA Space Place: The Mars Rovers Spirit and Opportunity | https://spaceplace.nasa.gov/mars-spirit-opportunity/ | EXCERPT |
| Spirit | NASA Science: Mars Exploration Rover Spirit | https://science.nasa.gov/mission/mer-spirit/ | EXCERPT |
| Opportunity, Heat Shield Rock | NASA/JPL: Opportunity Rover Finds an Iron Meteorite on Mars | https://www.jpl.nasa.gov/news/opportunity-rover-finds-an-iron-meteorite-on-mars | EXCERPT |
| Phoenix | NASA Science: Phoenix | https://science.nasa.gov/mission/phoenix | EXCERPT |
| Phoenix | NASA/JPL: Phoenix | https://www.jpl.nasa.gov/missions/phoenix/ | EXCERPT |
| Perseverance landing debris | NASA Science blog: Images of EDL Debris | https://science.nasa.gov/blog/images-of-edl-debris | EXCERPT (re-read in this review) |
| Perseverance hardware in separate places | NASA/JPL: Perseverance and Mars 2020 Spacecraft Components on the Surface | https://www.jpl.nasa.gov/images/perseverance-and-mars-2020-spacecraft-components-on-the-surface | EXCERPT |
| Perseverance | NASA Science: Mars 2020 Perseverance | https://science.nasa.gov/mission/mars-2020-perseverance/ | EXCERPT |
| Ingenuity | NASA Science: Ingenuity Mars Helicopter | https://science.nasa.gov/mission/mars-2020-perseverance/ingenuity-mars-helicopter/ | EXCERPT |

### 3.2 Other NASA pages consulted (not linked in the app)

| Source | URL | Used for |
|---|---|---|
| NASA: Lunar Encore Leads to First Precision Extraterrestrial Landing | https://www.nasa.gov/humans-in-space/lunar-encore-leads-to-first-precision-extraterrestrial-landing | Apollo 12 landing distance |
| NASA: Repeat Performance, Apollo 12 Achieves Second Moon Landing | https://www.nasa.gov/humans-in-space/repeat-performance-apollo-12-achieves-second-moon-landing | Apollo 12 moonwalk dates |
| NASA History SP-4029: Apollo 17 summary | https://www.nasa.gov/wp-content/uploads/static/history/SP-4029/Apollo_17a_Summary.htm | Apollo 17 launch time |
| NASA PDS: Apollo 14, 15, 16 ALSEP overviews | https://pds-geosciences.wustl.edu/lunar/urn-nasa-pds-apollodoc/document_a14/instrument_hosts/a14a_alsep.txt and the matching a15a / a16a pages | Dates the other ALSEP stations were switched on |
| NASA Science: Surveyor 3 (short URL) | https://science.nasa.gov/surveyor-3 | Surveyor 3 details |
| NASA Science: Surveyors program | https://science.nasa.gov/mission/lunar-rangers-and-surveyors | Program context |
| NASA: Images and Media Usage Guidelines | https://www.nasa.gov/nasa-brand-center/images-and-media/ | Usage policy (section 7) |

### 3.3 Secondary sources consulted (cross-checking only; not copied; not linked in the app)

| Topic | Source | URL |
|---|---|---|
| Phoenix | Space.com | https://www.space.com/42947-phoenix-mars-lander.html |
| Phoenix | Spaceflight Now | https://spaceflightnow.com/news/n0811/10phoenix/index2.html |
| Phoenix | Astronomy Now | https://astronomynow.com/081111PhoenixconcludesMartianadventure.html |
| Phoenix | Christian Science Monitor | https://proof.csmonitor.com/Science/2010/0524/NASA-s-Phoenix-Mars-Lander-officially-kaput |
| Perseverance debris, Ingenuity photos (quotes a NASA release, incl. the Ian Clark statement) | Spaceflight Now | https://spaceflightnow.com/2022/04/27/ingenuity-helicopter-flies-over-leftover-wreckage-from-mars-landing-last-year/ |
| Perseverance debris | Astronomy Now | https://astronomynow.com/2022/05/02/ingenuity-zooms-over-mars-rovers-discarded-parachute-and-backshell/ |
| Perseverance debris | EarthSky; SciTechDaily; Universe Today | https://earthsky.org/space/mars-helicopter-parachute-backshell-perseverance-rover/ · https://scitechdaily.com/?p=168048 · https://universetoday.com/157400/nasa-gives-a-detailed-analysis-of-all-the-landing-debris-perseverance-has-found-on-mars |
| Parachute message ("Dare Mighty Things"; revealed at a Feb 22, 2021 NASA news briefing) | PBS NewsHour; CBS News; Live Science; Universe Today | https://www.pbs.org/newshour/amp/science/mars-rovers-giant-parachute-carried-secret-message · https://www.cbsnews.com/news/nasa-mars-perseverance-rover-parachute-hidden-message-binary-code · https://www.livescience.com/nasa-perseverance-rover-parachute-secret-code.html · https://universetoday.com/150262/there-was-a-secret-code-in-the-perseverance-parachute |
| Ingenuity mission end | CBS News; NASASpaceflight | https://www.cbsnews.com/news/nasa-mars-helicopter-ingenuity-ends-marathon-mission-rotor-damage · https://nasaspaceflight.com/2024/01/ingenuity-final-flight |
| Spirit and Opportunity | Astronomy Magazine; The Planetary Society; Science News | https://www.astronomy.com/science/mission-complete-for-opportunity-rover/ · https://planetary.org/articles/02-mer-update-opportunity-complete · https://www.planetary.org/blogs/guest-blogs/2019/a-new-understanding.html · https://www.sciencenews.org/article/nasa-mars-opportunity-rover-dead |
| Apollo 12 | University of Arizona News | https://news.arizona.edu/story/uarizona-moon-researchers-helped-nasa-nail-apollo-12-pinpoint-landing |
| Apollo 17 landing time (cross-check) | LROC (Arizona State University) | https://www.lroc.asu.edu/images/1278 |
| Dates cross-check | Wikipedia (CC BY-SA); no text copied | https://en.wikipedia.org/wiki/Heat_Shield_Rock · https://Wikipedia.com/wiki/Surveyor_program |
| Lunar Roving Vehicle (foldable, battery-powered) |
