# 93 - Ganadería: rediseño v4 del cuerpo de las pantallas (trazabilidad/sanidad/reproducción/alimentación)

## Descripción
Aplicar el rediseño ejecutivo **v4** (guía `export-v4/estilos.md`, mismos mockups de
`Rediseño de pantallas ganadería.zip`) al **cuerpo** de las pantallas de ganadería, unificándolas
con el dashboard ganadero/financiero. Solo UI; se preserva toda la lógica, datos, endpoints y forms.

Alcance (pantallas), **excluyendo Potreros y el Dashboard ganadero** (ya en v4 por feature 92):
- **Trazabilidad animal** (`/ganaderia/trazabilidad`): tabs Animales / Movimientos / Genealogía.
- **Sanidad y vacunación** (`/ganaderia/sanidad`): Alertas / Vacunaciones / Tratamientos / Diagnósticos / Vacunas.
- **Reproducción y genealogía** (`/ganaderia/reproduccion`): Próximos partos / Servicios / Preñez /
  Partos / Índices / Genealogía / Recomendaciones.
- **Alimentación y peso** (`/ganaderia/alimentacion`): Dietas / Suministros / Pesajes / Alertas.

## Contexto / punto de partida
En la feature 92 ya se actualizaron a v4 los componentes compartidos `app-page-header` (título 44px
con última palabra verde + glow, sin ícono de título) y `app-kpi-card` (vertical con ícono/tono/glow),
que estas 4 pantallas ya consumen. Por lo tanto **su header y KPI cards ya están en v4**; lo que resta
es el **cuerpo** de cada pantalla.

## Cambios a realizar (reglas v4, solo UI)
- **Registros siempre en tabla**: eliminar el toggle **Tabla/Tarjetas** (`view-toggle`, `viewMode`,
  `setViewMode`), la vista `cards-grid` y los usos de `app-entity-card`; dejar solo las tablas premium.
- **Tablas premium**: contenedor borde radio 14px, header `rgba(8,18,37,.7)` 11px MAYÚSCULAS, filas
  con borde superior `rgba(110,168,255,.1)`, hover `rgba(159,232,112,.05)`, avatar/ícono 26px por fila.
- **Chips de estado** radio 8px con tono semántico (verde/azul/ámbar/rojo/violeta).
- **Fichas/detalle** (modales): lista clave–valor en **2 columnas** (filas con borde inferior
  `rgba(110,168,255,.1)`), **sin cajitas** (`app-info-tile`).
- **Banners de alerta**: panel con glow ámbar, chips radio 8px, botón "Ver …" outline verde.
- **Botones**: acción principal verde outline (`bg rgba(159,232,112,.06)`, borde `rgba(159,232,112,.32)`);
  secundarias fondo `rgba(8,18,37,.82)` + borde azul `.2`.
- **Recomendaciones (cruzamientos)** en reproducción: en tabla — Vaca · Toro · Score (barra) ·
  Compatibilidad (chip) · Parentesco · Modelo · Motivo · "Ver genealogía".

## Requisitos técnicos
- Angular standalone + signals; no tocar componentes compartidos (ya en v4) ni otras páginas,
  Potreros o el dashboard ganadero. Archivos por pantalla: `*-page.component.{ts,html,css}` (+ sus
  `*-icons.ts`). Referencias de patrón: `reportes-ganaderia-page` y `finanzas-reportes-page` (v4).
- Validar con `ng build` y verificación visual en la app real.

## Fuera de alcance
- Potreros, dashboard ganadero (feature 92), otros módulos, mobile, lógica de negocio.

## Dependencias
- Feature 92 (dashboard ganadero v4 + compartidos v4), 86 (refactor UI ganadería), 91 (patrón v4).

## Estado
Pendiente.
