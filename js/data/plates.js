// Small illustrated "archive plates" (line drawings, not photographs). Used when an event has no NASA photo.
const svg = (paths) => `<svg viewBox="0 0 64 64" width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
export const PLATES = {
  surveyor: svg('<path d="M32 14v10M26 14h12M22 26h20l-4 12H26zM26 38l-8 14M38 38l8 14M32 38v14M14 52h8M42 52h8M30 52h4"/><circle cx="32" cy="12" r="2"/>'),
  lm: svg('<path d="M22 18h20l6 8v14l-6 8H22l-6-8V26zM28 28h8v10h-8zM20 48l-8 10M44 48l8 10M32 48v10M8 58h10M46 58h10"/>'),
  alsep: svg('<rect x="20" y="32" width="16" height="12"/><path d="M28 32V22M21 22h14l-7-8zM36 38h12v6H36M12 48h40M24 44v4M32 44v4"/>'),
  rover: svg('<path d="M14 36h36l-4-10H20zM26 26V16h7M36 36h8"/><circle cx="20" cy="45" r="6"/><circle cx="44" cy="45" r="6"/>'),
  pathfinder: svg('<path d="M32 12l18 28H14zM32 12v28M14 40l10 10h16l10-10"/><rect x="27" y="44" width="10" height="6"/>'),
  mer: svg('<path d="M16 30h32l-3 8H19zM32 30V18M27 18h10"/><circle cx="20" cy="46" r="4"/><circle cx="32" cy="46" r="4"/><circle cx="44" cy="46" r="4"/><path d="M20 38v4M32 38v4M44 38v4"/>'),
  phoenix: svg('<path d="M24 34h16l4 8H20zM32 34V18l10-6M20 42l-6 10M44 42l6 10"/><circle cx="16" cy="28" r="8"/><circle cx="48" cy="28" r="8"/>'),
  parachute: svg('<path d="M12 28a20 18 0 0 1 40 0zM12 28l16 18M52 28L36 46M32 28v18M22 28l8 18M42 28l-8 18M26 46h12l-2 8H28z"/>'),
  heli: svg('<path d="M10 16h44M32 16v8M26 34l-4 14M38 34l4 14M18 48h8M38 48h8"/><rect x="26" y="24" width="12" height="10"/>'),
};
