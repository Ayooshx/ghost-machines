// Dossier content for all eight artifacts. One shape, one reusable renderer (modules/dossier.js).
// Researched from NASA sources (see each `sources` list). `learned` items are tagged:
//   confirmed       = documented in NASA records or directly observed
//   interpretation  = what scientists concluded or suspect from the evidence
// `transmission` is FICTIONAL dramatized narration, not a real spacecraft signal.

export const DOSSIERS = {
  'surveyor-3': {
    launch: 'April 17, 1967', landing: 'April 20, 1967',
    place: 'Moon · Oceanus Procellarum (the “Ocean of Storms”)',
    objective: 'Before sending astronauts to the Moon, NASA needed to know whether a spacecraft would sink into the dust. Surveyor 3’s job was to make a soft landing (touch down gently, without crashing), test the soil and send back pictures.',
    did: [
      'Surveyor 3 carried a TV camera and a scoop on a small robotic arm. The camera sent back pictures of the landscape, the spacecraft and the sky. The scoop dug trenches to test how strong the soil was.',
      'The landing was bumpy. It touched down, bounced twice, and finally settled on the slope of a small crater. It kept working until the long lunar night began and its solar-powered systems lost sunlight. NASA’s last contact came on May 4, 1967.',
    ],
    learned: [
      { kind: 'interpretation', text: 'From the scoop tests, scientists concluded that the lunar surface was solid enough to hold the weight of an Apollo lunar module.' },
      { kind: 'confirmed', text: 'On November 20, 1969, Apollo 12 astronauts Pete Conrad and Alan Bean walked to Surveyor 3 and removed its camera and soil scoop. Scientists studied the parts back on Earth to see how long exposure to the lunar surface affects equipment.' },
      { kind: 'confirmed', text: 'Apollo 12’s lunar module landed within about 180 meters (600 feet) of Surveyor 3, showing that a pinpoint landing was possible.' },
    ],
    matters: 'Surveyor 3 and its sister spacecraft paved the way for Apollo by showing that landing on the Moon was possible. It is also something very rare: a robot that people later walked up to and visited.',
    surprise: 'Surveyor 3 bounced twice before it came to rest. Two and a half years later, astronauts landed so close that they could walk over and take parts of it home.',
    transmission: {
      narrator: 'Surveyor 3',
      text: [
        'I touched down, and the Moon pushed me back up. Twice. The third time, I stayed.',
        'I am Surveyor 3, and I came to answer one question: will the ground hold? So I reached out with my little arm and I dug. The soil held.',
        'I sent you thousands of pictures. My own footpads. The black sky. The curve of the horizon. Then the Sun slid away, my solar panel went dark, and the long lunar night began.',
        'I never said goodbye. Machines don’t know how. I simply stopped.',
        'But listen. Years later, two white-suited shadows walked down into my crater. They took my camera and my scoop and carried them home.',
        'The ground held. That was my whole message. Everything after it was footprints.',
      ],
    },
    sources: [
      { label: 'NASA Science: Surveyor 3', url: 'https://science.nasa.gov/mission/lunar-rangers-and-surveyors/surveyor-3/' },
      { label: 'NASA: Footpads and Footprints, Humans and Machine Meet on the Moon', url: 'https://solarsystem.nasa.gov/news/1111/footpads-and-footprints-humans-and-machine-meet-on-the-moon' },
      { label: 'NASA NSSDCA: Apollo 12 at Surveyor 3', url: 'https://nssdc.gsfc.nasa.gov/imgcat/html/object_page/a12_h_48_7133.html' },
    ],
  },

  'apollo-11-descent': {
    launch: 'July 16, 1969', landing: 'July 20, 1969',
    place: 'Moon · Sea of Tranquility (Tranquility Base)',
    datesNote: 'The ascent stage lifted off on July 21, 1969, after 21 hours and 36 minutes on the surface.',
    objective: 'In 1961 President John F. Kennedy set a national goal: land people on the Moon and bring them safely home. Apollo 11’s crew also planned to collect samples, take photographs and set up science experiments.',
    did: [
      'The lunar module Eagle had two parts. The descent stage, the bottom half with the landing legs and a big engine, carried Neil Armstrong and Buzz Aldrin down to the Sea of Tranquility.',
      'Armstrong flew part of the landing by hand to avoid a crater, and they touched down about four miles from the planned spot. To leave, the crew blasted off in the top half, using the descent stage as a launch pad. The descent stage stayed behind.',
    ],
    learned: [
      { kind: 'confirmed', text: 'Armstrong and Aldrin spent more than two and a half hours outside. They collected lunar samples, and Aldrin set up a small set of instruments called the Early Apollo Scientific Experiments Package (EASEP).' },
      { kind: 'confirmed', text: 'The landing-and-liftoff design worked: the ascent stage launched from the descent stage and docked with the command module Columbia.' },
      { kind: 'confirmed', text: 'A commemorative plaque signed by President Nixon and the three Apollo 11 astronauts was attached to the descent stage.' },
    ],
    matters: 'Tranquility Base is where people first stood on another world. The descent stage and the other items left there are still sitting where they were placed in 1969. Five more crewed Moon landings followed, each building on this one.',
    surprise: 'Armstrong and Aldrin left medallions honoring the three Apollo 1 astronauts and two cosmonauts, plus a tiny silicon disk carrying goodwill messages from 73 countries.',
    transmission: {
      narrator: 'Apollo 11 descent stage',
      text: [
        'I am the half that stayed.',
        'Eagle had two halves. The top held two men and the way home. I held the engine and the legs, everything that let them sink gently onto the Sea of Tranquility. Armstrong took the controls and steered me past a crater.',
        'Then I became a floor. When the time came, the upper half fired its engine and rose off my back, and I felt the lightness of being left.',
        'I still carry a plaque on my leg. It says we came in peace for all mankind. Around me lie medals for explorers who didn’t come home, and a tiny disk of messages from seventy-three countries.',
        'No rain here. No wind. The footprints stay. Someone had to be the place where it all began. I’m glad it was me.',
      ],
    },
    sources: [
      { label: 'NASA: Apollo 11 Mission Overview', url: 'https://www.nasa.gov/missions/apollo/apollo-11/apollo-11-mission-overview/' },
      { label: 'NASA Science: Apollo 11 Plaque', url: 'https://science.nasa.gov/resource/apollo-11-plaque/' },
    ],
  },

  'alsep': {
    launch: 'December 7, 1972 (Apollo 17)', landing: 'December 11, 1972',
    place: 'Moon · Taurus-Littrow valley (Apollo 17 site)',
    datesNote: 'The Apollo 17 station was switched on December 12, 1972 (UTC) and shut down on September 30, 1977.',
    objective: 'Apollo 17 was the final Moon landing of the Apollo program. One goal was to set up a science station that would keep working long after the astronauts had gone home.',
    did: [
      'ALSEP stands for Apollo Lunar Surface Experiments Package. The astronauts unpacked a central station, set up instruments around it, and left it running on its own. Scientists on Earth sent it commands by radio and received its data.',
      'Apollo 17’s instruments included a heat flow experiment (measuring how much heat escapes from inside the Moon), a gravimeter (a very sensitive gravity sensor), a seismic experiment (listening for moonquakes), and detectors for meteorite and dust impacts and for the Moon’s thin atmosphere.',
      'The power source was a radioisotope thermoelectric generator, or RTG: a generator that turns the heat from decaying plutonium into electricity.',
    ],
    learned: [
      { kind: 'confirmed', text: 'The stations were designed to last one year (two for Apollo 17), but ended up working for up to eight. NASA switched the network off on September 30, 1977, citing budget priorities.' },
      { kind: 'confirmed', text: 'Four seismometers (on Apollo 12, 14, 15 and 16) worked together as a network for about five years, helping scientists study the few large moonquakes that happen each year.' },
      { kind: 'interpretation', text: 'In 1977 NASA concluded that the seismic, magnetic and heat flow measurements from the ALSEP stations had given scientists their main information about the inside of the Moon.' },
    ],
    matters: 'Some Moon events are rare or slow: big moonquakes, changes in heat, tiny meteorite hits. Instruments left behind can watch for years, catching things a short visit would miss.',
    surprise: 'Apollo 17’s station was designed to run for about two years and lasted nearly five. And the astronauts themselves loaded its power source, a capsule of plutonium-238 about 4 kilograms in mass, into the generator.',
    transmission: {
      narrator: 'Apollo 17 ALSEP',
      text: [
        'Still listening.',
        'That was my whole job. Two astronauts unpacked me in the Taurus-Littrow valley, set my instruments in the dust, and slid a rod of plutonium into my heart. Then they walked away and left me one instruction: pay attention.',
        'So I did. I felt the Moon shiver with quakes too small for anyone to notice. I measured warmth leaking up from deep inside. I counted tiny meteorites as they struck.',
        'They built me to work for two years. I lasted nearly five.',
        'Then Earth told me to stop. Not because I was broken. Because the money ran out. A listener, told to stop listening.',
        'My transmitter fell silent. But the Moon still shivers. And I remember every tremor.',
      ],
    },
    sources: [
      { label: 'NASA ALSEP Termination Report (NASA RP-1036)', url: 'https://www.nasa.gov/wp-content/uploads/static/history/alsj/19790014808_1979014808.pdf' },
      { label: 'NASA PDS: Apollo 17 ALSEP overview', url: 'https://pds-geosciences.wustl.edu/lunar/urn-nasa-pds-a15_17_hfe_concatenated/document/hfe/a17a_alsep.txt' },
    ],
  },

  'lunar-roving-vehicle': {
    launch: 'July 26, 1971 (Apollo 15)', landing: 'July 30, 1971',
    place: 'Moon · Hadley–Apennine region (Apollo 15 site)',
    datesNote: 'First drive: July 31, 1971. The last drive was on August 2, 1971, the day the crew lifted off.',
    objective: 'Apollo 15 was the first “J mission,” built for longer stays on the Moon and greater surface mobility. The rover’s job was to carry astronauts and their tools far beyond walking distance so they could explore the Hadley–Apennine region.',
    did: [
      'The Lunar Roving Vehicle, or LRV, was a battery-powered, four-wheeled car that folded up to fit on the side of the lunar module. On July 31, 1971, David Scott became the first person to drive on the Moon, with James Irwin beside him.',
      'Over three moonwalks the crew traveled 17.5 miles (about 28 kilometers), collected more than 170 pounds (77 kilograms) of samples, and described what they saw. When they left, the rover stayed parked, and its TV camera showed the liftoff.',
    ],
    learned: [
      { kind: 'confirmed', text: 'The crew set up the ALSEP station, took a core sample from about 10 feet beneath the surface, and photographed and described the geology. Pictures of the west wall of Hadley Rille showed exposed layers.' },
      { kind: 'interpretation', text: 'NASA planned Apollo 15 as its first mission with greater surface mobility. The rover let the crew study far more ground than astronauts could reach on foot.' },
      { kind: 'confirmed', text: 'The rover worked well enough that two more flew, on Apollo 16 and 17. All three were left on the Moon.' },
    ],
    matters: 'The rover showed that people and vehicles can work as a team on another world, the same idea behind the robotic rovers exploring Mars today. It is still parked at Hadley, where the Apollo 15 crew left it.',
    surprise: 'For the first time, people on Earth watched a liftoff from the Moon. The view came from the rover’s TV camera, steered from Mission Control.',
    transmission: {
      narrator: 'Lunar Roving Vehicle',
      text: [
        'They folded me up like a lawn chair and carried me to the Moon on the side of a lander.',
        'Then I unfolded, and for the first time, wheels touched another world.',
        'I was never fast. I was never fancy. But I carried two explorers about seventeen miles, beside a winding valley called Hadley Rille and up the slopes of the Apennine mountains. Everywhere we stopped, they picked up rocks.',
        'On their last day, Earth aimed my camera at their ship. Through my one eye, the world watched a rocket lift off from the Moon for the very first time.',
        'Then I was alone, with seats still shaped like them.',
        'I don’t mind. There are two more of me out here. We’re the quietest cars in the universe.',
      ],
    },
    sources: [
      { label: 'NASA: Apollo 15 Mission Details', url: 'https://www.nasa.gov/missions/apollo/apollo-15-mission-details/' },
      { label: 'NASA NSSDCA: Apollo 15', url: 'https://nssdc.gsfc.nasa.gov/planetary/lunar/apollo15info.html' },
    ],
  },

  'pathfinder-sojourner': {
    launch: 'December 4, 1996', landing: 'July 4, 1997',
    place: 'Mars · Ares Vallis, an ancient flood plain',
    datesNote: 'The last successful data transmission came on September 27, 1997 (mission day, or sol, 83).',
    objective: 'Mars Pathfinder was a test of a faster, cheaper way to reach Mars. Its goals were to land using a new method, deliver a small rover, and study Martian rocks, soil, weather and atmosphere.',
    did: [
      'Pathfinder dropped into the Martian atmosphere, slowed with a parachute about 11 meters (36 feet) wide, and landed using airbags to cushion the impact. After it stopped, the team retracted an airbag that was blocking the ramp so the rover, Sojourner, could roll out.',
      'The lander sent back more than 16,000 images, and Sojourner added about 550. The rover used an X-ray instrument to analyze rocks. The lander worked nearly three times longer than its 30-day design life.',
    ],
    learned: [
      { kind: 'confirmed', text: 'The mission returned 2.6 billion bits of data, including more than 15 chemical analyses of rocks, plus extensive wind and weather measurements.' },
      { kind: 'confirmed', text: 'Pathfinder detected frequent “dust devils” (whirlwinds) from their temperature, wind and pressure signals. It also showed that morning haze came from clouds, not ground fog.' },
      { kind: 'interpretation', text: 'Rounded pebbles and rock sockets may be conglomerates (rocks made of cemented pebbles) that formed in running water. Scientists said this suggests a warmer past in which liquid water was stable. Rock sizes were also consistent with a flood deposit.' },
    ],
    matters: 'Pathfinder showed that airbag landings and small rovers could work. NASA said future Mars landers and rovers would share the designs and technologies it first tested.',
    surprise: 'Sojourner was designed to work for seven days and operated for twelve times that long. After the mission, the lander was renamed the Carl Sagan Memorial Station.',
    transmission: {
      narrator: 'Mars Pathfinder',
      text: [
        'I arrived wrapped in balloons.',
        'That’s the truth. A parachute, a few rockets, and a cocoon of airbags. I hit Mars, bounced, and rolled to a stop.',
        'When the airbags pulled back, a small rover rolled down my ramp. Her name was Sojourner. She was about the size of a microwave oven, and she was the first rover to drive on Mars. She tasted rocks with an X-ray while I photographed everything.',
        'They gave me one month. I gave them nearly three.',
        'My battery was probably the first thing to fail. One day I simply stopped answering.',
        'I wasn’t the biggest, or the cleverest. I was the proof that it could be done.',
        'They renamed me the Carl Sagan Memorial Station. It’s a good name for a place where you wait.',
      ],
    },
    sources: [
      { label: 'NASA/JPL: Mars Pathfinder Winds Down After Phenomenal Mission', url: 'https://science.nasa.gov/solar-system/mars-pathfinder-winds-down-after-phenomenal-mission/' },
      { label: 'NASA Science: Mars Pathfinder', url: 'https://science.nasa.gov/mission/mars-pathfinder' },
    ],
  },

  'spirit-opportunity': {
    launch: 'Spirit: June 10, 2003 · Opportunity: July 7, 2003',
    landing: 'Spirit: January 4, 2004 · Opportunity: January 25, 2004 (UTC)',
    place: 'Mars · two sites on opposite sides of the planet',
    objective: 'Find out whether parts of Mars were ever wet in a way that could have supported life. Each rover was sent to a place with clues from orbit: a dry river channel at Gusev Crater, and a large deposit of the mineral gray hematite at Meridiani Planum.',
    did: [
      'Each rover arrived inside an aeroshell. A parachute opened, the heat shield was jettisoned, the lander dropped on a cable from the backshell, and airbags cushioned the final bounce. The heat shields and landing hardware stayed on Mars.',
      'Then the rovers went to work as robot geologists. Both were designed for 90 Martian days. Spirit worked for more than six years and Opportunity for almost fifteen.',
    ],
    sites: [
      {
        id: 'spirit', label: 'Spirit · Gusev Crater', place: 'Mars · Gusev Crater',
        launch: 'June 10, 2003', landing: 'January 4, 2004 (UTC); January 3 in U.S. Pacific time',
        today: 'Silent since March 22, 2010; NASA ended its attempts to reach it in May 2011',
        note: 'Spirit drove from its landing site to the Columbia Hills and studied Home Plate, a bright, almost circular plateau. There its wheels broke through a crust and sank into soft sand, and it never got free.',
      },
      {
        id: 'opportunity', label: 'Opportunity · Meridiani Planum', place: 'Mars · Meridiani Planum',
        launch: 'July 7, 2003', landing: 'January 25, 2004 (UTC); January 24 in U.S. Pacific time',
        today: 'Last contact June 10, 2018, during a planet-wide dust storm; mission declared complete February 13, 2019',
        note: 'Opportunity explored a series of craters from Eagle Crater to Endeavour Crater. Along the way it examined its own discarded heat shield, which lay near a surprise: a meteorite.',
      },
    ],
    learned: [
      { kind: 'confirmed', text: 'Opportunity found small gray spheres nicknamed “blueberries” made of hematite, an iron mineral that usually forms in water. It also found jarosite, a mineral that forms in acidic water, and clay minerals.' },
      { kind: 'confirmed', text: 'Spirit found deposits about 90 percent pure silica at Home Plate. On Earth, this kind of silica usually forms in hot springs or steam vents.' },
      { kind: 'interpretation', text: 'Scientists interpret these minerals as signs that parts of Mars once had liquid water, and at some times conditions friendlier to life. This is not evidence of life itself.' },
    ],
    matters: 'Spirit and Opportunity showed that some places on ancient Mars were wet. Their discoveries are part of NASA’s “follow the water” strategy for exploring Mars.',
    surprise: 'In January 2005, Opportunity found a basketball-sized iron-nickel rock lying near its own discarded heat shield. It was a meteorite, the first one ever identified on another planet. Scientists nicknamed it “Heat Shield Rock.”',
    transmission: {
      narrator: 'Opportunity’s heat shield',
      text: [
        'I was a shield. My whole job was to burn.',
        'I rode at the front of a robot geologist as Mars’s thin air hit us like a wall, and I took the fire so she wouldn’t have to. A couple of minutes before the end, they let me go.',
        'I broke apart on the plains of Meridiani. Nobody mourned me. But less than a year later, a rover named Opportunity came rolling back to look. She studied how I had survived my own worst day, so that other spacecraft could land more safely.',
        'And beside me she found a dark metal stone: a meteorite, fallen from the sky long before I was.',
        'She worked for years. Her twin, Spirit, worked on the far side of the world. Both are silent now.',
        'I’m still here. A shield and a stone from space. We make strange neighbors.',
      ],
    },
    sources: [
      { label: 'NASA Space Place: The Mars Rovers Spirit and Opportunity', url: 'https://spaceplace.nasa.gov/mars-spirit-opportunity/' },
      { label: 'NASA/JPL: Opportunity Rover Finds an Iron Meteorite on Mars', url: 'https://www.jpl.nasa.gov/news/opportunity-rover-finds-an-iron-meteorite-on-mars' },
      { label: 'NASA Science: Images of EDL Debris (includes Opportunity’s heat shield)', url: 'https://science.nasa.gov/blog/images-of-edl-debris' },
    ],
  },

  'phoenix': {
    launch: 'August 4, 2007', landing: 'May 25, 2008',
    place: 'Mars · Green Valley, Vastitas Borealis (the northern arctic plains)',
    datesNote: 'Final contact: November 2, 2008. Phoenix was designed for a short summer mission, not to survive the Martian winter.',
    objective: 'Phoenix was sent to the Martian arctic to study the history of water there, and to search for evidence of whether the icy ground could ever have supported microbial life.',
    did: [
      'Phoenix landed on rocket thrusters farther north than any earlier Mars mission, at a latitude like northern Alaska. Within four days it sent back a 360-degree panorama, deployed a robotic arm nearly 8 feet (2.5 meters) long, and began sending weather reports.',
      'On May 31 the arm began scooping soil. By June 19, scientists concluded that bright clumps in a trench were probably water ice, because the material vanished four days after being exposed. On July 31, NASA announced that a sample baked in the lander’s tiny ovens had confirmed water.',
      'As planned, the lander stopped communicating in November 2008, when its solar panels stopped working in the dark Martian winter.',
    ],
    learned: [
      { kind: 'confirmed', text: 'Phoenix confirmed water ice just beneath the surface in the northern plains, the first time a spacecraft’s robotic arm touched and sampled it.' },
      { kind: 'confirmed', text: 'The lander detected perchlorate, a type of salt, in the soil.' },
      { kind: 'interpretation', text: 'Scientists suggested perchlorate could be a possible energy source for microbes and a useful resource for future explorers. A mineral called calcium carbonate also hinted that thawed liquid water was occasionally present.' },
    ],
    matters: 'Phoenix showed that water ice is within reach just under the soil in the Martian arctic. That is a clue to Mars’s climate history, and it may matter to future explorers who need water.',
    surprise: 'The first clue that Phoenix had found ice was that it disappeared. The bright lumps in its trench evaporated within four days, right in front of its camera.',
    transmission: {
      narrator: 'Phoenix Mars Lander',
      text: [
        'I landed on rocket thrusters, and my first thought was: cold.',
        'They sent me to the Martian arctic to answer an old question. Is there water here? I had an arm nearly eight feet long and a tiny kitchen of ovens, so I dug.',
        'In my trench I found bright lumps. Four days later, they were gone. Not dust. Not rock. Ice, turning straight into vapor in the thin air.',
        'I tasted Martian water. Not many machines can say that.',
        'But I was built for a short summer. The Sun sank lower each day, my panels gave less, and in November I spoke one last time.',
        'Then winter came with its frost. They called, and I did not answer. But I did what I came to do. I found the ice.',
      ],
    },
    sources: [
      { label: 'NASA Science: Phoenix', url: 'https://science.nasa.gov/mission/phoenix' },
      { label: 'NASA/JPL: Phoenix', url: 'https://www.jpl.nasa.gov/missions/phoenix/' },
    ],
  },

  'perseverance-debris': {
    launch: 'July 30, 2020', landing: 'February 18, 2021',
    place: 'Mars · Jezero Crater, an ancient lake bed',
    datesNote: 'The parachute and backshell were photographed from the air by the Ingenuity helicopter on April 19, 2022.',
    objective: 'The Perseverance rover was sent to Jezero Crater to search for signs of ancient life and collect rock samples. First it had to land safely, and that was the job of the entry, descent and landing hardware.',
    did: [
      'The spacecraft hit Mars’s atmosphere at about 20,000 km/h (12,500 mph). A heat shield took the heat, a supersonic parachute slowed it, and a backshell protected the rover. Then a rocket-powered “sky crane” lowered the rover on cables. The discarded hardware landed a safe distance away.',
      'The backshell hit the ground at about 126 km/h (78 mph), roughly 1 kilometer northwest of the landing site, still attached to the parachute. The sky crane’s descent stage crashed away from the rover, and a rear camera caught the smoke plume.',
    ],
    learned: [
      { kind: 'confirmed', text: 'On April 19, 2022, Ingenuity’s 26th flight took 10 color images of the parachute and backshell, the first views of them from the air.' },
      { kind: 'confirmed', text: 'Images from the rover show a debris field several meters wide, including charred heat-shield material, metal springs and thermal blanket pieces.' },
      { kind: 'interpretation', text: 'Engineers studied the images to see how the hardware performed. Early looks suggested the backshell’s protective coating stayed intact during entry.' },
    ],
    matters: 'Mission engineers have called this the best-documented Mars landing in history. Seeing what is left behind shows how the hardware really performed, which helps design future landers.',
    surprise: 'The parachute’s orange-and-white stripes hide a message in binary code. It spells “Dare mighty things,” the motto of NASA’s Jet Propulsion Laboratory, along with the lab’s GPS coordinates. NASA confirmed it at a news briefing, and internet sleuths cracked it within hours.',
    transmission: {
      narrator: 'Perseverance’s parachute',
      text: [
        'I am the parachute. You won’t remember me, but you watched me.',
        'For a few minutes I bloomed in orange and white across the thinnest air a parachute has ever had to grab. I slowed a spacecraft from supersonic speed so a rover named Perseverance could live.',
        'Then they cut me loose, and I fell with my old shell, and we hit the ground hard. That was always the plan.',
        'Look closely at my stripes. Hidden in them is a message, written in code. Dare mighty things.',
        'More than a year later, a tiny helicopter flew over me and took my picture. It was the first time anyone had seen me from above.',
        'The rover drove on toward an ancient river delta. I stayed, tangled in my own lines, a bright scrap of the first day. Dare mighty things. I just held it up for a while.',
      ],
    },
    sources: [
      { label: 'NASA Science: Images of EDL Debris', url: 'https://science.nasa.gov/blog/images-of-edl-debris' },
      { label: 'NASA Science: Mars 2020 Perseverance', url: 'https://science.nasa.gov/mission/mars-2020-perseverance/' },
    ],
  },
};
