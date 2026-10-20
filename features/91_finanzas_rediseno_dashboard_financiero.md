# 91 - Finanzas: rediseño del dashboard financiero (panel web ejecutivo)

## Descripción
Aplicar el rediseño ejecutivo al **Dashboard Financiero** (`/finanzas/reportes`,
`finanzas-reportes-page`) siguiendo el mockup y la guía de estilos provistos
(`Panel web ejecutivo rediseñado.zip` → `export-finanzas/01-dashboard-financiero-completo.png`
y `estilos.md`). Solo UI/estilos/formatos; se preserva la lógica, los datos y el
endpoint (`GET /api/v1/finanzas/reportes/dashboard`).

## Decisiones
- Solo web; solo UI (sin cambios de backend/contratos/lógica).
- Fuente de verdad: el mockup + `estilos.md` (tipografía Inter, tokens de color,
  radios/sombras, componentes). Reutilizar componentes compartidos existentes
  (`app-page-header`, `app-kpi-card`) donde encajen.

## Alcance (secciones del mockup)
- Header: eyebrow "FINANZAS", título "Dashboard Financiero" (2ª palabra en verde con
  glow), subtítulo, **filtro global** Desde/Hasta + botón "Aplicar filtros" (outline
  verde, sin relleno sólido).
- **8 KPI cards** (Ventas, Compras, Margen bruto, Cuentas por cobrar, Cuentas por pagar,
  Flujo neto, Stock valorizado, Vencimientos próximos): ícono en contenedor con tono
  semántico + glow, label MAYÚSCULAS, valor grande, texto de contexto coloreado por
  estado, menú "⋮". Sin % comparativo ni sparkline.
- **Ingresos vs egresos por mes** (barras 12 meses, ingresos verde / egresos rojo,
  grilla 4 divisiones, tooltip).
- **Próximos vencimientos** (ítems con punto anillado + glow, tipo/entidad/fecha, monto,
  chevron; botón "Ver todos").
- **Flujo de caja real** (líneas suavizadas Ingresos/Egresos/Flujo neto punteado, área en
  gradiente, leyenda clickeable).
- **Top clientes** y **Top proveedores** (ranking: número en círculo con tono del puesto,
  nombre + monto, barra con glow, "% del total").
- **Cuentas por cobrar** y **Cuentas por pagar** (tablas: cliente/proveedor con avatar
  inicial, comprobante, vencimiento coloreado, saldo, chip de estado; "Ver todas").

## Requisitos técnicos
- Angular standalone + signals; preservar `ReportesFinancierosService` y el shape de
  `ReportesFinancierosDashboardResponse` (KPIs, comparativas ingresos/egresos y
  cobros/pagos, rankings, pendientesCobrar/pendientesPagar, vencimientos).
- Aplicar tokens de `estilos.md`; charts CSS/SVG (como feature 84) o componentes de
  charts existentes. Un único filtro global de período (ningún panel con selector propio).
- Mantener lenguaje premium dark SaaS y regla de tooltips premium.

## Fuera de alcance
- Backend / contratos / lógica. Otros dashboards.

## Dependencias
- Feature 19 (reportes financieros), 85 (cotización dólar), 84 (patrón de charts).

## Estado
Pendiente.
