# AgroERP Design System

## Objetivo

Diseñar una plataforma agroindustrial moderna, responsive y orientada a operación de campo.

La UI debe priorizar:
- claridad,
- rapidez,
- legibilidad outdoor,
- experiencia offline-first,
- densidad de información controlada.

---

# Estilo Visual

## Filosofía

Industrial Modern SaaS.

Inspiraciones:
- Linear
- Vercel
- Notion
- John Deere Operations Center
- Climate FieldView

---

# Layout

## Estructura principal

```txt
┌─────────────────────────────────────┐
│ Topbar                              │
├──────────────┬──────────────────────┤
│ Sidebar      │ Main Content         │
│ collapsable  │                      │
└──────────────┴──────────────────────┘
```

---

# Sidebar

- Izquierda fija.
- Colapsable.
- Desktop expandido.
- Mobile tipo drawer.
- Navegación por dominios:
  - Agricultura
  - Ganadería
  - Logística
  - Finanzas
  - Reportes

---

# Responsive

## Breakpoints

- Mobile: 0px - 767px
- Tablet: 768px - 1279px
- Desktop: 1280px+

---

# Paleta de Colores

## Base

### Background
```css
#0F172A
```

### Sidebar
```css
#0B1220
```

### Cards
```css
#1E293B
```

### Borders
```css
#334155
```

---

# Textos

### Primary
```css
#F8FAFC
```

### Secondary
```css
#94A3B8
```

---

# Colores Funcionales

## Agricultura
```css
#4D7C0F
```

## Ganadería
```css
#B45309
```

## GPS / Telemetría
```css
#0891B2
```

## Success
```css
#16A34A
```

## Error
```css
#DC2626
```

---

# Typography

## Fuente principal

```css
Inter
```

---

# Componentes

## Cards

- Oscuras.
- Bordes suaves.
- Mucho espacio visual.
- Métricas claras.

---

## Tablas

- Dense mode.
- Sticky headers.
- Filtros.
- Sorting.
- Responsive scroll.

---

## Inputs

- Altura mínima 44px.
- Validaciones claras.
- Focus visible.

---

## Botones

Tipos:
- Primary
- Secondary
- Danger
- Ghost

---

# Mapas

Los mapas son componentes centrales del sistema.

Deben soportar:
- lotes,
- geocercas,
- capas,
- heatmaps,
- GPS.

---

# Mobile UX

Priorizar:
- rapidez,
- pocos clicks,
- formularios simples,
- operación offline,
- botones grandes.

---

# Librerías recomendadas

## Frontend

- Angular 18
- Angular Material
- TailwindCSS

## Stack gratuito recomendado

### UI principal

- shadcn/ui
- Magic UI
- Aceternity UI

### Animaciones

- Framer Motion

### Iconos

- Lucide Icons

### Charts

- Recharts

## Tablas
- AG Grid

## Mapas
- Mapbox
- Leaflet

## Charts
- Apache ECharts

---

# Reglas importantes

## Evitar

- Glassmorphism excesivo
- Colores saturados
- Verde agro clásico
- Animaciones innecesarias

---

# Objetivo final

Construir un ERP agroindustrial:
- moderno,
- robusto,
- escalable,
- geoespacial,
- preparado para IA e IoT.
