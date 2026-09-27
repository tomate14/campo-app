/**
 * Iconos SVG (markup interno, viewBox 0 0 24 24, stroke=currentColor) usados solo por
 * el dashboard ganadero. Se consumen via <app-svg-icon [path]="...">. Nunca usar
 * letras/siglas como icono: todos son trazos "line" del lenguaje premium dark SaaS.
 */
export const GANADERO_ICONS = {
  // Header
  header:
    '<path d="M5 8c0-3 3-5 7-5s7 2 7 5c0 4-3 7-7 7S5 12 5 8Z" /><path d="M8 5 5 3" /><path d="M16 5l3-2" /><path d="M10 15v4h4v-4" />',
  filtros: '<path d="M4 6h16" /><path d="M7 12h10" /><path d="M10 18h4" />',
  fecha: '<path d="M6 3v4" /><path d="M18 3v4" /><path d="M4 9h16" /><path d="M5 5h14v16H5z" />',
  comparar: '<path d="M4 18h16" /><path d="M7 15v-5" /><path d="M12 15V6" /><path d="M17 15v-3" />',
  arrow: '<path d="M5 12h13" /><path d="m12 6 6 6-6 6" />',
  clock: '<circle cx="12" cy="12" r="9" /><path d="M12 8v4l3 2" />',

  // KPIs (por codigo)
  ANIMALES_ACTIVOS:
    '<path d="M5 8c0-3 3-5 7-5s7 2 7 5c0 4-3 7-7 7S5 12 5 8Z" /><path d="M8 5 5 3" /><path d="M16 5l3-2" /><path d="M10 15v4h4v-4" />',
  PESO_PROMEDIO: '<path d="M6 20h12l-2-10H8L6 20Z" /><path d="M9 10a3 3 0 0 1 6 0" /><path d="M12 14v2" />',
  GANANCIA_DIARIA: '<path d="M4 18h16" /><path d="M6 15l4-4 3 2 5-7" /><path d="M18 6v5h-5" />',
  PRENADAS_ACTIVAS: '<path d="M12 21s7-4 7-11V5l-7-3-7 3v5c0 7 7 11 7 11Z" /><path d="M9 12h6" /><path d="M12 9v6" />',
  PARTOS_PROXIMOS: '<path d="M8 2v4" /><path d="M16 2v4" /><path d="M3 10h18" /><path d="M5 5h14v16H5z" /><path d="M8 15h8" />',
  VACUNAS_PROXIMAS: '<path d="M4 20 15 9" /><path d="m12 6 6 6" /><path d="M14 4l6 6" /><path d="m7 17 3 3" />',
  ALERTAS_SANITARIAS: '<path d="M12 3 2 20h20L12 3Z" /><path d="M12 9v5" /><path d="M12 17h.01" />',
  OCUPACION_POTREROS: '<path d="M4 7l8-3 8 3v10l-8 3-8-3V7Z" /><path d="M12 4v16" /><path d="M4 7l8 3 8-3" />',
  DIETAS_ACTIVAS: '<path d="M4 19c6-9 12-9 16 0" /><path d="M8 13c2-4 6-4 8 0" /><path d="M12 5v15" />',
  SIN_UBICACION: '<path d="M12 21s7-5 7-11a7 7 0 0 0-14 0c0 6 7 11 7 11Z" /><path d="M12 10h.01" />',

  // Cabeceras de secciones
  rodeo: '<path d="M5 8c0-3 3-5 7-5s7 2 7 5c0 4-3 7-7 7S5 12 5 8Z" /><path d="M10 15v4h4v-4" />',
  potreros: '<path d="M4 7l8-3 8 3v10l-8 3-8-3V7Z" /><path d="M12 4v16" /><path d="M4 7l8 3 8-3" />',
  sanidad: '<path d="M8 2v4" /><path d="M16 2v4" /><path d="M4 9h16" /><path d="M5 5h14v16H5z" /><path d="M12 12v4" /><path d="M10 14h4" />',
  diagnostico: '<path d="M8 3h8l1 3h2v15H5V6h2l1-3Z" /><path d="M9 11h6" /><path d="M9 15h4" />',
  tratamiento: '<path d="M19 14c-2 4-5 6-7 6s-5-2-7-6a7 7 0 0 1 14 0Z" /><path d="M12 8V4" /><path d="M10 6h4" />',
  reproduccion: '<path d="M12 21s7-4 7-11V5l-7-3-7 3v5c0 7 7 11 7 11Z" /><path d="M9 12h6" /><path d="M12 9v6" />',
  partos: '<path d="M6 3v4" /><path d="M18 3v4" /><path d="M4 9h16" /><path d="M5 5h14v16H5z" /><path d="M9 14h6" />',
  genealogia:
    '<circle cx="12" cy="5" r="2.4" /><circle cx="6" cy="18" r="2.4" /><circle cx="18" cy="18" r="2.4" /><path d="M12 7.4v4.2" /><path d="M12 11.6c-3 0-6 1.6-6 4" /><path d="M12 11.6c3 0 6 1.6 6 4" />',
  consumo: '<path d="M4 19c6-9 12-9 16 0" /><path d="M8 13c2-4 6-4 8 0" /><path d="M12 5v15" />',
  conversion: '<path d="M4 8h12" /><path d="m12 4 4 4-4 4" /><path d="M20 16H8" /><path d="m12 12-4 4 4 4" />',
  dieta: '<path d="M4 19c6-9 12-9 16 0" /><path d="M8 13c2-4 6-4 8 0" /><path d="M12 5v15" />',
  alertas: '<path d="M12 3 2 20h20L12 3Z" /><path d="M12 9v5" /><path d="M12 17h.01" />',

  // Tratamientos activos (filas)
  enTratamiento:
    '<path d="M5 8c0-3 3-5 7-5s7 2 7 5c0 4-3 7-7 7S5 12 5 8Z" /><path d="M10 15v4h4v-4" />',
  diagnosticosAbiertos: '<path d="M8 3h8l1 3h2v15H5V6h2l1-3Z" /><path d="M9 11h6" /><path d="M9 15h4" />',
  criticos: '<path d="M12 3 2 20h20L12 3Z" /><path d="M12 9v5" /><path d="M12 17h.01" />',

  // Alertas por modulo
  moduloReproduccion: '<path d="M12 21s7-4 7-11V5l-7-3-7 3v5c0 7 7 11 7 11Z" />',
  moduloSanidad: '<path d="M8 2v4" /><path d="M16 2v4" /><path d="M4 9h16" /><path d="M5 5h14v16H5z" />',
  moduloPotreros: '<path d="M4 7l8-3 8 3v10l-8 3-8-3V7Z" />',
  moduloAlimentacion: '<path d="M4 19c6-9 12-9 16 0" /><path d="M12 5v15" />',
  moduloTrazabilidad: '<circle cx="12" cy="12" r="8" /><path d="M12 8v4l3 2" />',
} as const;

export type GanaderoIconKey = keyof typeof GANADERO_ICONS;
