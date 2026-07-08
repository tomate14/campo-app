# 19 - Finanzas: Reportes Financieros

## Estado
Realizada.

## Objetivo
Dashboard financiero ejecutivo para visualizar el estado economico del establecimiento desde datos reales de la base de datos.

## Alcance Implementado
- Endpoint backend-driven: `GET /api/v1/finanzas/reportes/dashboard`.
- Filtros por `fechaDesde` y `fechaHasta`.
- Parametros `topClientesLimit` y `topProveedoresLimit` para rankings dinamicos.
- Pantalla web en `/finanzas/reportes`.
- Opcion visible en sidebar dentro de Dashboard como `Dashboard financiero`.
- Graficos con `ng-apexcharts`, la libreria usada en dashboards actuales.
- Tooltips custom premium similares a los existentes en Dashboard Ganadero.

## KPIs
- Ventas del periodo.
- Compras del periodo.
- Margen bruto.
- Cuentas por cobrar.
- Cuentas por pagar.
- Flujo neto.
- Stock valorizado.
- Vencimientos proximos.

No se implementan por pedido explicito:
- IVA proyectado.
- Resultado operativo.

## Graficos
- Ingresos vs egresos por mes, con ultimos 12 periodos completos.
- Flujo de caja real, basado en cobros y pagos.
- Top clientes por ventas, con input de cantidad, boton actualizar y barras proporcionales al top 1.
- Top proveedores por compras, con input de cantidad, boton actualizar y barras proporcionales al top 1.

No se implementa por pedido explicito:
- Grafico de torta de composicion de gastos.

## Tablas Operativas
- Cuentas por cobrar abiertas.
- Cuentas por pagar abiertas.
- Proximos vencimientos consolidados.

## Fuentes de Datos
- `finanzas_facturas`
- `finanzas_compras`
- `finanzas_cobros`
- `finanzas_pagos_proveedor`
- `stock_insumos_agricolas`
- `insumos_agricolas`

## Validacion Tecnica
- `mvn -DskipTests compile`
- `npx ng build --configuration development`
