
import { store, BADGE_TITLE } from '../core/store.js';
import { el, on, qs } from '../core/dom.js';

const fmtDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : '';

let uid = 0;
let hintN = 0;

/**
 * Badge illustration.
 * Explicit SVG dimensions and responsive sizing prevent overflow
 * in the achievement panel and certificate.
 */
export function badgeSvg({
  display = 'Georgia, serif',
  ui = 'system-ui, sans-serif'
} = {}) {
  const n = `b${(uid += 1)}`;

  const stars = [
    [48, 58, 1.2],
    [152, 52, 1],
    [62, 138, 1],
    [144, 140, 1.3],
    [100, 40, 0.9],
    [36, 104, 0.9],
    [164, 100, 0.9]
  ]
    .map(
      ([x, y, r]) =>
        `<circle cx="${x}" cy="${y}" r="${r}" fill="#e8eef9" opacity=".75"/>`
    )
    .join('');

  return `<svg
    xmlns="http://www.w3.org/2000/svg"
    width="200"
    height="200"
    viewBox="0 0 200 200"
    preserveAspectRatio="xMidYMid meet"
    style="display:block;width:100%;height:auto;max-width:100%;"
    role="img"
    aria-label="Achievement badge: Junior Space Archaeologist. A small rover with a glowing echo inside a ringed medal."
  >
    <defs>
      <radialGradient id="${n}bg" cx="50%" cy="40%" r="70%">
        <stop offset="0" stop-color="#16295a"/>
        <stop offset=".7" stop-color="#0a1226"/>
        <stop offset="1" stop-color="#04060c"/>
      </radialGradient>

      <linearGradient id="${n}ring" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#ffd28a"/>
        <stop offset=".5" stop-color="#ffb454"/>
        <stop offset="1" stop-color="#b8661f"/>
      </linearGradient>

      <radialGradient id="${n}glow">
        <stop offset="0" stop-color="#5ad8ff" stop-opacity=".4"/>
        <stop offset="1" stop-color="#5ad8ff" stop-opacity="0"/>
      </radialGradient>

      <path id="${n}top" d="M 24,100 A 76,76 0 0 1 176,100"/>
      <path id="${n}bot" d="M 32,100 A 68,68 0 0 0 168,100"/>

      <g
        id="${n}rover"
        fill="none"
        stroke="currentColor"
        stroke-width="2.2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M-20 4h40l-5-11h-30z"/>
        <path d="M-6 -7v-11h9"/>
        <path d="M10 -7l7 -7"/>
        <circle cx="19" cy="-15" r="2"/>
        <circle cx="-13" cy="10" r="5"/>
        <circle cx="0" cy="10" r="5"/>
        <circle cx="13" cy="10" r="5"/>
      </g>
    </defs>

    <circle cx="100" cy="100" r="97" fill="url(#${n}ring)"/>
    <circle cx="100" cy="100" r="91" fill="url(#${n}bg)"/>
    <circle cx="100" cy="100" r="62" fill="url(#${n}glow)"/>

    <circle
      cx="100"
      cy="100"
      r="84"
      fill="none"
      stroke="#5ad8ff"
      stroke-opacity=".35"
      stroke-dasharray="1.5 4"
    />

    <ellipse
      cx="100"
      cy="104"
      rx="80"
      ry="24"
      fill="none"
      stroke="#5ad8ff"
      stroke-opacity=".3"
      transform="rotate(-22 100 104)"
    />

    <circle cx="31" cy="128" r="3.2" fill="#ffb454"/>

    ${stars}

    <path
      d="M44 134 Q100 120 156 134"
      fill="none"
      stroke="#5ad8ff"
      stroke-opacity=".5"
      stroke-width="1.4"
    />

    <use
      href="#${n}rover"
      color="#5ad8ff"
      opacity=".4"
      transform="translate(95 106)"
    />

    <use
      href="#${n}rover"
      color="#ffb454"
      transform="translate(100 110)"
    />

    <text
      font-family="${display}"
      font-size="10.5"
      font-weight="700"
      letter-spacing="1.7"
      fill="#ffd28a"
    >
      <textPath
        href="#${n}top"
        startOffset="50%"
        text-anchor="middle"
      >JUNIOR SPACE ARCHAEOLOGIST</textPath>
    </text>

    <text
      font-family="${ui}"
      font-size="7.5"
      letter-spacing="3"
      fill="#8fd8ee"
    >
      <textPath
        href="#${n}bot"
        startOffset="50%"
        text-anchor="middle"
      >GHOST MACHINES</textPath>
    </text>
  </svg>`;
}


/**
 * Draws a certificate using Canvas and downloads it as PNG.
 * The certificate remains within a fixed 1600 x 1000 canvas.
 * Text automatically fits the available horizontal space.
 */
export async function downloadCertificate(info) {
  const W = 1600;
  const H = 1000;

  const display =
    '"Cormorant Garamond", Georgia, "Times New Roman", serif';

  const ui =
    '"IBM Plex Sans", system-ui, "Segoe UI", sans-serif';

  const mono =
    '"IBM Plex Mono", ui-monospace, Menlo, Consolas, monospace';

  try {
    await document.fonts?.ready;
  } catch {
    // Use available system fonts.
  }

  const canvas = el('canvas');
  canvas.width = W;
  canvas.height = H;

  const c = canvas.getContext('2d');

  if (!c) {
    throw new Error('Canvas is not supported by this browser.');
  }

  // Background
  const bg = c.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#04060c');
  bg.addColorStop(0.6, '#0a1226');
  bg.addColorStop(1, '#12204a');

  c.fillStyle = bg;
  c.fillRect(0, 0, W, H);

  // Deterministic starfield
  let seed = 1969;

  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };

  for (let i = 0; i < 170; i += 1) {
    c.globalAlpha = 0.25 + rnd() * 0.6;
    c.fillStyle = rnd() > 0.85 ? '#5ad8ff' : '#e8eef9';

    c.beginPath();
    c.arc(
      rnd() * W,
      rnd() * H,
      0.6 + rnd() * 1.4,
      0,
      Math.PI * 2
    );

    c.fill();
  }

  c.globalAlpha = 1;

  // Certificate borders
  c.lineWidth = 2;
  c.strokeStyle = 'rgba(90,216,255,.55)';
  c.strokeRect(40, 40, W - 80, H - 80);

  c.strokeStyle = 'rgba(255,180,84,.4)';
  c.lineWidth = 1;
  c.strokeRect(58, 58, W - 116, H - 116);


  // Badge artwork
  const img = new Image();

  const badgeLoaded = await new Promise((resolve) => {
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);

    img.src =
      `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
        badgeSvg({
          display: 'Georgia, serif',
          ui: 'Arial, sans-serif'
        })
      )}`;
  });

  if (badgeLoaded) {
    // Fixed square dimensions prevent badge distortion.
    c.drawImage(img, 130, 280, 440, 440);
  }


  // Certificate text area
  const x = 680;
  const maxTextWidth = W - x - 100;

  c.textBaseline = 'alphabetic';
  c.textAlign = 'left';

  /**
   * Draw text while reducing its font size when necessary.
   * fillText's maxWidth is an additional safety limit.
   */
  const text = (
    value,
    y,
    font,
    color,
    spacing = '0px'
  ) => {
    const label = String(value ?? '');
    const match = font.match(/(\d+(?:\.\d+)?)px/);

    let fittedFont = font;

    if (match) {
      let size = Number(match[1]);

      while (size > 14) {
        fittedFont = font.replace(
          match[0],
          `${size}px`
        );

        c.font = fittedFont;

        if ('letterSpacing' in c) {
          c.letterSpacing = spacing;
        }

        if (c.measureText(label).width <= maxTextWidth) {
          break;
        }

        size -= 1;
      }
    }

    c.font = fittedFont;
    c.fillStyle = color;

    if ('letterSpacing' in c) {
      c.letterSpacing = spacing;
    }

    c.fillText(label, x, y, maxTextWidth);

    if ('letterSpacing' in c) {
      c.letterSpacing = '0px';
    }
  };


  /**
   * Wrap longer paragraphs into multiple lines.
   */
  const wrappedText = (
    value,
    y,
    font,
    color,
    lineHeight = 38
  ) => {
    const words = String(value ?? '').split(/\s+/);

    const lines = [];
    let line = '';

    c.font = font;
    c.fillStyle = color;
    c.textAlign = 'left';

    for (const word of words) {
      const candidate = line
        ? `${line} ${word}`
        : word;

      if (
        c.measureText(candidate).width > maxTextWidth &&
        line
      ) {
        lines.push(line);
        line = word;
      } else {
        line = candidate;
      }
    }

    if (line) {
      lines.push(line);
    }

    lines.forEach((item, index) => {
      c.fillText(
        item,
        x,
        y + index * lineHeight,
        maxTextWidth
      );
    });

    return lines.length;
  };


  // Main heading
  text(
    'GHOST MACHINES',
    210,
    `500 26px ${mono}`,
    '#8fd8ee',
    '6px'
  );

  text(
    'CERTIFICATE OF ACHIEVEMENT',
    262,
    `400 22px ${mono}`,
    '#8a9bb8',
    '4px'
  );

  text(
    'JUNIOR SPACE',
    400,
    `600 112px ${display}`,
    '#ffd28a',
    '6px'
  );

  text(
    'ARCHAEOLOGIST',
    515,
    `600 112px ${display}`,
    '#ffd28a',
    '6px'
  );


  // Recipient information
  let y = 600;

  if (info.name?.trim()) {
    text(
      `Awarded to ${info.name.trim()}`,
      y,
      `italic 400 54px ${display}`,
      '#e8eef9'
    );

    y += 80;
  }

  text(
    `Best score: ${info.correct} / ${info.total} (${info.percent}%)`,
    y + 10,
    `500 34px ${ui}`,
    '#e8eef9'
  );

  text(
    `Completed: ${fmtDate(info.earnedAt)}`,
    y + 62,
    `400 30px ${ui}`,
    '#c3cee2'
  );


  // Footer with automatic wrapping
  const footerLines = wrappedText(
    'For exploring the eight machines NASA left behind on the Moon and Mars.',
    820,
    `italic 400 28px ${display}`,
    '#8a9bb8',
    38
  );

  // Position the disclaimer below the footer.
  const disclaimerY = Math.min(
    H - 65,
    Math.max(900, 820 + footerLines * 38 + 20)
  );

  text(
    'Unofficial educational project. Not affiliated with or endorsed by NASA.',
    disclaimerY,
    `400 20px ${mono}`,
    '#8a9bb8'
  );


  // Export certificate
  const blob = await new Promise((resolve) => {
    canvas.toBlob(resolve, 'image/png');
  });

  const downloadUrl = blob
    ? URL.createObjectURL(blob)
    : canvas.toDataURL('image/png');

  const a = el('a', {
    download: 'junior-space-archaeologist-certificate.png',
    href: downloadUrl
  });

  document.body.append(a);
  a.click();
  a.remove();

  if (blob) {
    setTimeout(() => {
      URL.revokeObjectURL(downloadUrl);
    }, 4000);
  }
}


/**
 * Achievement panel:
 * Badge, title, best score, date, optional name and certificate download.
 */
export function createBadgePanel() {
  const info = store.getBadgeInfo();

  if (!info) {
    return {
      element: el('p', {
        class: 'badge-note',
        text: 'Score 70% or more on the quiz to earn this badge.'
      }),
      destroy() {}
    };
  }

  const hintId = `badge-name-hint-${(hintN += 1)}`;

  // Name input
  const input = el('input', {
    type: 'text',
    maxlength: '40',
    autocomplete: 'off',
    value: info.name || '',
    'aria-describedby': hintId
  });

  input.style.maxWidth = '100%';
  input.style.boxSizing = 'border-box';

  // Responsive badge illustration
  const art = el('div', {
    class: 'badge-art'
  });

  art.style.width = 'min(100%, 220px)';
  art.style.maxWidth = '100%';
  art.style.boxSizing = 'border-box';
  art.style.marginInline = 'auto';

  art.innerHTML = badgeSvg({
    display: "'Cormorant Garamond', Georgia, serif",
    ui: "'IBM Plex Sans', system-ui, sans-serif"
  });

  const svg = art.querySelector('svg');

  if (svg) {
    svg.style.display = 'block';
    svg.style.width = '100%';
    svg.style.maxWidth = '100%';
    svg.style.height = 'auto';
  }


  // Save recipient name
  const save = () => {
    const name = input.value.trim();

    if (name !== store.playerName) {
      store.setPlayerName(name);
    }
  };

  on(input, 'change', save);


  // Certificate download button
  const download = el('button', {
    class: 'btn btn--amber',
    type: 'button',
    text: 'Download certificate (PNG)'
  });

  download.style.maxWidth = '100%';
  download.style.whiteSpace = 'normal';

  const note = el('p', {
    class: 'badge-note',
    role: 'status',
    'aria-live': 'polite',
    text: 'Saved on this device only. No account needed.'
  });

  on(download, 'click', async () => {
    save();

    download.disabled = true;
    note.textContent = 'Making your certificate…';

    try {
      await downloadCertificate(store.getBadgeInfo());

      note.textContent = 'Certificate downloaded.';
    } catch (error) {
      console.error('Certificate generation failed:', error);

      note.textContent =
        'Sorry, the certificate could not be created in this browser.';
    }

    download.disabled = false;
  });


  // Information panel
  const infoPanel = el(
    'div',
    { class: 'badge-info' },

    el('p', {
      class: 'panel__eyebrow',
      text: 'Achievement'
    }),

    el('h3', {
      class: 'badge-title',
      text: BADGE_TITLE.toUpperCase()
    }),

    el(
      'dl',
      { class: 'panel__facts' },

      el(
        'div',
        {},
        el('dt', { text: 'Best score' }),
        el('dd', {
          text: `${info.correct} / ${info.total} (${info.percent}%)`
        })
      ),

      el(
        'div',
        {},
        el('dt', { text: 'Date completed' }),
        el('dd', { text: fmtDate(info.earnedAt) })
      )
    ),

    el(
      'label',
      { class: 'badge-name' },

      el('span', {
        text: 'Name on certificate (optional)'
      }),

      input
    ),

    el('p', {
      id: hintId,
      class: 'sr-only',
      text: 'Optional. Leave blank for a certificate without a name.'
    }),

    download,
    note
  );

  infoPanel.style.minWidth = '0';
  infoPanel.style.maxWidth = '100%';
  infoPanel.style.boxSizing = 'border-box';


  // Main panel
  const element = el(
    'div',
    { class: 'badge-panel' },
    art,
    infoPanel
  );

  element.style.minWidth = '0';
  element.style.width = '100%';
  element.style.maxWidth = '100%';
  element.style.boxSizing = 'border-box';

  return {
    element,
    destroy() {}
  };
}


/**
 * Badge screen (#/badge).
 * Only reachable once the badge is earned.
 */
export function initBadgeScreen(router) {
  const root = qs('[data-badge-root]');

  if (!root) {
    console.error('Badge screen root [data-badge-root] was not found.');
    return;
  }

  router.addEventListener('route', (e) => {
    if (e.detail.screen !== 'badge') {
      return;
    }

    const panel = createBadgePanel();

    root.replaceChildren(
      el(
        'div',
        { class: 'glass badge-card' },
        panel.element
      ),

      el(
        'p',
        { class: 'quiz__links' },

        el('a', {
          class: 'btn',
          href: '#/quiz',
          text: 'Retake the quiz'
        }),

        el('a', {
          class: 'btn btn--amber',
          href: '#/moon',
          text: 'Back to exploring'
        })
      )
    );
  });
}
