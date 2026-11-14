// Artifact content. Map positions are normalized (0-1) on a stylized map square and are
// illustrative only, NOT geographic coordinates. `side` = which side the marker label sits on.
export const STATUS_LABEL = Object.freeze({ undiscovered: 'Signal detected', opened: 'Dossier opened', cataloged: 'Cataloged' });
export const WORLD_NAME = Object.freeze({ moon: 'Moon', mars: 'Mars' });

export const ARTIFACTS = Object.freeze([
  {
    id: 'surveyor-3', order: 1, world: 'moon', name: 'Surveyor 3', shortName: 'Surveyor 3',
    mission: 'Surveyor Program', location: 'Oceanus Procellarum (Ocean of Storms)',
    arrived: 'Apr 20, 1967', date: '1967-04-20', note: 'Operations ended May 1967',
    status: 'Left on the Moon; camera and parts returned to Earth in 1969',
    map: { x: 0.30, y: 0.55, side: 'left' },
    blurb: 'A robotic lander that dug into lunar soil and sent back thousands of images, then waited for Apollo 12 astronauts to visit it.',
  },
  {
    id: 'apollo-11-descent', order: 2, world: 'moon', name: 'Apollo 11 Lunar Module descent stage', shortName: 'Apollo 11',
    mission: 'Apollo 11', location: 'Sea of Tranquility (Tranquility Base)',
    arrived: 'Jul 20, 1969', date: '1969-07-20', note: 'Ascent stage lifted off Jul 21, 1969',
    status: 'Remains at Tranquility Base',
    map: { x: 0.61, y: 0.49, side: 'right' },
    blurb: 'The lower half of the lunar module Eagle, left at Tranquility Base as a launch platform and a monument to the first Moon landing.',
  },
  {
    id: 'alsep', order: 3, world: 'moon', name: 'Apollo Lunar Surface Experiments Package (ALSEP)', shortName: 'ALSEP · Apollo 17',
    mission: 'Apollo 17', location: 'Taurus-Littrow valley',
    arrived: 'Dec 1972', date: '1972-12-11', note: 'Network shut down Sep 30, 1977',
    status: 'Left running on the Moon until it was switched off from Earth',
    map: { x: 0.64, y: 0.385, side: 'right' },
    featuredNote: 'This map features the Apollo 17 station in the Taurus-Littrow valley.',
    widerNote: 'Full ALSEP stations were set up on Apollo 12, 14, 15, 16 and 17. Apollo 11 left a smaller package of experiments.',
    blurb: 'A nuclear-powered science station that kept measuring moonquakes, heat flow and more long after the astronauts went home.',
  },
  {
    id: 'lunar-roving-vehicle', order: 4, world: 'moon', name: 'Lunar Roving Vehicle', shortName: 'Rover · Apollo 15',
    mission: 'Apollo 15', location: 'Hadley–Apennine region',
    arrived: 'Jul 1971', date: '1971-07-30', note: 'Parked for good Aug 2, 1971',
    status: 'Parked on the Moon',
    map: { x: 0.50, y: 0.30, side: 'top' },
    featuredNote: 'This map features the Apollo 15 rover at Hadley–Apennine, the first one driven on the Moon.',
    widerNote: 'Three rovers were left on the Moon in total: on Apollo 15, 16 and 17.',
    blurb: 'A battery-powered, folding car that let Apollo astronauts range far beyond walking distance, then stayed parked where they left it.',
  },
  {
    id: 'pathfinder-sojourner', order: 5, world: 'mars', name: 'Mars Pathfinder and Sojourner', shortName: 'Pathfinder',
    mission: 'Mars Pathfinder', location: 'Ares Vallis',
    arrived: 'Jul 4, 1997', date: '1997-07-04', note: 'Last signal Sep 27, 1997',
    status: 'Silent since 1997',
    map: { x: 0.36, y: 0.40, side: 'left' },
    blurb: 'A lander that bounced to a stop on airbags and released Sojourner, the first rover to drive on Mars.',
  },
  {
    id: 'spirit-opportunity', order: 6, world: 'mars', name: 'Spirit and Opportunity landing hardware', shortName: 'Spirit & Opportunity',
    mission: 'Mars Exploration Rovers', location: 'Gusev Crater (Spirit) and Meridiani Planum (Opportunity)',
    arrived: 'Jan 2004', date: '2004-01-04', note: 'Spirit silent 2010 · Opportunity silent 2018',
    status: 'Rovers silent; parachutes, heat shields and airbags left behind',
    extraSteps: ['both-sites'],
    map: { x: 0.52, y: 0.58, side: 'bottom' },
    featuredNote: 'One marker covers two sites on opposite sides of Mars: Gusev Crater for Spirit and Meridiani Planum for Opportunity.',
    blurb: 'Twin rovers landed three weeks apart and left parachutes, heat shields and airbags scattered across two sites on opposite sides of Mars.',
  },
  {
    id: 'phoenix', order: 7, world: 'mars', name: 'Phoenix Mars Lander', shortName: 'Phoenix',
    mission: 'Phoenix Mars Scout', location: 'Green Valley, northern plains (Vastitas Borealis)',
    arrived: 'May 25, 2008', date: '2008-05-25', note: 'Last signal Nov 2, 2008',
    status: 'Frozen in place; silent since 2008',
    map: { x: 0.46, y: 0.14, side: 'right' },
    blurb: 'A stationary lander that dug into the arctic plains of Mars and confirmed that water ice lies just beneath the soil.',
  },
  {
    id: 'perseverance-debris', order: 8, world: 'mars', name: 'Perseverance parachute, backshell and sky-crane debris', shortName: 'Perseverance debris',
    mission: 'Mars 2020', location: 'Jezero Crater',
    arrived: 'Feb 18, 2021', date: '2021-02-18', note: 'Debris photographed from the air Apr 2022',
    status: 'Debris field left at the landing site; the rover drove away',
    map: { x: 0.70, y: 0.42, side: 'right' },
    blurb: 'The parachute, backshell and rocket stage that delivered Perseverance to the surface, scattered across Jezero Crater after landing.',
  },
]);

export const ARTIFACT_IDS = Object.freeze(ARTIFACTS.map((a) => a.id));
export const getArtifact = (id) => ARTIFACTS.find((a) => a.id === id) ?? null;
export const artifactsByWorld = (world) => ARTIFACTS.filter((a) => a.world === world);
export const timelineFor = (world) => artifactsByWorld(world).sort((a, b) => a.date.localeCompare(b.date));
