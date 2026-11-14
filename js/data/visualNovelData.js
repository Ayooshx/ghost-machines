// THE LOST MISSION: story data. Pure data, no logic.
// FICTION: the protagonist, Director Vale, ARCHIE and the "Deep Archive Survey" are invented for this story.
// REAL: every mission fact (dates, numbers, discoveries) comes from the sources in js/data/dossiers.js / ATTRIBUTION.md.
// Scene types: dialogue | choice | explore | evidence | challenge | history  (a title card and completion card are added automatically)

export const STORY = {
  title: 'THE LOST MISSION',
  subtitle: 'Eight machines. Two worlds. Countless stories left behind.',
  fictionNote: 'This is a fictional story. The characters and the Deep Archive Survey are made up. The machines, dates and science are real, and real facts are labeled.',
};

export const CAST = {
  vale:   { name: 'Director Vale', role: 'Deep Archive Survey (fictional)', portrait: 'vale', voice: { role: 'narrator', rate: 0.97, pitch: 1.0 } },
  archie: { name: 'ARCHIE', role: 'Field assistant AI (fictional)', portrait: 'archie', voice: { role: 'alt', rate: 1.06, pitch: 1.3 } },
  you:    { name: 'You', role: 'Junior Space Archaeologist (fictional)', portrait: 'you', voice: { role: 'young', rate: 1.02, pitch: 1.18 } },
};
const V = (text) => ({ who: 'vale', text });
const A = (text) => ({ who: 'archie', text });
const Y = (text) => ({ who: 'you', text });
const S = (label, url) => ({ label, url });   // source link

export const CHAPTERS = [
  // ---------------------------------------------------------------- 1
  { id: 'ch1', number: 1, title: 'The Silent Surveyor', location: 'Moon · Oceanus Procellarum', world: 'moon', artifactId: 'surveyor-3', bg: 'surveyor',
    scenes: [
      { type: 'dialogue', bg: 'hq', lines: [
        V('Welcome to the Deep Archive Survey, recruit. Our division is made up for this story, but the machines we study are real.'),
        V('Here is your assignment. Across the Moon and Mars, machines once sent by humanity remain where their missions ended. Their signals are silent, but their discoveries are not.'),
        V('Your task is to investigate these forgotten explorers, reconstruct their stories, and understand what they left behind.'),
        A('I am ARCHIE, your field assistant. I am fictional too, but my facts come from NASA records. When something is real history, I will say so.'),
        V('Your first stop is Oceanus Procellarum, the Ocean of Storms, on the Moon. A robot called Surveyor 3 has been waiting there since 1967.') ] },
      { type: 'dialogue', lines: [
        A('Surveyor 3 landed on April 20, 1967. Before NASA sent astronauts, it needed robots to scout the Moon.'),
        Y('What was the big worry?'),
        A('Whether a spacecraft would sink into the dust. Surveyor 3 was sent to find out.') ] },
      { type: 'explore', prompt: 'Examine the lander. Select two of the glowing points.', need: 2, spots: [
        { id: 'camera', x: 800, y: 352, label: 'TV camera', name: 'TV camera', does: 'It sent pictures of the landscape and the sky back to Earth.', matters: 'The images showed what the surface around the lander looked like.', fact: 'Apollo 12 astronauts removed this camera and brought it home in 1969.' },
        { id: 'scoop', x: 1015, y: 728, label: 'Soil scoop', name: 'Soil scoop on a robotic arm', does: 'It dug small trenches to test how strong the soil was.', matters: 'These tests helped answer whether the ground could hold a lunar module.', fact: 'The scoop came home with the camera on Apollo 12.' },
        { id: 'footpad', x: 628, y: 832, label: 'Footpad', name: 'Landing leg and footpad', does: 'The three legs and their footpads cushioned the touchdown.', matters: 'A soft landing was the whole point of the Surveyor program.', fact: 'Surveyor 3 bounced twice before it came to rest on the slope of a small crater.' },
      ] },
      { type: 'choice', who: 'archie', prompt: 'The lunar night is coming and the batteries are limited. Which instrument do we examine first?', options: [
        { text: 'The TV camera', reply: [A('Smart. The camera shows us the landing site, which is the setting for everything else.'), A('Now for the real test: the scoop.')] },
        { text: 'The soil scoop', reply: [A('Straight to the big question. The scoop dug trenches to test how strong the soil was.'), A('The camera helps too: it showed the site around the trench.')] },
      ] },
      { type: 'evidence', id: 'ev-surveyor-trench', title: 'Soil-strength tests', kind: 'Instrument observation', plate: 'surveyor',
        text: 'Surveyor 3’s scoop dug trenches in the lunar soil. From these tests, scientists concluded the surface was solid enough to hold an Apollo lunar module. That conclusion is the scientists’ interpretation.',
        lines: [A('Evidence logged. This is the key result from the scoop tests.')] },
      { type: 'challenge', questions: [
        { prompt: 'What did Surveyor 3’s scoop tests suggest about the lunar surface?', options: [
          { text: 'It was solid enough to hold a lunar module.', ok: true, why: 'Scientists concluded the ground was strong enough to carry an Apollo lunar module.' },
          { text: 'It was too soft for any landing.', why: 'The tests pointed the other way. The ground held.' },
          { text: 'It was covered by a deep ocean.', why: '“Ocean of Storms” is an old name for a dark plain. There is no water ocean there.' } ] },
      ] },
      { type: 'history', title: 'Real history: Surveyor 3 and Apollo 12', text: [
        'Surveyor 1 made America’s first soft landing on the Moon on June 2, 1966. Surveyor 3 followed on April 20, 1967 (Universal Time).',
        'On November 20, 1969, Apollo 12 astronauts Pete Conrad and Alan Bean walked to Surveyor 3 and removed its camera and soil scoop. Their lunar module had landed within about 180 meters (600 feet).',
        'Scientists studied the parts on Earth to learn how long exposure to the lunar surface affects equipment.'],
        sources: [S('NASA Science: Surveyor 3', 'https://science.nasa.gov/mission/lunar-rangers-and-surveyors/surveyor-3/'), S('NASA History: Apollo 12 pinpoint landing', 'https://www.nasa.gov/history/55-years-ago-apollo-12-makes-a-pinpoint-landing-on-the-moon')] },
    ] },

  // ---------------------------------------------------------------- 2
  { id: 'ch2', number: 2, title: 'The First Footprint', location: 'Moon · Sea of Tranquility', world: 'moon', artifactId: 'apollo-11-descent', bg: 'descent',
    scenes: [
      { type: 'dialogue', lines: [
        A('Next stop: the Sea of Tranquility, July 1969.'),
        V('This one is famous. Eagle, the Apollo 11 lunar module, landed here carrying two astronauts. But only half of it ever left.'),
        Y('Half?'),
        A('Eagle had two stages: a descent stage and an ascent stage. Let us look at what remains.') ] },
      { type: 'explore', prompt: 'Inspect the landing site. Select two of the glowing points.', need: 2, spots: [
        { id: 'footpad', x: 548, y: 832, label: 'Landing leg', name: 'Landing legs and footpads', does: 'They held the lunar module up on the surface.', matters: 'Without them, Eagle could not have stood on the Moon.', fact: 'Eagle landed about four miles from its planned spot, after Armstrong steered around a crater.' },
        { id: 'engine', x: 800, y: 742, label: 'Engine', name: 'Descent engine', does: 'It slowed Eagle for a gentle touchdown.', matters: 'The descent stage’s engine and legs carried the astronauts down to the surface.', fact: 'Neil Armstrong flew part of the landing by hand.' },
        { id: 'plaque', x: 668, y: 785, label: 'Plaque', name: 'Commemorative plaque', does: 'It commemorates the landing.', matters: 'It was signed by President Nixon and the three Apollo 11 astronauts.', fact: 'It is attached to the descent stage, so it is still on the Moon.' },
        { id: 'platform', x: 900, y: 520, label: 'Top deck', name: 'Launch platform', does: 'The top half, the ascent stage, lifted off from here.', matters: 'This is why the descent stage did not come home with the crew.', fact: 'After 21 hours and 36 minutes on the Moon, the crew left from this spot.' },
      ] },
      { type: 'choice', who: 'archie', prompt: 'What should we look at first?', options: [
        { text: 'The plaque', reply: [A('A good start. It is a message left for future visitors, signed by the crew and the President.')] },
        { text: 'The top deck where the other half stood', reply: [A('Clever. That empty space is the biggest clue about why this half stayed behind.')] },
      ] },
      { type: 'evidence', id: 'ev-plaque', title: 'Commemorative plaque', kind: 'Artifact', plate: 'lm',
        text: 'A plaque signed by President Nixon and the three Apollo 11 astronauts was attached to the descent stage.',
        lines: [A('Logged. Plaques like this are part of how the site tells its own story.')] },
      { type: 'challenge', questions: [
        { prompt: 'Which part of the Eagle lunar module stayed on the Moon?', options: [
          { text: 'The descent stage, the bottom half.', ok: true, why: 'The ascent stage lifted off from on top of it. The descent stage worked as a launch platform and stayed behind.' },
          { text: 'The ascent stage, the top half.', why: 'The ascent stage carried the astronauts back to orbit. It was the part that left.' },
          { text: 'The whole lunar module.', why: 'Only the bottom half stayed. The top half carried Armstrong and Aldrin to lunar orbit.' } ] },
      ] },
      { type: 'history', title: 'Real history: Apollo 11', text: [
        'Apollo 11 launched on July 16, 1969, and landed on July 20. Neil Armstrong and Buzz Aldrin spent 21 hours and 36 minutes on the Moon, with more than two and a half hours outside.',
        'The ascent stage launched from the descent stage and docked with the command module Columbia.',
        'Armstrong and Aldrin also left medallions for the three Apollo 1 astronauts and two cosmonauts, and a tiny silicon disk with goodwill messages from 73 countries.'],
        sources: [S('NASA: Apollo 11 Mission Overview', 'https://www.nasa.gov/missions/apollo/apollo-11/apollo-11-mission-overview/')] },
    ] },

  // ---------------------------------------------------------------- 3
  { id: 'ch3', number: 3, title: 'The Lunar Laboratory', location: 'Moon · Apollo 17 landing site', world: 'moon', artifactId: 'alsep', bg: 'alsep',
    scenes: [
      { type: 'dialogue', lines: [
        A('Taurus-Littrow valley, December 1972. Apollo 17 was the final Apollo Moon landing.'),
        V('Scientists did not only want to visit the Moon. They wanted to leave instruments behind to keep watching it.'),
        Y('Why not just bring samples home?'),
        A('Samples show what the Moon is made of. Instruments left running can watch what it does over years.') ] },
      { type: 'explore', prompt: 'Inspect the science station. Select two of the glowing points.', need: 2, spots: [
        { id: 'station', x: 800, y: 650, label: 'Central station', name: 'Central station', does: 'It powered the instruments and sent their data to Earth by radio. Commands from Earth controlled the whole station.', matters: 'Without it, the instruments could not have reported home.', fact: 'In the Apollo 12 version, astronauts pointed the antenna at Earth by hand.' },
        { id: 'rtg', x: 590, y: 700, label: 'Power source', name: 'Radioisotope generator (RTG)', does: 'It turned the heat of decaying plutonium-238 into electricity.', matters: 'Its power came from heat, not sunlight.', fact: 'The astronauts loaded a fuel capsule of about 4 kilograms into it.' },
        { id: 'heat', x: 1020, y: 750, label: 'Heat probe', name: 'Heat flow experiment', does: 'It measured how much heat escapes from inside the Moon.', matters: 'Heat flow gives clues about the Moon’s interior.', fact: 'Apollo 17’s instruments included a heat flow experiment, a gravimeter and a seismic experiment.' },
        { id: 'seismic', x: 900, y: 805, label: 'Seismic sensor', name: 'Seismic experiment', does: 'It listened to vibrations in the Moon’s ground.', matters: 'Moonquakes reveal what is inside the Moon.', fact: 'A network of seismometers worked together for about five years.' },
      ] },
      { type: 'choice', who: 'archie', prompt: 'Which instrument should we check first?', options: [
        { text: 'The seismic sensor', reply: [A('The seismometers listened for moonquakes, which are the shaking of the ground. A great way to look inside the Moon.')] },
        { text: 'The heat flow probe', reply: [A('Good pick. Its readings tell us about heat escaping from inside the Moon.')] },
      ] },
      { type: 'evidence', id: 'ev-heatflow', title: 'Heat flow readings (simplified)', kind: 'Instrument log', plate: 'alsep',
        text: 'A simplified reading: sensors deeper in the ground are warmer than sensors near the surface. This is a teaching version of what the heat flow experiment looked for.',
        lines: [A('Logged. Now let us work out what these readings mean.')] },
      { type: 'challenge', visual: 'heat', questions: [
        { prompt: 'The deeper sensors read warmer than the shallow ones. What does this suggest?', options: [
          { text: 'Heat is flowing up from inside the Moon.', ok: true, why: 'Heat flows from warmer places to cooler ones. Warmer ground at depth points to heat escaping from the interior.' },
          { text: 'The Sun is shining underground.', why: 'Sunlight cannot reach below the surface. The warmth comes from deeper in.' },
          { text: 'The astronauts left a heater on.', why: 'The probes only measured temperature. They did not heat the ground.' } ] },
      ] },
      { type: 'history', title: 'Real history: ALSEP', text: [
        'ALSEP stands for Apollo Lunar Surface Experiments Package. Stations were set up on Apollo 12, 14, 15, 16 and 17. This chapter features the Apollo 17 station.',
        'Different stations carried different instruments. The Apollo 12 station, for example, had a seismometer, a magnetometer and a solar wind spectrometer, which measured electrons and protons streaming from the Sun.',
        'The stations were designed to last one year (two for Apollo 17) but worked for up to eight. NASA switched the network off on September 30, 1977, citing budget priorities.'],
        sources: [S('NASA PDS: Apollo 12 ALSEP overview', 'https://pds-geosciences.wustl.edu/lunar/urn-nasa-pds-a12sws_solar_wind_28s_1hr/document/a12a_alsep.txt'), S('NASA ALSEP Termination Report', 'https://www.nasa.gov/wp-content/uploads/static/history/alsj/19790014808_1979014808.pdf')] },
    ] },

  // ---------------------------------------------------------------- 4
  { id: 'ch4', number: 4, title: 'Wheels on Another World', location: 'Moon · Apollo 15 landing site', world: 'moon', artifactId: 'lunar-roving-vehicle', bg: 'rover',
    scenes: [
      { type: 'dialogue', lines: [
        A('Hadley–Apennine region, July 1971. Apollo 15.'),
        V('Earlier crews explored on foot. Apollo 15 brought something new: a car.'),
        Y('A car on the Moon?'),
        A('The Lunar Roving Vehicle. Let us see what the astronauts could do with it.') ] },
      { type: 'explore', prompt: 'Inspect the rover. Select two of the glowing points.', need: 2, spots: [
        { id: 'wheel', x: 655, y: 748, label: 'Wheel', name: 'Wheels', does: 'They carried the crew over rough ground, far beyond walking distance.', matters: 'The rover let the crew reach places that were too far to walk to.', fact: 'The Apollo 15 crew drove about 28 kilometers (17.5 miles) in three outings.' },
        { id: 'tv', x: 985, y: 590, label: 'TV camera', name: 'TV camera', does: 'It sent live pictures to Earth, and Mission Control could steer it.', matters: 'People on Earth could follow the exploration.', fact: 'It showed the lunar liftoff for the first time, as seen from Earth.' },
        { id: 'samples', x: 610, y: 600, label: 'Sample bags', name: 'Sample and tool area', does: 'The crew carried tools and collected rocks and soil here.', matters: 'The samples went home for scientists to study.', fact: 'The crew collected more than 170 pounds (77 kilograms) of samples.' },
        { id: 'antenna', x: 930, y: 500, label: 'Antenna', name: 'Antenna', does: 'It helped the rover send pictures and voice back to Earth.', matters: 'Exploring far from the lunar module still meant staying in touch.', fact: 'Three rovers were left on the Moon: on Apollo 15, 16 and 17.' },
      ] },
      { type: 'choice', who: 'archie', prompt: 'The crew can visit one feature first. Which would teach scientists the most?', options: [
        { text: 'The layered wall of Hadley Rille', reply: [A('Excellent. Layers are like pages in a history book: each one records a different time.'), A('Apollo 15 photographed exposed layers in the rille’s west wall.')] },
        { text: 'A smooth, flat plain', reply: [A('Flat plains are good for landing, but they show less. Layers in a wall reveal more about the past.'), A('The crew did go to the layered rille wall as well, and photographed it.')] },
        { text: 'A fresh, bright crater rim', reply: [A('Crater rims can be interesting too. Here, the layered wall of Hadley Rille gave the clearest view of exposed layers.')] },
      ] },
      { type: 'evidence', id: 'ev-rille', title: 'Layers in Hadley Rille', kind: 'Photograph record', plate: 'rover',
        text: 'Apollo 15 photographed the west wall of Hadley Rille, where exposed layering was visible. The crew also took a core sample from about 10 feet beneath the surface.',
        lines: [A('Logged. The rover made this trip possible.')] },
      { type: 'challenge', questions: [
        { prompt: 'Why did Apollo 15’s crew need a rover?', options: [
          { text: 'To reach sites far beyond walking distance.', ok: true, why: 'The rover carried them about 28 kilometers (17.5 miles), so they could visit and sample many places.' },
          { text: 'To fly across craters.', why: 'The rover drove on wheels. It could not fly.' },
          { text: 'To travel back to Earth.', why: 'The crew went home in the spacecraft. The rover was left parked on the Moon.' } ] },
      ] },
      { type: 'history', title: 'Real history: Apollo 15 and the rover', text: [
        'Apollo 15 launched on July 26, 1971, and landed on July 30. On July 31, David Scott became the first person to drive on the Moon, with James Irwin beside him.',
        'Over three moonwalks they drove 17.5 miles and collected more than 170 pounds of samples. The rover’s TV camera showed the liftoff to Earth.',
        'Apollo 15 was the first mission built for greater surface mobility. The rover worked well enough that two more flew, on Apollo 16 and 17.'],
        sources: [S('NASA: Apollo 15 Mission Details', 'https://www.nasa.gov/missions/apollo/apollo-15-mission-details/')] },
    ] },

  // ---------------------------------------------------------------- 5
  { id: 'ch5', number: 5, title: 'The First Martian Traveller', location: 'Mars · Ares Vallis', world: 'mars', artifactId: 'pathfinder-sojourner', bg: 'pathfinder',
    scenes: [
      { type: 'dialogue', lines: [
        V('We leave the Moon behind. Mars next, July 1997.'),
        A('Mars Pathfinder landed in Ares Vallis, an ancient flood plain, using airbags.'),
        Y('Airbags? Like in a car?'),
        A('Sort of. They cushioned the landing, and then a small rover rolled out. Let us take a look.') ] },
      { type: 'explore', prompt: 'Investigate the site. Select two of the glowing points.', need: 2, spots: [
        { id: 'lander', x: 800, y: 520, label: 'Lander camera', name: 'Pathfinder lander and camera', does: 'The lander took pictures and measured the weather.', matters: 'It returned more than 16,000 images and weather data.', fact: 'It was later renamed the Carl Sagan Memorial Station.' },
        { id: 'rover', x: 1010, y: 745, label: 'Sojourner', name: 'Sojourner rover', does: 'It drove off the lander’s ramp to study nearby rocks and soil with an X-ray instrument.', matters: 'It was the first rover to drive on Mars.', fact: 'Designed for 7 days, it kept working for about 12 times that long.' },
        { id: 'petal', x: 690, y: 700, label: 'Airbag petal', name: 'Lander petals and airbags', does: 'The airbags cushioned the landing. Afterwards the team retracted one that blocked the ramp.', matters: 'This was a low-cost way to land on Mars.', fact: 'Pathfinder landed inside airbags that cushioned the impact.' },
      ] },
      { type: 'choice', who: 'archie', prompt: 'Sojourner can only study one rock today. Based on the clues, which one?', options: [
        { text: 'Rock A: smooth, rounded pebbles stuck together', reply: [A('Good thinking. Rounded pebbles can form when water rolls them along. Stuck together, they make a rock called a conglomerate.'), A('Pathfinder saw rocks that may be conglomerates, a possible sign of water in the past.')] },
        { text: 'Rock B: a sharp, freshly broken rock', reply: [A('A fresh, angular rock tells us less about water. Water-worn pebbles would be a better clue.'), A('Rock A, with rounded pebbles, is the one with the water clue.')] },
        { text: 'Rock C: a rock covered in fine dust', reply: [A('Dust can hide a rock’s surface. A rock with visible rounded pebbles gives better evidence about water.')] },
      ] },
      { type: 'evidence', id: 'ev-pebbles', title: 'Rounded pebbles (rock analysis)', kind: 'Rock analysis', plate: 'pathfinder',
        text: 'Pathfinder saw rounded pebbles and rock sockets that may be conglomerates formed in running water. Scientists called this a possible identification. It is an interpretation, not a proof.',
        lines: [A('Logged. Notice the careful word “possible.” That is how real scientists talk.')] },
      { type: 'challenge', questions: [
        { prompt: 'What was Mars Pathfinder mainly designed to test?', options: [
          { text: 'A low-cost way to land and deliver a rover.', ok: true, why: 'Pathfinder was designed to demonstrate a low-cost way to deliver instruments and a free-ranging rover to Mars.' },
          { text: 'Bringing Mars rocks back to Earth.', why: 'Pathfinder stayed on Mars. No samples came home.' },
          { text: 'Searching for living Martians.', why: 'Pathfinder studied rocks, soil and weather. It did not search for life.' } ] },
      ] },
      { type: 'history', title: 'Real history: Mars Pathfinder', text: [
        'Pathfinder launched on December 4, 1996, and landed on July 4, 1997. The lander returned more than 16,000 images and Sojourner about 550.',
        'The mission returned 2.6 billion bits of data, including more than 15 chemical analyses of rocks. NASA received the last successful data transmission on September 27, 1997.',
        'NASA said future Mars landers and rovers would share the designs and technologies Pathfinder first tested.'],
        sources: [S('NASA/JPL: Mars Pathfinder Winds Down', 'https://science.nasa.gov/solar-system/planets/mars/mars-pathfinder-winds-down-after-phenomenal-mission'), S('NASA Science: Mars Pathfinder', 'https://science.nasa.gov/mission/mars-pathfinder/')] },
    ] },

  // ---------------------------------------------------------------- 6
  { id: 'ch6', number: 6, title: 'The Twin Explorers', location: 'Mars · Gusev Crater and Meridiani Planum', world: 'mars', artifactId: 'spirit-opportunity', bg: 'spirit',
    scenes: [
      { type: 'dialogue', lines: [
        V('Two rovers, two landing sites, one big question: was ancient Mars wet?'),
        A('Spirit landed in Gusev Crater in January 2004. Opportunity landed three weeks later at Meridiani Planum, on the other side of the planet.'),
        Y('Why send two?'),
        A('Each site was chosen because of clues seen from orbit. Let us compare them.') ] },
      { type: 'explore', prompt: 'Visit both sites. Inspect at least one point at each, using the tabs at the top.', need: 1, perVariant: true,
        variants: [
          { id: 'spirit', label: 'Spirit · Gusev Crater', bg: 'spirit', spots: [
            { id: 'channel', x: 560, y: 590, label: 'Dry channel', name: 'Gusev’s dry river channel', does: 'Gusev Crater was chosen partly because a dry river channel leads into it.', matters: 'A channel is a clue that water once flowed here.', fact: 'Spirit landed on January 4, 2004 (UTC).' },
            { id: 'homeplate', x: 1080, y: 610, label: 'Home Plate', name: 'Home Plate', does: 'Spirit studied this bright plateau.', matters: 'It found deposits about 90 percent pure silica. On Earth, silica like this usually forms in hot springs or steam vents.', fact: 'Spirit later got stuck in soft sand, and last contacted Earth in 2010.' },
          ] },
          { id: 'opportunity', label: 'Opportunity · Meridiani Planum', bg: 'opportunity', spots: [
            { id: 'blueberries', x: 1000, y: 780, label: 'Blueberries', name: 'Hematite “blueberries”', does: 'These tiny gray spheres are made of hematite, an iron mineral.', matters: 'Hematite usually forms in water, so this is a clue to past water.', fact: 'Opportunity landed on January 25, 2004 (UTC), at a site chosen for its hematite.' },
            { id: 'meteorite', x: 1150, y: 640, label: 'Heat Shield Rock', name: 'Heat Shield Rock', does: 'This iron meteorite lay near Opportunity’s own discarded heat shield.', matters: 'It was the first meteorite identified on another planet.', fact: 'It is about the size of a basketball.' },
          ] },
        ] },
      { type: 'choice', who: 'archie', prompt: 'Which rover’s evidence tells us more about ancient water?', options: [
        { text: 'Opportunity’s hematite', reply: [A('Hematite usually forms in water, so it is a strong clue.'), A('Spirit’s silica adds a second clue, from a very different place.')] },
        { text: 'Spirit’s silica', reply: [A('Silica like this often forms in hot springs, so it points to hot water.'), A('Opportunity’s hematite adds a clue from another place.')] },
        { text: 'Both add pieces to the puzzle', reply: [A('Exactly. Two sites, two kinds of evidence. That is the whole reason for two rovers.')] },
      ] },
      { type: 'evidence', id: 'ev-hematite', title: 'Hematite “blueberries”', kind: 'Geological evidence', plate: 'mer',
        text: 'Opportunity found small gray spheres of hematite, an iron mineral that usually forms in water. Scientists interpret this as a sign that parts of Mars once had liquid water. It is not evidence of life.',
        lines: [A('Logged. Remember: past water is a clue about habitability, not proof of life.')] },
      { type: 'challenge', questions: [
        { prompt: 'Why did NASA send two rovers to different places?', options: [
          { text: 'To check two sites, each chosen for different clues about past water.', ok: true, why: 'Gusev had a dry river channel and Meridiani had hematite, both seen from orbit.' },
          { text: 'Because one rover would have been too lonely.', why: 'Rovers do not get lonely. Each site was chosen for its own science clues.' },
          { text: 'To race each other across Mars.', why: 'They were on opposite sides of the planet and could never meet.' } ] },
      ] },
      { type: 'history', title: 'Real history: Spirit and Opportunity', text: [
        'Both rovers were designed for 90 Martian days. Spirit worked for more than six years and Opportunity for almost fifteen.',
        'Opportunity went quiet during a planet-wide dust storm in June 2018, and NASA declared its mission complete on February 13, 2019. NASA ended its efforts to reach Spirit in May 2011.',
        'Their discoveries are part of NASA’s “follow the water” strategy for exploring Mars.'],
        sources: [S('NASA Space Place: The Mars Rovers', 'https://spaceplace.nasa.gov/mars-spirit-opportunity/'), S('NASA Science: Spirit', 'https://science.nasa.gov/mission/mer-spirit/'), S('NASA/JPL: Opportunity finds an iron meteorite', 'https://www.jpl.nasa.gov/news/opportunity-rover-finds-an-iron-meteorite-on-mars')] },
    ] },

  // ---------------------------------------------------------------- 7
  { id: 'ch7', number: 7, title: 'The Ice Detective', location: 'Mars · Northern plains', world: 'mars', artifactId: 'phoenix', bg: 'phoenix',
    scenes: [
      { type: 'dialogue', lines: [
        A('May 2008. Phoenix landed in Green Valley, in the Martian arctic.'),
        V('It landed on rocket thrusters, no airbags, farther north than any earlier Mars mission.'),
        Y('What was it looking for?'),
        A('Water. Not the kind you can see, but the kind hidden just below the surface.') ] },
      { type: 'explore', prompt: 'Examine the lander. Select two of the glowing points.', need: 2, spots: [
        { id: 'arm', x: 1000, y: 720, label: 'Robotic arm', name: 'Robotic arm', does: 'It dug trenches and scooped up soil.', matters: 'It let Phoenix reach below the dusty surface.', fact: 'The arm was nearly 8 feet (2.5 meters) long.' },
        { id: 'ovens', x: 800, y: 660, label: 'Tiny ovens', name: 'Instrument ovens', does: 'They baked soil samples, and instruments analyzed what came off.', matters: 'This confirmed water in a sample, announced on July 31, 2008.', fact: 'The ovens were tiny, but they were key to the water discovery.' },
        { id: 'array', x: 620, y: 590, label: 'Solar array', name: 'Solar arrays', does: 'They turned sunlight into electricity.', matters: 'As winter darkness fell, they could not power the lander any more.', fact: 'Phoenix was built for a short summer mission, not the Martian winter.' },
        { id: 'trench', x: 1080, y: 800, label: 'Trench', name: 'The trench', does: 'This is where the arm exposed bright material under the soil.', matters: 'The bright lumps were the first clue to water ice.', fact: 'They vanished within four days.' },
      ] },
      { type: 'choice', who: 'archie', prompt: 'There are bright lumps in the trench. How can we find out if they are ice?', options: [
        { text: 'Watch them for a few days', reply: [A('Great idea. Ice in thin, cold air turns straight to vapor. Lumps that vanish are a strong clue.')] },
        { text: 'Bake a sample in the tiny ovens', reply: [A('Smart. Heating a sample and analyzing what comes off can confirm water. Phoenix did exactly that.')] },
        { text: 'Judge by color alone', reply: [A('Color alone cannot tell ice from a bright salt. Watching and heating tell us more.')] },
      ] },
      { type: 'evidence', id: 'ev-ice', title: 'Vanishing bright lumps', kind: 'Soil investigation', plate: 'phoenix',
        text: 'In Phoenix’s trench, bright clumps vanished within four days. Scientists concluded it was water ice turning to vapor. A sample later confirmed water.',
        lines: [A('Logged. A disappearing clue is still a clue.')] },
      { type: 'challenge', visual: 'ice', questions: [
        { prompt: 'Day 0: bright lumps in the trench. Day 4: the lumps are gone. What were they most likely?', options: [
          { text: 'Water ice that turned to vapor.', ok: true, why: 'Ice can turn straight to vapor in the thin Martian air. Salt would not vanish.' },
          { text: 'A bright salt.', why: 'Salt stays put. These lumps disappeared, which points to ice.' },
          { text: 'A buried rock that rolled away.', why: 'Rocks do not roll off by themselves in a trench, and rolling would not make them disappear.' } ] },
      ] },
      { type: 'history', title: 'Real history: Phoenix', text: [
        'Phoenix launched on August 4, 2007, and landed on May 25, 2008. On May 31 its arm began scooping soil, and by June 19 scientists concluded that the bright clumps were probably water ice.',
        'On July 31, 2008, NASA announced that a sample baked in the lander’s tiny ovens confirmed water. Phoenix also detected perchlorate, a type of salt, in the soil.',
        'As planned, it stopped communicating in November 2008 when winter darkness shut down its solar panels.'],
        sources: [S('NASA Science: Phoenix', 'https://science.nasa.gov/mission/phoenix'), S('NASA/JPL: Phoenix', 'https://www.jpl.nasa.gov/missions/phoenix/')] },
    ] },

  // ---------------------------------------------------------------- 8
  { id: 'ch8', number: 8, title: 'The Landing That Changed Everything', location: 'Mars · Jezero Crater', world: 'mars', artifactId: 'perseverance-debris', bg: 'edl',
    scenes: [
      { type: 'dialogue', lines: [
        V('Our last stop. February 2021: Perseverance lands in Jezero Crater.'),
        A('The rover drove away to explore. The machines that got it down did not follow.'),
        Y('They just got left?'),
        A('Each one finished its job during entry, descent and landing. Let us find them.') ] },
      { type: 'explore', prompt: 'Survey the debris. Select two of the glowing points. These pieces landed in different places.', need: 2, spots: [
        { id: 'parachute', x: 700, y: 720, label: 'Parachute', name: 'Parachute', does: 'A supersonic parachute slowed the spacecraft in Mars’s thin air.', matters: 'Slowing down is one of the hardest parts of landing on Mars.', fact: 'Its stripes hide a binary message: “Dare mighty things.”' },
        { id: 'backshell', x: 1000, y: 700, label: 'Backshell', name: 'Backshell', does: 'It protected the rover on the way down and stayed attached to the parachute.', matters: 'It is the cone-shaped cover that held the rover during the fall.', fact: 'The parachute and backshell came down about a kilometer from the landing site.' },
        { id: 'heatshield', x: 1190, y: 630, label: 'Heat shield', name: 'Heat shield', does: 'It took the intense heat of entering Mars’s atmosphere, then was dropped.', matters: 'Without it, the spacecraft would have burned up.', fact: 'It was jettisoned during the descent, so it landed somewhere else.' },
        { id: 'skycrane', x: 470, y: 640, label: 'Sky crane', name: 'Sky crane descent stage', does: 'A rocket-powered stage lowered the rover on cables, then flew away.', matters: 'It let the rover touch down gently, wheels first.', fact: 'It crashed away from the rover, and the rover’s rear camera saw the smoke plume.' },
      ] },
      { type: 'choice', who: 'archie', prompt: 'Where would you expect to find all these pieces?', options: [
        { text: 'All together, right beside the rover', reply: [A('Not quite. Each piece separated at a different moment during the descent, so they came down in different places.'), A('The parachute and backshell landed together, about a kilometer from the landing site.')] },
        { text: 'In different places along the descent path', reply: [A('Correct. They separated at different moments, so they landed in different places.'), A('The parachute and backshell stayed together, but the heat shield and sky crane came down elsewhere.')] },
      ] },
      { type: 'evidence', id: 'ev-edl-photos', title: 'Ingenuity’s view of the debris', kind: 'Landing component', plate: 'heli',
        text: 'On April 19, 2022, the Ingenuity helicopter’s 26th flight took 10 color images of the parachute and backshell, the first views of them from the air.',
        lines: [A('Logged. A helicopter helped us see how a landing really went.')] },
      { type: 'challenge', questions: [
        { prompt: 'What was the heat shield’s job?', options: [
          { text: 'To take the heat of entering the atmosphere.', ok: true, why: 'Entry makes intense heat. The heat shield protected the spacecraft, then was dropped.' },
          { text: 'To lower the rover on cables.', why: 'That is the sky crane’s job.' },
          { text: 'To slow the spacecraft with a big canopy.', why: 'That is the parachute’s job.' } ] },
        { prompt: 'What was the parachute’s job?', options: [
          { text: 'To slow the spacecraft in Mars’s thin air.', ok: true, why: 'A supersonic parachute helped slow the spacecraft before the final steps of landing.' },
          { text: 'To take the heat of entry.', why: 'That is the heat shield’s job.' },
          { text: 'To explore rocks.', why: 'Exploring is the rover’s job.' } ] },
        { prompt: 'What was the sky crane’s job?', options: [
          { text: 'To lower the rover gently on cables, then fly away.', ok: true, why: 'The rocket-powered descent stage lowered the rover to the ground, then flew off and crashed away from it.' },
          { text: 'To collect rock samples.', why: 'Sampling is done by the rover.' },
          { text: 'To protect the rover from heat.', why: 'The heat shield did that.' } ] },
      ] },
      { type: 'history', title: 'Real history: Perseverance’s landing', text: [
        'Perseverance launched on July 30, 2020, and landed on February 18, 2021. A heat shield, a parachute, a backshell and a sky crane delivered it to the surface.',
        'The backshell hit the ground at about 126 km/h (78 mph) roughly a kilometer from the landing site. The pieces were not all in one place.',
        'Engineers call this the best-documented Mars landing in history. Seeing what is left behind shows how the hardware performed, which helps design future landers.'],
        sources: [S('NASA Science: Images of EDL Debris', 'https://science.nasa.gov/blog/images-of-edl-debris'), S('NASA Science: Mars 2020 Perseverance', 'https://science.nasa.gov/mission/mars-2020-perseverance/')] },
    ] },
];

export const CHAPTER_IDS = CHAPTERS.map((c) => c.id);
export const getChapter = (id) => CHAPTERS.find((c) => c.id === id) ?? null;
export const EVIDENCE = CHAPTERS.flatMap((c) => c.scenes.filter((s) => s.type === 'evidence').map((s) => ({ id: s.id, title: s.title, kind: s.kind, plate: s.plate, text: s.text, chapterId: c.id })));
export const EVIDENCE_IDS = EVIDENCE.map((e) => e.id);
export const getEvidence = (id) => EVIDENCE.find((e) => e.id === id) ?? null;
