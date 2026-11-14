// THE LOST MISSION: original SVG illustrations (NOT NASA photographs). Drawn for this project.
// Every scene is 1600x900; the key hardware sits in the central area so it survives cropping on phones.
let uid = 0;
const rnd = (seed) => () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const stars = (n, seed, ymax = 520) => { const r = rnd(seed); return Array.from({ length: n }, () => `<circle cx="${(r() * 1600).toFixed(0)}" cy="${(r() * ymax).toFixed(0)}" r="${(0.5 + r() * 1.4).toFixed(1)}" fill="#e8eef9" opacity="${(0.3 + r() * 0.6).toFixed(2)}"/>`).join(''); };
const frame = (defs, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false"><defs>${defs}</defs>${body}</svg>`;
const wheel = (cx, cy, r) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#20242f" stroke="#9aa3b8" stroke-width="3"/><circle cx="${cx}" cy="${cy}" r="${r * 0.4}" fill="#5b6478"/>`;
const shadow = (cx, cy, rx, ry) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#000" opacity=".4"/>`;
const rock = (x, y, w, h, f) => `<path d="M${x - w} ${y} Q${x - w * 0.6} ${y - h} ${x} ${y - h * 0.9} Q${x + w * 0.7} ${y - h} ${x + w} ${y}Z" fill="${f}"/><path d="M${x - w * 0.3} ${y - h * 0.8} Q${x + w * 0.2} ${y - h} ${x + w * 0.6} ${y - h * 0.6}" stroke="#fff" stroke-opacity=".18" fill="none" stroke-width="3"/>`;
const foil = (u) => `<linearGradient id="${u}f" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f7cf7a"/><stop offset=".55" stop-color="#c58a2a"/><stop offset="1" stop-color="#7d4f12"/></linearGradient>`;
const metal = (u) => `<linearGradient id="${u}m" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#dfe5f0"/><stop offset="1" stop-color="#6c7488"/></linearGradient>`;

function moon(u, mountains = true) {
  return {
    defs: `<linearGradient id="${u}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#010208"/><stop offset=".7" stop-color="#0a1226"/><stop offset="1" stop-color="#1a2a55"/></linearGradient>
<linearGradient id="${u}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7d869d"/><stop offset=".45" stop-color="#3d445a"/><stop offset="1" stop-color="#151927"/></linearGradient>
<radialGradient id="${u}e" cx=".35" cy=".35" r=".8"><stop offset="0" stop-color="#bfe6ff"/><stop offset=".5" stop-color="#2f78c0"/><stop offset="1" stop-color="#0a2a55"/></radialGradient>${foil(u)}${metal(u)}`,
    back: `<rect width="1600" height="900" fill="url(#${u}s)"/>${stars(90, 7)}
<circle cx="1260" cy="180" r="46" fill="url(#${u}e)"/><path d="M1225 168q26-20 60 2M1220 196q30 10 62-6" stroke="#fff" stroke-opacity=".55" fill="none" stroke-width="4"/>
${mountains ? `<path d="M0 575 L120 520 L260 556 L430 478 L600 548 L760 506 L900 558 L1100 488 L1280 548 L1440 508 L1600 556 V620 H0Z" fill="#242b42"/><path d="M0 590 L180 548 L340 584 L520 536 L700 588 L880 560 L1040 592 L1240 552 L1420 588 L1600 566 V640 H0Z" fill="#2f3750"/>` : ''}
<path d="M0 592 Q300 556 640 584 T1250 574 T1600 588 V900 H0Z" fill="url(#${u}g)"/>
<g fill="none" stroke="#a3abc0" stroke-opacity=".25" stroke-width="3"><ellipse cx="260" cy="690" rx="150" ry="22"/><ellipse cx="1340" cy="660" rx="120" ry="16"/><ellipse cx="1180" cy="860" rx="190" ry="26"/><ellipse cx="420" cy="840" rx="110" ry="14"/></g>`,
  };
}
function mars(u, tone = '#a2603f') {
  return {
    defs: `<linearGradient id="${u}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b0e16"/><stop offset=".55" stop-color="#6e3636"/><stop offset="1" stop-color="#d08f66"/></linearGradient>
<linearGradient id="${u}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${tone}"/><stop offset=".5" stop-color="#5e3326"/><stop offset="1" stop-color="#241315"/></linearGradient>
<radialGradient id="${u}sun" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffe6c4" stop-opacity=".9"/><stop offset="1" stop-color="#ffb070" stop-opacity="0"/></radialGradient>${metal(u)}${foil(u)}`,
    back: `<rect width="1600" height="900" fill="url(#${u}s)"/>${stars(40, 11, 300)}<circle cx="1180" cy="420" r="150" fill="url(#${u}sun)"/>
<path d="M0 560 L200 520 L380 548 L560 506 L760 552 L980 512 L1180 550 L1380 520 L1600 548 V610 H0Z" fill="#7b4232" opacity=".85"/>
<path d="M0 588 Q320 560 700 584 T1300 572 T1600 586 V900 H0Z" fill="url(#${u}g)"/>${rock(260, 760, 70, 40, '#6d3a2b')}${rock(1380, 700, 60, 32, '#6d3a2b')}${rock(1480, 820, 90, 50, '#5a2f24')}`,
  };
}

const SCENES = {
  hq(u) {
    return frame(`<radialGradient id="${u}a" cx=".5" cy=".4" r=".7"><stop offset="0" stop-color="#16295a"/><stop offset="1" stop-color="#03050b"/></radialGradient>
<radialGradient id="${u}mo" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#d9dde8"/><stop offset=".6" stop-color="#7d869d"/><stop offset="1" stop-color="#2a3044"/></radialGradient>
<radialGradient id="${u}ma" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#ffb98d"/><stop offset=".6" stop-color="#b4562d"/><stop offset="1" stop-color="#4a2018"/></radialGradient>`,
      `<rect width="1600" height="900" fill="url(#${u}a)"/>${stars(120, 3, 700)}
<g fill="none" stroke="#5ad8ff" stroke-opacity=".28" stroke-width="2"><ellipse cx="800" cy="470" rx="520" ry="120"/><ellipse cx="800" cy="470" rx="380" ry="80"/><path d="M0 700H1600M0 740H1600" stroke-opacity=".12"/></g>
<circle cx="610" cy="400" r="92" fill="url(#${u}mo)"/><circle cx="990" cy="400" r="92" fill="url(#${u}ma)"/>
<circle cx="580" cy="380" r="16" fill="#000" opacity=".15"/><circle cx="640" cy="430" r="10" fill="#000" opacity=".15"/><circle cx="1010" cy="380" r="14" fill="#000" opacity=".15"/>
<path d="M610 400 Q800 250 990 400" stroke="#ffb454" stroke-dasharray="8 8" fill="none" stroke-width="3" opacity=".7"/>
<path d="M300 900 L520 640 H1080 L1300 900Z" fill="#0d1530" opacity=".9"/><path d="M520 640H1080" stroke="#5ad8ff" stroke-width="3" opacity=".6"/>
<g fill="#5ad8ff" opacity=".35"><rect x="120" y="560" width="180" height="12"/><rect x="120" y="590" width="120" height="8"/><rect x="1300" y="560" width="180" height="12"/><rect x="1360" y="590" width="120" height="8"/></g>`);
  },

  surveyor(u) { const m = moon(u); return frame(m.defs, `${m.back}
<path d="M300 760 Q800 690 1300 760 Q800 840 300 760Z" fill="#000" opacity=".25"/>
${shadow(800, 835, 260, 24)}
<g stroke="url(#${u}m)" stroke-width="14" stroke-linecap="round" fill="none"><path d="M770 620 L628 826"/><path d="M830 620 L972 826"/><path d="M800 640 L800 838"/></g>
<ellipse cx="628" cy="832" rx="38" ry="11" fill="#9aa3b8"/><ellipse cx="972" cy="832" rx="38" ry="11" fill="#9aa3b8"/><ellipse cx="800" cy="842" rx="34" ry="10" fill="#9aa3b8"/>
<path d="M740 560 L800 530 L860 560 L860 640 L800 664 L740 640Z" fill="url(#${u}f)" stroke="#fff" stroke-opacity=".25" stroke-width="3"/>
<path d="M800 530 V372" stroke="url(#${u}m)" stroke-width="12"/>
<path d="M690 368 L910 368 L894 340 L706 340Z" fill="#1d3b6e" stroke="#9fd8ff" stroke-width="3"/><path d="M760 340 V368M800 340 V368M840 340 V368" stroke="#9fd8ff" stroke-opacity=".6" stroke-width="2"/>
<rect x="764" y="352" width="72" height="42" rx="6" fill="url(#${u}m)"/><circle cx="800" cy="374" r="14" fill="#0a1226" stroke="#5ad8ff" stroke-width="3"/><circle cx="800" cy="374" r="5" fill="#5ad8ff"/>
<path d="M848 625 L940 660 L1015 722" stroke="url(#${u}m)" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M1000 716 L1034 722 L1024 746 L996 738Z" fill="#c3cad6" stroke="#fff" stroke-opacity=".3"/>
<path d="M740 600 L690 590 L670 560" stroke="#9aa3b8" stroke-width="6" fill="none"/><circle cx="668" cy="556" r="14" fill="none" stroke="#9aa3b8" stroke-width="4"/>
${rock(1180, 790, 60, 34, '#4a5167')}${rock(420, 800, 80, 40, '#4a5167')}`); },

  descent(u) { const m = moon(u); return frame(m.defs, `${m.back}
${shadow(800, 850, 330, 26)}
<g fill="#6c7488" opacity=".55"><ellipse cx="420" cy="860" rx="24" ry="7"/><ellipse cx="470" cy="846" rx="22" ry="6"/><ellipse cx="520" cy="860" rx="22" ry="6"/><ellipse cx="1090" cy="860" rx="22" ry="6"/><ellipse cx="1140" cy="846" rx="22" ry="6"/></g>
<path d="M650 700 L548 826 M950 700 L1052 826 M800 720 L800 846" stroke="url(#${u}m)" stroke-width="12" stroke-linecap="round"/>
<path d="M606 756 L694 724M994 756 L906 724" stroke="#9aa3b8" stroke-width="7"/>
<ellipse cx="548" cy="832" rx="44" ry="11" fill="#aab2c4"/><ellipse cx="1052" cy="832" rx="44" ry="11" fill="#aab2c4"/><ellipse cx="800" cy="852" rx="40" ry="10" fill="#aab2c4"/>
<path d="M800 740 L772 760 L828 760Z" fill="#2a2f3d"/><path d="M760 742 L840 742 L852 776 L748 776Z" fill="#3a4050" stroke="#9aa3b8" stroke-width="2"/>
<path d="M610 560 L690 500 L910 500 L990 560 L990 650 L930 724 L670 724 L610 650Z" fill="url(#${u}f)" stroke="#fff" stroke-opacity=".3" stroke-width="3"/>
<path d="M690 500 L690 724M910 500 L910 724M610 604 H990" stroke="#5a3a0d" stroke-opacity=".5" stroke-width="3"/>
<rect x="650" y="770" width="36" height="22" fill="#e8eef9" stroke="#8a9bb8" stroke-width="2"/>
<path d="M650 470 L690 440 L910 440 L950 470 V500H650Z" fill="none" stroke="#5ad8ff" stroke-width="3" stroke-dasharray="10 8" opacity=".75"/><path d="M690 440 V500M910 440 V500" stroke="#5ad8ff" stroke-dasharray="10 8" opacity=".5" stroke-width="2"/>
<path d="M740 650 L800 626 L860 650" stroke="#5a3a0d" stroke-opacity=".5" stroke-width="3" fill="none"/>
${rock(1250, 820, 70, 36, '#4a5167')}${rock(330, 800, 54, 28, '#4a5167')}`); },

  alsep(u) { const m = moon(u); return frame(m.defs, `${m.back}
<path d="M0 590 L260 470 L520 560 L700 520 L900 580 L1100 500 L1420 570 L1600 540 V620 H0Z" fill="#2a3149" opacity=".9"/>
${shadow(800, 760, 360, 26)}
<path d="M690 660 Q640 680 600 700" stroke="#c58a2a" stroke-width="9" fill="none"/><path d="M910 670 Q990 690 1020 748M860 690 Q880 760 900 805" stroke="#c58a2a" stroke-width="6" fill="none"/>
<rect x="740" y="610" width="120" height="76" rx="6" fill="url(#${u}f)" stroke="#fff" stroke-opacity=".3" stroke-width="3"/><path d="M740 640H860M770 610V686" stroke="#5a3a0d" stroke-opacity=".5" stroke-width="3"/>
<path d="M800 610 V508" stroke="url(#${u}m)" stroke-width="8"/><path d="M752 470 Q800 520 848 470 Q800 456 752 470Z" fill="url(#${u}m)" stroke="#fff" stroke-opacity=".3" stroke-width="3"/><path d="M800 470 V496" stroke="#5ad8ff" stroke-width="3"/>
<g transform="translate(590 700)"><rect x="-26" y="-62" width="52" height="92" rx="8" fill="#3a4050" stroke="#9aa3b8" stroke-width="3"/><path d="M-26 -40H26M-26 -18H26M-26 4H26" stroke="#9aa3b8" stroke-width="3"/><path d="M-26 -50L-52 -62V6L-26 -4M26 -50L52 -62V6L26 -4" fill="#4a5167" stroke="#9aa3b8" stroke-width="2"/></g>
<g transform="translate(1020 756)"><path d="M0 -20 V8" stroke="#9aa3b8" stroke-width="5"/><circle cx="0" cy="-26" r="14" fill="#c58a2a" stroke="#fff" stroke-opacity=".3" stroke-width="3"/><circle cx="0" cy="-26" r="5" fill="#2a2f3d"/></g>
<g transform="translate(900 808)"><ellipse rx="40" ry="15" fill="#3a4050" stroke="#9aa3b8" stroke-width="3"/><path d="M-20 -4Q0 -16 20 -4" stroke="#5ad8ff" stroke-width="3" fill="none"/></g>
${rock(340, 790, 90, 44, '#4a5167')}${rock(1300, 800, 64, 32, '#4a5167')}`); },

  rover(u) { const m = moon(u); return frame(m.defs, `${m.back}
<path d="M0 600 Q300 540 560 590 L1000 560 Q1300 520 1600 580 V640 H0Z" fill="#1b2136" opacity=".8"/><path d="M0 640 Q500 610 900 640 T1600 630" stroke="#0b0f1c" stroke-width="22" fill="none" opacity=".7"/>
${shadow(800, 812, 340, 24)}
<path d="M600 650 L1000 650 L980 690 L620 690Z" fill="url(#${u}m)" stroke="#fff" stroke-opacity=".3" stroke-width="3"/>
<path d="M760 650 V590 H820 V650M850 650 V590 H910 V650" fill="#3a4050" stroke="#9aa3b8" stroke-width="3"/>
<rect x="590" y="580" width="70" height="60" rx="6" fill="url(#${u}f)" stroke="#fff" stroke-opacity=".3" stroke-width="3"/>
<path d="M940 650 V520" stroke="#9aa3b8" stroke-width="7"/><path d="M890 478 Q935 540 980 478 Q935 460 890 478Z" fill="url(#${u}m)" stroke="#fff" stroke-opacity=".3" stroke-width="3"/>
<rect x="960" y="574" width="50" height="34" rx="5" fill="url(#${u}m)"/><circle cx="1000" cy="591" r="8" fill="#0a1226" stroke="#5ad8ff" stroke-width="2"/><path d="M984 650 V608" stroke="#9aa3b8" stroke-width="5"/>
${wheel(655, 748, 62)}${wheel(945, 748, 62)}
<path d="M655 686 V720M945 686 V720" stroke="#9aa3b8" stroke-width="8"/>
<g fill="none" stroke="#a3abc0" stroke-opacity=".5" stroke-width="3"><path d="M520 840 Q580 830 640 842M960 842 Q1020 830 1100 846"/></g>
${rock(1230, 800, 70, 36, '#4a5167')}${rock(380, 800, 60, 30, '#4a5167')}`); },

  pathfinder(u) { const m = mars(u); return frame(m.defs, `${m.back}
<path d="M0 560 L220 470 L330 540 L520 500 L700 556 L1000 520 L1160 450 L1260 530 L1600 540 V600 H0Z" fill="#6f382c" opacity=".7"/>
${shadow(800, 790, 300, 22)}
<path d="M800 700 L640 780 L800 790Z" fill="#c3cad6" stroke="#fff" stroke-opacity=".3" stroke-width="3"/><path d="M800 700 L960 780 L800 790Z" fill="#9aa3b8" stroke="#fff" stroke-opacity=".3" stroke-width="3"/><path d="M800 700 L760 600 L840 600Z" fill="#dfe5f0" stroke="#fff" stroke-opacity=".3" stroke-width="3"/>
<path d="M640 780 Q700 740 800 700 M960 780 Q900 740 800 700" stroke="#fff" stroke-opacity=".25" fill="none" stroke-width="3"/>
<path d="M800 600 V520" stroke="#9aa3b8" stroke-width="8"/><rect x="770" y="490" width="60" height="38" rx="6" fill="url(#${u}m)"/><circle cx="790" cy="509" r="7" fill="#0a1226" stroke="#5ad8ff" stroke-width="2"/><circle cx="812" cy="509" r="7" fill="#0a1226" stroke="#5ad8ff" stroke-width="2"/>
<path d="M880 780 L990 745" stroke="#9aa3b8" stroke-width="10"/>
<g transform="translate(1010 745)"><rect x="-50" y="-32" width="100" height="40" rx="6" fill="url(#${u}m)" stroke="#fff" stroke-opacity=".3" stroke-width="3"/><path d="M-46 -34 L46 -34 L38 -52 L-38 -52Z" fill="#1d3b6e" stroke="#9fd8ff" stroke-width="2"/>${wheel(-36, 18, 14)}${wheel(0, 18, 14)}${wheel(36, 18, 14)}<path d="M30 -32 L50 -60" stroke="#9aa3b8" stroke-width="3"/></g>
<ellipse cx="690" cy="700" rx="50" ry="20" fill="#e8eef9" opacity=".15"/>
${rock(1160, 790, 70, 40, '#6d3a2b')}${rock(520, 790, 60, 30, '#5a2f24')}${rock(1090, 700, 40, 22, '#6d3a2b')}${rock(440, 700, 36, 20, '#6d3a2b')}`); },

  spirit(u) { const m = mars(u, '#9a5c3d'); return frame(m.defs, `${m.back}
<path d="M0 540 L200 480 L400 520 L560 470 L760 520 L1200 500 L1400 470 L1600 520 V600 H0Z" fill="#6a3427"/>
<path d="M440 560 Q520 600 560 640 Q500 650 430 600Z" fill="#3a1d1a" opacity=".65"/>
<ellipse cx="1080" cy="640" rx="150" ry="26" fill="#d6a37c" opacity=".7"/><ellipse cx="1080" cy="636" rx="130" ry="20" fill="#e8c7a5" opacity=".55"/>
${shadow(800, 800, 280, 22)}${merRover(u, 800, 700)}
${rock(380, 800, 80, 40, '#6d3a2b')}${rock(1280, 800, 70, 36, '#6d3a2b')}`); },

  opportunity(u) { const m = mars(u, '#b0693f'); const r = rnd(5); const dots = Array.from({ length: 70 }, () => `<circle cx="${(300 + r() * 1000).toFixed(0)}" cy="${(700 + r() * 170).toFixed(0)}" r="${(2 + r() * 4).toFixed(1)}" fill="#3b3f4d" stroke="#8d92a6" stroke-width="1"/>`).join(''); return frame(m.defs, `${m.back}
<rect x="0" y="560" width="1600" height="14" fill="#c98a62" opacity=".35"/>${dots}
<g transform="translate(1150 640)"><path d="M-70 0 Q-20 -50 70 -10 L50 14 L-60 22Z" fill="#a8a29a" stroke="#fff" stroke-opacity=".3" stroke-width="3"/><path d="M-30 -30 Q10 -44 40 -22" stroke="#fff" stroke-opacity=".3" fill="none" stroke-width="3"/></g>
<g transform="translate(1010 800)"><ellipse rx="0" ry="0"/></g>
<g transform="translate(1180 640)"><circle cx="0" cy="-26" r="0"/></g>
${shadow(760, 800, 280, 22)}${merRover(u, 760, 710)}
${rock(1380, 830, 70, 34, '#6d3a2b')}`); },

  phoenix(u) { const m = mars(u, '#a86a49'); return frame(m.defs, `${m.back}
<g fill="none" stroke="#2b1717" stroke-opacity=".55" stroke-width="4"><path d="M0 700 Q200 690 340 740 T640 780 T980 880"/><path d="M1600 690 Q1400 700 1260 760 T1000 800"/><path d="M200 900 Q380 820 520 830 T800 860"/><path d="M1100 900 Q1250 840 1450 850"/></g>
${shadow(800, 790, 320, 24)}
<path d="M690 700 L650 800 M910 700 L950 800 M800 710 L800 810" stroke="url(#${u}m)" stroke-width="10" stroke-linecap="round"/><ellipse cx="650" cy="806" rx="26" ry="8" fill="#9aa3b8"/><ellipse cx="950" cy="806" rx="26" ry="8" fill="#9aa3b8"/><ellipse cx="800" cy="814" rx="26" ry="8" fill="#9aa3b8"/>
<path d="M690 640 H910 L930 710 H670Z" fill="url(#${u}m)" stroke="#fff" stroke-opacity=".3" stroke-width="3"/>
<rect x="740" y="622" width="40" height="22" rx="4" fill="#2a2f3d" stroke="#5ad8ff" stroke-width="2"/><circle cx="840" cy="632" r="14" fill="#4a5167" stroke="#9aa3b8" stroke-width="3"/>
<g transform="translate(610 600)"><ellipse rx="140" ry="64" transform="rotate(-8)" fill="#1d3b6e" stroke="#9fd8ff" stroke-width="4"/><ellipse rx="140" ry="64" transform="rotate(-8)" fill="none" stroke="#9fd8ff" stroke-opacity=".5" stroke-dasharray="4 14" stroke-width="30"/></g>
<g transform="translate(990 600)"><ellipse rx="140" ry="64" transform="rotate(8)" fill="#1d3b6e" stroke="#9fd8ff" stroke-width="4"/></g>
<path d="M900 690 L990 660 L1040 740 L1062 790" stroke="url(#${u}m)" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M1050 782 L1090 790 L1082 812 L1048 802Z" fill="#c3cad6" stroke="#fff" stroke-opacity=".3"/>
<path d="M980 800 Q1080 880 1200 820 Q1100 770 980 800Z" fill="#1b0f12" stroke="#000" stroke-opacity=".5" stroke-width="3"/>
<g fill="#eaf6ff" opacity=".95"><ellipse cx="1050" cy="824" rx="22" ry="7"/><ellipse cx="1110" cy="834" rx="18" ry="6"/><ellipse cx="1150" cy="822" rx="16" ry="5"/></g>
${rock(400, 820, 60, 28, '#6d3a2b')}${rock(1400, 830, 50, 24, '#6d3a2b')}`); },

  edl(u) { const m = mars(u, '#a2603f'); return frame(m.defs, `${m.back}
<g transform="translate(470 650)"><path d="M0 0 Q-90 -10 -150 30 Q-60 20 0 12Z" fill="#2a1b1b" opacity=".6"/><path d="M-4 0 Q-20 -90 8 -180 Q40 -100 20 0Z" fill="#c9b8aa" opacity=".38"/><ellipse cx="0" cy="8" rx="60" ry="14" fill="#1a0f10"/><path d="M-30 6 L-60 -8 L-20 -14M26 10 L58 -6 L40 -16" stroke="#9aa3b8" stroke-width="4" fill="none"/></g>
<g transform="translate(1190 630)"><ellipse cx="0" cy="10" rx="80" ry="20" fill="#000" opacity=".3"/><ellipse cx="0" cy="0" rx="76" ry="26" fill="#6a4b2c" stroke="#2b1a0e" stroke-width="4"/><ellipse cx="0" cy="-4" rx="52" ry="14" fill="#8a6a40"/></g>
${shadow(850, 790, 380, 24)}
<g transform="translate(700 730)"><path d="M-260 20 Q-240 -60 -90 -80 Q60 -90 150 -30 Q250 10 230 60 Q100 90 -60 70 Q-200 90 -260 20Z" fill="#e9e1d6" stroke="#b9ab9a" stroke-width="3"/>
<path d="M-200 10 L-120 70M-130 -40 L-40 70M-40 -66 L40 70M50 -60 L120 62M130 -24 L190 54" stroke="#e0652f" stroke-width="30" opacity=".92"/><path d="M-210 6Q-100 -70 60 -62" stroke="#fff" stroke-opacity=".5" stroke-width="3" fill="none"/></g>
<path d="M880 720 Q940 710 996 706" stroke="#e9e1d6" stroke-width="3" opacity=".8" fill="none"/>
<g transform="translate(1000 700)"><path d="M-62 34 L-36 -34 L36 -34 L62 34Z" fill="url(#${u}f)" stroke="#fff" stroke-opacity=".3" stroke-width="3"/><ellipse cx="0" cy="34" rx="62" ry="14" fill="#5a3a0d"/><ellipse cx="0" cy="-34" rx="36" ry="9" fill="#e8c27a"/></g>
<g transform="translate(300 600)"><rect x="-14" y="-8" width="28" height="12" fill="#c3cad6"/>${wheel(-9, 8, 5)}${wheel(9, 8, 5)}</g>
${rock(1330, 830, 80, 40, '#6d3a2b')}${rock(250, 820, 60, 30, '#6d3a2b')}`); },
};

function merRover(u, x, y) {
  return `<g transform="translate(${x} ${y})"><path d="M-130 -30 L130 -30 L110 -8 L-110 -8Z" fill="#1d3b6e" stroke="#9fd8ff" stroke-width="3"/><path d="M-110 -8 H110 V38 H-110Z" fill="url(#${u}f)" stroke="#fff" stroke-opacity=".3" stroke-width="3"/>
<path d="M60 -30 V-100" stroke="#9aa3b8" stroke-width="7"/><rect x="38" y="-130" width="46" height="34" rx="6" fill="url(#${u}m)"/><circle cx="52" cy="-113" r="7" fill="#0a1226" stroke="#5ad8ff" stroke-width="2"/><circle cx="72" cy="-113" r="7" fill="#0a1226" stroke="#5ad8ff" stroke-width="2"/>
<path d="M-90 -30 V-70 M-100 -70 H-76" stroke="#9aa3b8" stroke-width="4"/>
${wheel(-95, 66, 28)}${wheel(0, 66, 28)}${wheel(95, 66, 28)}<path d="M-95 38V50M0 38V50M95 38V50" stroke="#9aa3b8" stroke-width="6"/></g>`;
}

export const BG_IDS = Object.keys(SCENES);
/** An inline SVG string for a scene background. Each call gets unique gradient ids. */
export const sceneSvg = (bg) => { const make = SCENES[bg] ?? SCENES.hq; uid += 1; return make(`s${uid}`); };

/** Small consistent character portraits (fictional characters). */
export function portraitSvg(who) {
  const ring = '<circle cx="48" cy="48" r="45" fill="#0a1226" stroke="#5ad8ff" stroke-opacity=".6" stroke-width="2"/>';
  const scan = '<path d="M8 30H88M8 44H88M8 58H88M8 72H88" stroke="#5ad8ff" stroke-opacity=".12"/>';
  const art = {
    vale: '<path d="M16 92Q18 60 48 56Q78 60 80 92Z" fill="#12306a" stroke="#5ad8ff" stroke-width="2"/><path d="M38 60Q48 70 58 60" stroke="#ffb454" stroke-width="3" fill="none"/><circle cx="48" cy="38" r="16" fill="#16295a" stroke="#5ad8ff" stroke-width="2"/><path d="M33 34Q36 18 52 20Q64 22 63 36Q54 28 40 30Z" fill="#5ad8ff" opacity=".55"/><circle cx="48" cy="17" r="7" fill="#5ad8ff" opacity=".55"/>',
    archie: '<path d="M38 28L32 14M58 28L64 14" stroke="#5ad8ff" stroke-width="3"/><circle cx="32" cy="13" r="3" fill="#ffb454"/><circle cx="64" cy="13" r="3" fill="#ffb454"/><circle cx="48" cy="52" r="26" fill="#16295a" stroke="#5ad8ff" stroke-width="3"/><circle cx="48" cy="52" r="14" fill="#04060c" stroke="#ffb454" stroke-width="3"/><circle cx="48" cy="52" r="5" fill="#ffb454"/><path d="M26 62Q48 82 70 62" stroke="#5ad8ff" stroke-opacity=".5" fill="none" stroke-width="2"/>',
    you: '<path d="M18 92Q20 64 48 60Q76 64 78 92Z" fill="#12306a" stroke="#ffb454" stroke-width="2"/><circle cx="48" cy="40" r="22" fill="#16295a" stroke="#ffb454" stroke-width="3"/><path d="M32 36Q48 26 64 36V46Q48 54 32 46Z" fill="#5ad8ff" opacity=".6"/><path d="M26 40H70" stroke="#ffb454" stroke-opacity=".6"/>',
  }[who] ?? '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" aria-hidden="true" focusable="false">${ring}${art}${scan}</svg>`;
}
