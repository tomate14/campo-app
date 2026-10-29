# 92 - Ganadería: rediseño del dashboard ganadero (v3 ejecutivo)

## Descripción
Aplicar el rediseño ejecutivo v3 al **Dashboard Ganadero** (`/reportes/ganaderia`,
`reportes-ganaderia-page`) siguiendo el mockup y la guía de estilos provistos
(`Rediseño de pantallas ganadería.zip` → `entrega-dashboards/02-dashboard-ganadero-completo.png`,
`Dashboard Ganadero.dc.html` y `estilos.md`). Unifica el lenguaje visual con el dashboard
financiero (feature 91): mismos tokens, KPI cards toneadas, rankings, tablas y charts
ApexCharts con tooltips premium.

## Decisiones (tomadas con el usuario)
- **Secciones nuevas con datos reales (backend + front).** El mockup agrega dos secciones
  que hoy el backend no expone:
  - **Evolución de peso del rodeo** (gráfico de líneas, últimos 12 meses: peso promedio del
    rodeo + ganancia diaria) → se calcula desde `PesajeAnimal`.
  - **Próximos partos** (tabla: animal, fecha estimada, días restantes, riesgo) → se calcula
    desde `ControlPrenez` (preñeces activas con `fechaEstimadaParto` próxima y
    `nivelRiesgoParto`).
  El servicio `ReporteGanaderoDashboardServiceImpl` ya carga pesajes y controles de preñez,
  por lo que se amplía el response/DTO sin nuevos repositorios.
- **Charts con ApexCharts** (consistente con feature 91 y la guía v3): líneas (evolución de
  peso), barras (partos estimados por mes) y donut (genealogía y trazabilidad), con
  `animations:false` y tooltips premium compartidos (`shared/apex-tooltip`).
- Solo web. Se preserva la lógica y los datos existentes del dashboard; se amplía el contrato
  únicamente con las dos series nuevas.

## Alcance (secciones del mockup)
- Header: eyebrow "GANADERÍA", título "Dashboard Ganadero" (2ª palabra en verde con glow),
  subtítulo, **filtro global** Desde/Hasta + botón "Aplicar filtros" (outline verde).
- **12 KPI cards** toneadas (Animales activos, Peso promedio, Ganancia diaria, Preñadas
  activas, Partos próximos, Vacunas próximas, Alertas sanitarias, Ocupación potreros, Dietas
  activas, Sin ubicación, …): ícono en contenedor con tono + glow, label MAYÚSCULAS, valor
  grande, contexto coloreado por estado.
- **Evolución de peso del rodeo** (líneas ApexCharts, 12 meses, peso promedio + ganancia).
- **Alertas operativas** (ítems con punto anillado + glow, módulo/entidad/fecha, chevron).
- **Partos estimados por mes** (barras ApexCharts).
- **Genealogía y trazabilidad** (donut ApexCharts con % central + leyenda de faltantes).
- **Distribución del rodeo**, **Ocupación de potreros**, **Estado reproductivo**,
  **Diagnósticos por severidad** (rankings con barra glow + % del total).
- **Calendario sanitario** (tabla con chips por estado), **Próximos partos** (tabla con chip
  de riesgo), **Consumo de alimento por potrero** (tabla).
- **Tratamientos activos** (stat cards), **Conversión alimenticia** (big stat), **Dietas
  activas** (lista).

## Requisitos técnicos
- Angular standalone + signals; preservar `GanaderiaService`/`getGanaderoDashboard` y el shape
  existente de `GanaderoDashboard`, ampliándolo con `evolucionPeso` y `proximosPartos`.
- Backend: ampliar `ReporteGanaderoDashboardResponse` + `ReporteGanaderoDashboardServiceImpl`
  (evolución de peso 12 meses desde pesajes; próximos partos desde controles de preñez).
  Sin nuevos repositorios ni migraciones.
- Aplicar tokens de `estilos.md`; charts ApexCharts (`animations:false`) + tooltips premium.
  Un único filtro global de período.
- Mantener lenguaje premium dark SaaS y regla de tooltips premium.

## Ampliación v4 — resto de pantallas de ganadería
Además del dashboard ganadero, se aplica el rediseño ejecutivo v4 (guía `export-v4/estilos.md`)
a **todas las pantallas de ganadería** salvo **Potreros** y el **Dashboard ganadero** (ya hecho):
- **Trazabilidad animal** (`/ganaderia/trazabilidad`): tabs Animales/Movimientos/Genealogía.
- **Sanidad y vacunación** (`/ganaderia/sanidad`): Alertas/Vacunaciones/Tratamientos/Diagnósticos/Vacunas.
- **Reproducción y genealogía** (`/ganaderia/reproduccion`): Próximos partos/Servicios/Preñez/
  Partos/Índices/Genealogía/Recomendaciones.
- **Alimentación y peso** (`/ganaderia/alimentacion`): Dietas/Suministros/Pesajes/Alertas.

Reglas v4 aplicadas (solo UI, se preserva la lógica):
- Registros **siempre en tabla** (se eliminó el toggle Tabla/Tarjetas y la vista de tarjetas
  `app-entity-card`).
- **Header** con última palabra en verde + glow (44px/900, eyebrow 12px .2em) vía `app-page-header`.
- **KPI cards** verticales con ícono/tono/glow vía `app-kpi-card` (actualizado a v4).
- **Fichas/detalle**: lista clave–valor en 2 columnas (filas con borde inferior), sin cajitas.
- Banners de alertas con glow ámbar; chips radio 8px; acción principal verde outline,
  secundarias fondo `rgba(8,18,37,.82)` + borde azul; tablas premium (header `rgba(8,18,37,.7)`,
  filas border-top `rgba(110,168,255,.1)`, hover verde, avatar 26px).
- Componentes compartidos `app-page-header` y `app-kpi-card` (usados solo por ganadería)
  actualizados a v4; cruzamientos en tabla (Vaca·Toro·Score·Compatibilidad·Parentesco·Modelo·Motivo).

## Fuera de alcance
- **Potreros** (sin mockup) y **Dashboard ganadero** (ya hecho en esta misma feature).
- Otros dashboards/módulos. Mobile. Lógica/contratos de negocio (salvo el agregado del dashboard).

## Dependencias
- Feature 86 (refactor UI ganadería), 91 (patrón ApexCharts + rediseño financiero).

## Estado
Pendiente.
