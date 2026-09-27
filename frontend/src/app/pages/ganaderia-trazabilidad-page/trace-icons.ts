/**
 * Paths internos de iconos SVG (viewBox 0 0 24 24, stroke=currentColor) usados en la
 * pantalla de trazabilidad. Se pasan a app-svg-icon / stat-tabs / info-tile / etc.
 * Nunca usar letras o siglas como icono: siempre SVG real.
 */
export const TRACE_ICONS = {
  cow: '<path d="M6 8c0-3 2-5 6-5s6 2 6 5v5c0 4-2.5 7-6 7s-6-3-6-7V8Z" /><path d="M9 9h.01M15 9h.01M9 14c1.8 1.2 4.2 1.2 6 0" />',
  move: '<path d="M5 12h14" /><path d="m13 6 6 6-6 6" /><path d="M5 6v12" />',
  shield: '<path d="M12 3 4 7v6c0 4 3.2 7 8 8 4.8-1 8-4 8-8V7l-8-4Z" /><path d="M12 8v5m0 3h.01" />',
  rfid: '<path d="M6 8a8 8 0 0 0 0 8" /><path d="M18 8a8 8 0 0 1 0 8" /><path d="M9 10a4 4 0 0 0 0 4" /><path d="M15 10a4 4 0 0 1 0 4" /><circle cx="12" cy="12" r="1" />',
  tree: '<circle cx="12" cy="5" r="2.4" /><circle cx="6" cy="19" r="2.4" /><circle cx="18" cy="19" r="2.4" /><path d="M12 7.4v3.6M6 16.6V14a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2.6" />',
  download: '<path d="M12 3v12" /><path d="m8 11 4 4 4-4" /><path d="M5 21h14" />',
  plus: '<path d="M12 5v14M5 12h14" />',
  search: '<circle cx="11" cy="11" r="7" /><path d="m16 16 4 4" />',
  eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" />',
  stethoscope: '<path d="M6 3v5a4 4 0 0 0 8 0V3" /><path d="M10 15a5 5 0 0 0 10 0v-2" /><circle cx="20" cy="11" r="2" />',
  dots: '<path d="M12 6h.01M12 12h.01M12 18h.01" />',
  weight: '<path d="M9 6a3 3 0 1 1 6 0" /><path d="M6 6h12l2.2 13a1 1 0 0 1-1 1.2H4.8a1 1 0 0 1-1-1.2L6 6Z" />',
  calendar: '<rect x="4" y="5" width="16" height="16" rx="2" /><path d="M8 3v4M16 3v4M4 10h16" />',
  clock: '<circle cx="12" cy="12" r="8" /><path d="M12 8v4l3 2" />',
  pin: '<path d="M12 21s-6-5.3-6-10a6 6 0 0 1 12 0c0 4.7-6 10-6 10Z" /><circle cx="12" cy="11" r="2.4" />',
  compass: '<circle cx="12" cy="12" r="9" /><path d="m15 9-2 5-4 1 2-5 4-1Z" />',
  female: '<circle cx="12" cy="9" r="5" /><path d="M12 14v7M9 18h6" />',
  male: '<circle cx="10" cy="14" r="5" /><path d="M15 9l5-5M15 5h4v4" />',
  dna: '<path d="M7 4c0 6 10 10 10 16M17 4c0 6-10 10-10 16" /><path d="M8.5 7h7M8.5 17h7M10 12h4" />',
  heart: '<path d="M12 20s-7-4.3-7-9.5A3.5 3.5 0 0 1 12 7a3.5 3.5 0 0 1 7 3.5C19 15.7 12 20 12 20Z" />',
  gauge: '<path d="M12 13a4 4 0 0 1 4-4" /><path d="M4 18a8 8 0 1 1 16 0" /><path d="m12 13-1.5-1.5" />',
  tag: '<path d="M3 12V6a3 3 0 0 1 3-3h6l9 9-9 9-9-9Z" /><circle cx="8" cy="8" r="1.5" />',
  user: '<circle cx="12" cy="8" r="3.5" /><path d="M5 20a7 7 0 0 1 14 0" />',
  note: '<path d="M8 3h8l3 3v13a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6Z" /><path d="M9 9h6M9 13h6M9 17h4" />',
  arrowUpRight: '<path d="M7 17 17 7" /><path d="M8 7h9v9" />',
} as const;
