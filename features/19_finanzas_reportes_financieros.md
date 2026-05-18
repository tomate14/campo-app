# 19 - Finanzas: Reportes Financieros

## Descripción
Generación de reportes financieros integrales para análisis de rentabilidad, flujo de caja y toma de decisiones.

## Funcionalidades Principales
- Balance de ingresos y egresos
- Flujo de caja
- Rentabilidad por cultivo/lote
- Análisis de costos operativos
- Proyecciones financieras

## Tareas
1. **Estado de Resultados**: Ingresos vs. gastos por período
2. **Flujo de Caja**: Proyección y realidad de efectivo
3. **Balance General**: Activos, pasivos, patrimonio
4. **Costo de Producción**: Costo por hectárea o por unidad
5. **Rentabilidad**: Ganancia neta y margen por actividad
6. **Análisis de Costos**: Desglose de gastos (mano de obra, insumos, maquinaria)
7. **Comparativas**: Período a período, año a año
8. **Proyecciones**: Estimaciones de ganancia futura

## Servicios
- `FinanzasService`: Cálculos e integraciones
- `ReportFinancierService`: Generación de reportes
- `ProyeccionService`: Predicciones financieras

## Repositorios
- `TransaccionRepository`
- `CostoOperativoRepository`
- `RentabilidadRepository`

## Requisitos Técnicos
- Agregaciones complejas de datos
- UUID para auditoría
- Endpoint REST: `/api/v1/finanzas/reportes`
- Generación de PDF/Excel
- Gráficos interactivos

## Dependencias
- Facturación (ingresos)
- Compras (egresos)
- Operarios (costos de mano de obra)
- Maquinaria (depreciación y costos)
- Inventario (costo de bienes)
- Todas las otras features (cálculos consolidados)
