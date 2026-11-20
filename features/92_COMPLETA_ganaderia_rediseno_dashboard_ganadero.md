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

## Nota sobre componentes compartidos
Como parte de este rediseño se actualizaron a v4 los componentes compartidos `app-page-header`
(título 44px con última palabra en verde + glow, sin ícono de título) y `app-kpi-card` (layout
vertical con ícono/tono/glow). Estos componentes los usan también las otras pantallas de ganadería
(trazabilidad/sanidad/reproducción/alimentación), por lo que su **header y KPI cards** ya quedan en v4.
El rediseño v4 del **cuerpo** de esas 4 pantallas (tablas sin toggle Tabla/Tarjetas, fichas en 2
columnas, banners de alerta) quedó **fuera de esta feature** y se trasladó a la **feature 93**.

## Fuera de alcance
- **Potreros** (sin mockup).
- Rediseño v4 del cuerpo de las otras 4 pantallas de ganadería → **feature 93** (pendiente).
- Otros dashboards/módulos. Mobile. Lógica/contratos de negocio (salvo el agregado del dashboard).

## Dependencias
- Feature 86 (refactor UI ganadería), 91 (patrón ApexCharts + rediseño financiero).

## Estado
Realizada. Dashboard ganadero (`/reportes/ganaderia`) rediseñado a v4: header con eyebrow/título
glow, 10 KPI cards toneadas, evolución de peso (líneas ApexCharts, 12 meses), alertas operativas,
partos estimados (barras), genealogía (radialBar), rankings, tablas (calendario sanitario, próximos
partos, consumo) y conversión/dietas. Backend ampliado con `evolucionPeso` (pesajes) y
`proximosPartos` (controles de preñez). Compartidos `app-page-header`/`app-kpi-card` actualizados a v4.
Validado: `ng build` limpio, `mvn compile` OK y verificación visual en la app real (0 errores de
consola). El v4 del cuerpo de las otras 4 pantallas de ganadería queda en la feature 93.
