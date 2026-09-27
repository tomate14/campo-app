/**
 * Paths internos de iconos SVG (viewBox 0 0 24 24, stroke=currentColor) usados en la
 * pantalla de alimentacion y peso. Se pasan a app-svg-icon / app-stat-tabs / app-kpi-card /
 * app-info-tile / app-premium-modal. Nunca usar letras o siglas como icono: siempre SVG real.
 */
export const ALIMENTACION_ICONS = {
  // Dietas / nutricion (planta-forraje)
  diet: '<path d="M4 19c4-8 12-8 16 0" /><path d="M8 10c2-5 6-5 8 0" /><path d="M12 3v18" />',
  // Suministros (matraz / alimento)
  flask: '<path d="M8 3h8" /><path d="M9 3v6l-4 7a4 4 0 0 0 3.5 6h7a4 4 0 0 0 3.5-6l-4-7V3" />',
  // Pesajes (balanza)
  scale: '<path d="M12 3v18" /><path d="M6 6h12" /><path d="M7 6 3 13a3 3 0 0 0 6 0Z" /><path d="M17 6l-4 7a3 3 0 0 0 6 0Z" /><path d="M8 21h8" />',
  // Alertas (campana)
  bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" />',
  // KPIs
  dollar: '<path d="M12 2v20" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7H15a3.5 3.5 0 0 1 0 7H6" />',
  bars: '<path d="M4 18V6" /><path d="M8 18V10" /><path d="M12 18V4" /><path d="M16 18v-6" /><path d="M20 18V8" />',
  trending: '<path d="M3 17l6-6 4 4 8-8" /><path d="M17 7h4v4" />',
  cow: '<path d="M6 8c0-3 2-5 6-5s6 2 6 5v5c0 4-2.5 7-6 7s-6-3-6-7V8Z" /><path d="M9 9h.01M15 9h.01M9 14c1.8 1.2 4.2 1.2 6 0" />',
  // Acciones / cells
  plus: '<path d="M12 5v14M5 12h14" />',
  search: '<circle cx="11" cy="11" r="7" /><path d="m16 16 4 4" />',
  calendar: '<rect x="4" y="5" width="16" height="16" rx="2" /><path d="M8 3v4M16 3v4M4 10h16" />',
  user: '<circle cx="12" cy="8" r="3.5" /><path d="M5 20a7 7 0 0 1 14 0" />',
  pin: '<path d="M12 21s-6-5.3-6-10a6 6 0 0 1 12 0c0 4.7-6 10-6 10Z" /><circle cx="12" cy="11" r="2.4" />',
  weight: '<path d="M9 6a3 3 0 1 1 6 0" /><path d="M6 6h12l2.2 13a1 1 0 0 1-1 1.2H4.8a1 1 0 0 1-1-1.2L6 6Z" />',
  gauge: '<path d="M12 13a4 4 0 0 1 4-4" /><path d="M4 18a8 8 0 1 1 16 0" /><path d="m12 13-1.5-1.5" />',
  layers: '<path d="M12 3 2 8l10 5 10-5-10-5Z" /><path d="m2 13 10 5 10-5M2 18l10 5 10-5" />',
  alert: '<path d="m10 3-8 18h20L14 3z" /><path d="M12 9v4" /><path d="M12 17h.01" />',
  tag: '<path d="M3 12V6a3 3 0 0 1 3-3h6l9 9-9 9-9-9Z" /><circle cx="8" cy="8" r="1.5" />',
  note: '<path d="M8 3h8l3 3v13a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6Z" /><path d="M9 9h6M9 13h6M9 17h4" />',
  arrowRight: '<path d="M5 12h14" /><path d="m13 6 6 6-6 6" />',
  list: '<path d="M4 6h16M4 12h16M4 18h16" />',
  grid: '<rect x="4" y="4" width="7" height="7" rx="1.5" /><rect x="13" y="4" width="7" height="7" rx="1.5" /><rect x="4" y="13" width="7" height="7" rx="1.5" /><rect x="13" y="13" width="7" height="7" rx="1.5" />',
} as const;
