// Stylized 2D map art. These are simplified illustrations, not accurate maps.
const grid = `<g fill="none" stroke="#5ad8ff" stroke-opacity=".09" stroke-width="1.5">
  ${[250, 375, 500, 625, 750].map((y) => `<line x1="40" x2="960" y1="${y}" y2="${y}"/>`).join('')}
  ${[110, 220, 330].map((rx) => `<ellipse cx="500" cy="500" rx="${rx}" ry="440"/>`).join('')}
  <line x1="500" x2="500" y1="60" y2="940"/></g>`;
const craters = (list, stroke) => list.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${stroke}" stroke-width="2"/>`).join('');

const frame = (id, label, base, rimColor, body) => `<svg viewBox="0 0 1000 1000" role="img" aria-label="${label}" focusable="false">
<defs>
  <radialGradient id="${id}Base" cx="38%" cy="32%" r="80%">${base}</radialGradient>
  <radialGradient id="${id}Rim" cx="50%" cy="50%" r="50%"><stop offset=".88" stop-color="${rimColor}" stop-opacity="0"/><stop offset="1" stop-color="${rimColor}" stop-opacity=".3"/></radialGradient>
  <filter id="${id}Soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="16"/></filter>
  <clipPath id="${id}Clip"><circle cx="500" cy="500" r="440"/></clipPath>
</defs>
<circle cx="500" cy="500" r="440" fill="url(#${id}Base)"/>
<g clip-path="url(#${id}Clip)">${body}${grid}</g>
<circle cx="500" cy="500" r="440" fill="url(#${id}Rim)"/>
<circle cx="500" cy="500" r="440" fill="none" stroke="${rimColor}" stroke-opacity=".5" stroke-width="2"/>
</svg>`;

export const MAP_ART = {
  moon: frame('moon', 'Stylized illustration of the Moon’s near side',
    '<stop offset="0" stop-color="#4a5872"/><stop offset=".55" stop-color="#222e48"/><stop offset="1" stop-color="#0a1022"/>', '#5ad8ff',
    `<g fill="#0a1124" opacity=".72" filter="url(#moonSoft)">
       <ellipse cx="300" cy="520" rx="150" ry="190"/><circle cx="385" cy="330" r="115"/><circle cx="560" cy="340" r="70"/>
       <ellipse cx="610" cy="470" rx="92" ry="70"/><ellipse cx="770" cy="385" rx="46" ry="38"/><circle cx="340" cy="700" r="60"/><circle cx="560" cy="580" r="34"/></g>
     ${craters([[250, 300, 26], [700, 640, 34], [430, 780, 22], [380, 470, 16], [810, 560, 20], [560, 700, 18], [470, 190, 24], [660, 250, 14]], 'rgba(160,178,205,.32)')}`),
  mars: frame('mars', 'Stylized illustration of Mars',
    '<stop offset="0" stop-color="#a65a37"/><stop offset=".55" stop-color="#5b2b21"/><stop offset="1" stop-color="#170c13"/>', '#ffb454',
    `<g filter="url(#marsSoft)">
       <ellipse cx="650" cy="430" rx="110" ry="150" transform="rotate(20 650 430)" fill="#241012" opacity=".6"/>
       <ellipse cx="300" cy="380" rx="125" ry="70" fill="#241012" opacity=".45"/><ellipse cx="400" cy="680" rx="140" ry="60" fill="#241012" opacity=".45"/>
       <ellipse cx="770" cy="710" rx="95" ry="72" fill="#d68b5c" opacity=".3"/><ellipse cx="480" cy="560" rx="200" ry="40" fill="#d68b5c" opacity=".14"/>
       <ellipse cx="500" cy="100" rx="150" ry="62" fill="#f4e9e2" opacity=".7"/></g>
     <path d="M300 520 C 380 542, 470 550, 565 535" fill="none" stroke="#1a0c10" stroke-width="14" stroke-linecap="round" opacity=".7"/>
     ${craters([[230, 560, 30], [700, 600, 22], [560, 800, 28], [420, 250, 20], [820, 400, 18], [340, 760, 16]], 'rgba(255,200,160,.25)')}`),
};
