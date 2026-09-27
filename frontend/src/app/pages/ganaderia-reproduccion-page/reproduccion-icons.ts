/**
 * Paths internos de iconos SVG (viewBox 0 0 24 24, stroke=currentColor) usados en la
 * pantalla de reproduccion y genealogia. Se pasan a app-svg-icon / stat-tabs /
 * info-tile / kpi-card / premium-modal. Nunca usar letras o siglas como icono.
 */
export const REPRO_ICONS = {
  refresh: '<path d="M20 12a8 8 0 1 1-2.3-5.7" /><path d="M20 4v6h-6" />',
  plus: '<path d="M12 5v14M5 12h14" />',
  male: '<circle cx="10" cy="14" r="5" /><path d="M15 9l5-5M15 5h4v4" />',
  female: '<circle cx="12" cy="9" r="5" /><path d="M12 14v7M9 18h6" />',
  vial: '<path d="M9 3h6v3H9z" /><path d="M8.5 6h7v12a3 3 0 0 1-6 0V6" /><path d="M9.5 12h5" />',
  calendar: '<rect x="4" y="5" width="16" height="16" rx="2" /><path d="M8 3v4M16 3v4M4 10h16" />',
  calendarCheck: '<rect x="4" y="5" width="16" height="16" rx="2" /><path d="M8 3v4M16 3v4M4 10h16" /><path d="m9 15 2 2 4-4" />',
  trending: '<path d="M4 16 9 9l4 4 7-9" /><path d="M14 4h6v6" />',
  target: '<circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4" /><path d="M12 3v3M12 18v3M3 12h3M18 12h3" />',
  bell: '<path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" /><path d="M10 20a2 2 0 0 0 4 0" />',
  search: '<circle cx="11" cy="11" r="7" /><path d="m16 16 4 4" />',
  tree: '<circle cx="12" cy="5" r="2.4" /><circle cx="6" cy="19" r="2.4" /><circle cx="18" cy="19" r="2.4" /><path d="M12 7.4v3.6M6 16.6V14a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2.6" />',
  arrowRight: '<path d="M5 12h14m-6-6 6 6-6 6" />',
  dna: '<path d="M7 4c0 6 10 10 10 16M17 4c0 6-10 10-10 16" /><path d="M8.5 7h7M8.5 17h7M10 12h4" />',
  shield: '<path d="M12 3 4 7v6c0 4 3.2 7 8 8 4.8-1 8-4 8-8V7l-8-4Z" /><path d="M12 8v5m0 3h.01" />',
  gauge: '<path d="M12 13a4 4 0 0 1 4-4" /><path d="M4 18a8 8 0 1 1 16 0" />',
  weight: '<path d="M9 6a3 3 0 1 1 6 0" /><path d="M6 6h12l2.2 13a1 1 0 0 1-1 1.2H4.8a1 1 0 0 1-1-1.2L6 6Z" />',
  cow: '<path d="M6 8c0-3 2-5 6-5s6 2 6 5v5c0 4-2.5 7-6 7s-6-3-6-7V8Z" /><path d="M9 9h.01M15 9h.01M9 14c1.8 1.2 4.2 1.2 6 0" />',
  info: '<circle cx="12" cy="12" r="9" /><path d="M12 10v6m0-9h.01" />',
  check: '<path d="M5 12l4 4 10-10" />',
  clock: '<circle cx="12" cy="12" r="8" /><path d="M12 8v4l3 2" />',
  pin: '<path d="M12 21s-6-5.3-6-10a6 6 0 0 1 12 0c0 4.7-6 10-6 10Z" /><circle cx="12" cy="11" r="2.4" />',
  heart: '<path d="M12 20s-7-4.3-7-9.5A3.5 3.5 0 0 1 12 7a3.5 3.5 0 0 1 7 3.5C19 15.7 12 20 12 20Z" />',
  trophy: '<path d="M8 4h8v4a4 4 0 0 1-8 0V4Z" /><path d="M8 6H5v1a3 3 0 0 0 3 3M16 6h3v1a3 3 0 0 1-3 3M9 20h6M12 14v6" />',
  link: '<path d="M9 12a3 3 0 0 0 3 3h1.5a3 3 0 0 0 0-6" /><path d="M15 12a3 3 0 0 0-3-3h-1.5a3 3 0 0 0 0 6" />',
  user: '<circle cx="12" cy="8" r="3.5" /><path d="M5 20a7 7 0 0 1 14 0" />',
  note: '<path d="M8 3h8l3 3v13a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6Z" /><path d="M9 9h6M9 13h6M9 17h4" />',
} as const;
