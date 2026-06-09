# 42 - Ganadería: Dashboard Ganadero Ejecutivo

## Objetivo
Diseñar e implementar una pantalla web de Dashboard Ganadero para Campo App que muestre el estado completo del rodeo mediante indicadores ejecutivos, gráficos analíticos y alertas operativas.

La experiencia debe sentirse como una plataforma SaaS premium de gestión ganadera, comparable visualmente con John Deere Operations Center, Climate FieldView, Stripe Analytics, Linear y Datadog.

## Alcance
- Backend con endpoint agregado para métricas ganaderas ejecutivas, sin datos mockeados en frontend.
- Frontend Angular con pantalla premium dark SaaS para KPI cards, gráficos y alertas.
- Sidebar con nueva opción Dashboard Ganadero.
- Cards, gráficos, timelines y progress bars con el lenguaje visual actual de Campo App.

## KPIs
1. Animales activos.
2. Peso promedio.
3. Ganancia diaria promedio.
4. Preñadas activas.
5. Partos próximos 30 días.
6. Vacunas próximas.
7. Alertas sanitarias.
8. Ocupación promedio de potreros.
9. Dietas activas.
10. Animales sin ubicación.

## Visualizaciones
1. Distribución del rodeo por categoría.
2. Animales por potrero.
3. Ocupación de potreros con progress bars.
4. Calendario sanitario agrupado por vacuna.
5. Diagnósticos por severidad.
6. Tratamientos activos.
7. Estado reproductivo.
8. Partos estimados por mes.
9. Genealogía y trazabilidad.
10. Consumo de alimento por potrero.
11. Costo alimentación.
12. Conversión alimenticia.
13. Dietas activas.
14. Alertas operativas.

## Implementación
- Endpoint `GET /api/v1/reportes/ganaderia/dashboard` con respuesta consolidada backend-driven.
- Aggregaciones sobre trazabilidad, potreros, pesajes, sanidad, reproducción y alimentación.
- Página Angular lazy-loaded en `/reportes/ganaderia` para no impactar el bundle inicial.
- Sidebar y permisos de menú persistidos con `dashboard-ganadero`.
- Visualizaciones CSS/SVG sin librerías externas ni mocks frontend.

## Estilo Visual
- Dark mode premium.
- Fondo #081225.
- Cards #0B1730.
- Verde #9FE870.
- Azul #6EA8FF.
- Violeta #9A7DFF.
- Naranja #FFB84D.
- Rojo #FF6B6B.
- Glassmorphism suave, bordes 20px, sombra sutil y glow verde leve.

## Requisitos Técnicos
- Endpoint REST: `/api/v1/reportes/ganaderia/dashboard`.
- Todos los datos renderizados provienen del backend.
- Grilla responsive 1920x1080 con separación 24px.
- No usar gráficos antiguos, grids pesados ni tablas densas.
- Reutilizar datos existentes de trazabilidad, potreros, sanidad, reproducción y alimentación.

## Estado
Realizada.
