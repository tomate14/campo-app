/**
 * Paths internos de iconos SVG (viewBox 0 0 24 24, stroke=currentColor) usados en la
 * pantalla de sanidad y vacunacion. Se pasan a app-svg-icon / app-stat-tabs /
 * app-kpi-card / app-info-tile / app-entity-card / app-premium-modal.
 * Nunca usar letras o siglas como icono: siempre SVG real.
 */
export const SANIDAD_ICONS = {
  bell: '<path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" />',
  shield: '<path d="M12 3 4 7v6c0 4 3.2 7 8 8 4.8-1 8-4 8-8V7l-8-4Z" /><path d="m9 12 2 2 4-4" />',
  vial: '<path d="M8 3h8" /><path d="M9 3v12a3 3 0 0 0 6 0V3" /><path d="M9 9h6" />',
  stethoscope: '<path d="M6 3v5a4 4 0 0 0 8 0V3" /><path d="M10 15a5 5 0 0 0 10 0v-2" /><circle cx="20" cy="11" r="2" />',
  syringe: '<path d="m18 2 4 4" /><path d="m15 5 4 4" /><path d="M4 20l1-4L15 6l3 3L8 19l-4 1Z" /><path d="m9 11 3 3" />',
  calendar: '<rect x="4" y="5" width="16" height="16" rx="2" /><path d="M8 3v4M16 3v4M4 10h16" />',
  dollar: '<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6" />',
  alert: '<path d="M12 3 2.5 20h19L12 3Z" /><path d="M12 10v4m0 3h.01" />',
  download: '<path d="M12 3v12" /><path d="m8 11 4 4 4-4" /><path d="M5 21h14" />',
  plus: '<path d="M12 5v14M5 12h14" />',
  search: '<circle cx="11" cy="11" r="7" /><path d="m16 16 4 4" />',
  arrowRight: '<path d="M5 12h14" /><path d="m13 6 6 6-6 6" />',
  table: '<path d="M4 6h16M4 12h16M4 18h16" />',
  grid: '<rect x="4" y="4" width="7" height="7" rx="1.5" /><rect x="13" y="4" width="7" height="7" rx="1.5" /><rect x="4" y="13" width="7" height="7" rx="1.5" /><rect x="13" y="13" width="7" height="7" rx="1.5" />',
  tag: '<path d="M3 12V6a3 3 0 0 1 3-3h6l9 9-9 9-9-9Z" /><circle cx="8" cy="8" r="1.5" />',
  user: '<circle cx="12" cy="8" r="3.5" /><path d="M5 20a7 7 0 0 1 14 0" />',
  clock: '<circle cx="12" cy="12" r="8" /><path d="M12 8v4l3 2" />',
  gauge: '<path d="M12 13a4 4 0 0 1 4-4" /><path d="M4 18a8 8 0 1 1 16 0" /><path d="m12 13-1.5-1.5" />',
  box: '<path d="M3 7l9-4 9 4v10l-9 4-9-4V7Z" /><path d="M3 7l9 4 9-4M12 11v10" />',
  droplet: '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z" />',
  animal: '<path d="M6 8c0-3 2-5 6-5s6 2 6 5v5c0 4-2.5 7-6 7s-6-3-6-7V8Z" /><path d="M9 9h.01M15 9h.01M9 14c1.8 1.2 4.2 1.2 6 0" />',
  note: '<path d="M8 3h8l3 3v13a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6Z" /><path d="M9 9h6M9 13h6M9 17h4" />',
  activity: '<path d="M3 12h4l2 6 4-14 2 8h6" />',
} as const;
