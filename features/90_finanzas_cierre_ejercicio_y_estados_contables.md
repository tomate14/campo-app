# 90 - Finanzas: cierre de ejercicio y estados contables

## Descripción
Producir el **cierre de ejercicio** y los **estados contables** del establecimiento:
estado de resultados por actividad (agrícola / ganadera) y por lote/centro de costos, y
un balance (situación patrimonial) con el resultado del período. Cierre y apertura de
ejercicio con arrastre de saldos.

## Origen
Investigación de brechas contables (chat): falta la vista de cierre anual y de
resultado real por actividad; hoy solo hay dashboards operativos.

## Alcance
1. **Definición de ejercicio**: fechas de inicio/cierre configurables (el agro suele
   cerrar 30/06); estados abierto/cerrado; bloqueo de edición al cerrar.
2. **Estado de resultados (gerencial) por actividad y por lote**: ingresos por ventas −
   costos (insumos aplicados, compras prorrateadas por ha de la feature 84, servicios,
   arrendamiento) − amortizaciones (si existe el módulo de bienes de uso) → margen por
   actividad/lote/campaña. Reusa el modelo de costos de la feature 84.
3. **Resultado por tenencia** de existencias (si se desarrolla la feature 3/valuación
   de hacienda y granos): variación de existencias valuadas entre inicio y cierre.
4. **Situación patrimonial** resumida: activos (bancos, CxC, existencias, bienes de
   uso), pasivos (CxP, saldos fiscales), y patrimonio con el resultado del ejercicio.
5. **Cierre/apertura**: consolidación del período, arrastre de saldos de cuentas
   corrientes y de IVA a favor, y apertura del ejercicio siguiente.
6. **Exportación**: PDF de los estados y CSV para el estudio contable.
7. **Web**: pantalla de "Cierre y estados contables" en Finanzas (premium dark SaaS).

## Requisitos técnicos
- Backend: entidad de ejercicio, servicio de consolidación por período/actividad/lote
  reutilizando las fuentes existentes (ventas, compras, movimientos de insumos, costos
  feature 84), snapshot de cierre; endpoints REST; migración Flyway. Backend-driven;
  tests JUnit de la consolidación.

## Decisiones abiertas (a resolver al desarrollar) — IMPORTANTE
- **Nivel de formalidad**: por defecto se plantea un **estado de resultados/patrimonial
  gerencial** derivado de los datos operativos y de finanzas (factible sin motor
  contable). Un **balance estatutario formal** (con libro diario/mayor por partida
  doble) requiere primero **plan de cuentas + asientos automáticos** (track #6, no
  seleccionado) y **ajuste por inflación** (track #7). Definir cuál de los dos se busca;
  si es el formal, crear esas features como prerrequisito.
- Tratamiento de existencias depende de la feature de valuación (track #3, no
  seleccionado): sin ella, el resultado por tenencia queda fuera o manual.

## Dependencias
- Features 84 (costos por lote/ha), 88 (IVA), 89 (retenciones); ventas/compras (17/18).
- Prerrequisitos para la versión formal: plan de cuentas/asientos y ajuste por inflación
  (features a crear si se elige esa vía); valuación de existencias para resultado por
  tenencia.

## Fuera de alcance
- Contabilidad por partida doble completa (plan de cuentas/asientos) salvo que se decida
  la versión formal y se creen esas features.
- Liquidación de impuestos (Ganancias/Bienes Personales).

## Prioridad
Media / tercera (es el track más grande; conviene después de 88 y 89, y de decidir el
nivel de formalidad).

## Estado
Pendiente.
