# 19 - Finanzas: Reportes Financieros

## DescripciÃ³n
GeneraciÃ³n de reportes financieros integrales para anÃ¡lisis de rentabilidad, flujo de caja y toma de decisiones.

## Funcionalidades Principales
- Balance de ingresos y egresos
- Flujo de caja
- Rentabilidad por cultivo/lote
- AnÃ¡lisis de costos operativos
- Proyecciones financieras

## Tareas
1. **Estado de Resultados**: Ingresos vs. gastos por perÃ­odo
2. **Flujo de Caja**: ProyecciÃ³n y realidad de efectivo
3. **Balance General**: Activos, pasivos, patrimonio
4. **Costo de ProducciÃ³n**: Costo por hectÃ¡rea o por unidad
5. **Rentabilidad**: Ganancia neta y margen por actividad
6. **AnÃ¡lisis de Costos**: Desglose de gastos (mano de obra, insumos, maquinaria)
7. **Comparativas**: PerÃ­odo a perÃ­odo, aÃ±o a aÃ±o
8. **Proyecciones**: Estimaciones de ganancia futura

## Servicios
- `FinanzasService`: CÃ¡lculos e integraciones
- `ReportFinancierService`: GeneraciÃ³n de reportes
- `ProyeccionService`: Predicciones financieras

## Repositorios
- `TransaccionRepository`
- `CostoOperativoRepository`
- `RentabilidadRepository`

## Requisitos TÃ©cnicos
- Agregaciones complejas de datos
- UUID para auditorÃ­a
- Endpoint REST: `/api/v1/finanzas/reportes`
- GeneraciÃ³n de PDF/Excel
- GrÃ¡ficos interactivos

## Dependencias
- FacturaciÃ³n (ingresos)
- Compras (egresos)
- Operarios (costos de mano de obra)
- Maquinaria (depreciaciÃ³n y costos)
- Inventario (costo de bienes)
- Todas las otras features (cÃ¡lculos consolidados)

