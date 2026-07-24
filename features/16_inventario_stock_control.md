# 16 - Inventario: Stock y Control

## Descripción
Completar el control de stock de Campo App sobre la base ya construida en la
feature 15 (inventario de insumos agrícolas), agregando las capacidades que hoy
faltan: auditoría de discrepancias (sistema vs. conteo real), disponibilidad
offline con sincronización, y captura por lector de código de barras.

## Estado de la base (ya implementado en feature 15)
La feature 15 ya cubre la columna vertebral del inventario, por lo que esta
feature NO debe reimplementarlo:
- Catálogo de insumos con UUID (`InsumoAgricola`) y stock por depósito/lote/
  vencimiento (`StockInsumoAgricola`).
- Movimientos auditados `INGRESO`, `SALIDA`, `USO` y `AJUSTE`
  (`MovimientoInsumoAgricola`) con responsable (operario), fecha y observaciones.
- Stock mínimo/máximo por insumo y alertas de reorden/vencimiento.
- Endpoint REST bajo `/api/v1/inventario/insumos` (incluye `/stock` y `/dashboard`)
  y pantalla Angular de inventario.

> Nota de nomenclatura: la implementación real vive en el dominio
> `com.campoapp.agricultura...insumos`. No se crean servicios/repos con los
> nombres genéricos del spec original (`AlmacenService`, `AjusteRepository`,
> etc.); se extiende lo existente.

## Alcance de esta feature (lo que falta)

### 1. Auditoría de discrepancias (sistema vs. realidad)
- Registrar un conteo de inventario físico por depósito/insumo (planilla de
  conteo): cantidad contada vs. cantidad del sistema al momento del conteo.
- Calcular y persistir la discrepancia (diferencia y porcentaje) por línea.
- Listar/reportar discrepancias de un conteo, resaltando las que superan un
  umbral configurable.
- Permitir aplicar el ajuste resultante como movimiento `AJUSTE` sobre el stock,
  dejando trazabilidad de quién concilió y contra qué conteo.
- No romper el historial de movimientos existente; el ajuste derivado del conteo
  debe quedar vinculado al conteo que lo originó.

### 2. Disponibilidad offline / sincronización (mobile)
- Exponer stock e insumos en la app mobile (hoy no hay ninguna pantalla de
  inventario en mobile), reutilizando la infraestructura offline-first de la
  feature 24 (Sync Down para replicar catálogo/stock, Outbox FIFO con
  Idempotency-Key para los movimientos y conteos cargados sin señal).
- El operario debe poder registrar movimientos (ingreso/salida/uso) y cargar
  un conteo físico sin conectividad, y que se sincronicen al recuperar señal.
- Reutilizar el banner/estado de sincronización y el remapeo de IDs temporales
  ya existentes.

### 3. Lector de código de barras (captura por escaneo)
- Agregar al insumo un código escaneable (EAN/UPC) diferenciado del `codigo`
  interno de catálogo actual.
- En mobile, permitir escanear el código de barras para identificar el insumo
  al registrar un movimiento o al hacer el conteo físico (usar la cámara del
  dispositivo).
- Búsqueda de insumo por código escaneado en backend.
- (Opcional/relacionado) generación/impresión de etiquetas QR queda como mejora
  futura si excede el alcance del escaneo.

## Fuera de alcance (decisión explícita del usuario)
- **Transferencias entre almacenes**: no se desarrolla.
- Refinamientos no confirmados para esta iteración (pueden derivarse a una
  feature nueva si se priorizan): almacén como entidad gestionable propia,
  stock mínimo/máximo por almacén, devoluciones de cliente y motivo de "merma"
  como tipos de movimiento diferenciados, y reporte de disponibilidad agregado
  por ubicación.

## Tareas
1. **Backend - Conteo y discrepancias**: entidad/tabla de conteo físico y sus
   líneas, cálculo de discrepancia, endpoints de alta de conteo, consulta de
   discrepancias y conciliación (aplicar `AJUSTE`). Migración Flyway nueva.
2. **Backend - Código de barras**: campo de código escaneable (EAN/UPC) en el
   insumo (migración) y búsqueda por código.
3. **Mobile - Inventario offline**: pantallas de stock/insumos, registro de
   movimientos y conteo físico, integrados a Sync Down + Outbox de la feature 24.
4. **Mobile - Escaneo**: captura de código de barras por cámara para identificar
   el insumo en movimientos y conteos.
5. **Frontend web**: pantalla/sección de auditoría de discrepancias (alta de
   conteo, revisión de discrepancias y conciliación) siguiendo el estilo premium
   dark SaaS.
6. **Testing**: pruebas del cálculo de discrepancias y de la conciliación por
   ajuste.

## Requisitos Técnicos
- UUID para conteos, líneas de conteo y movimientos derivados.
- Auditoría completa: el ajuste derivado de un conteo queda vinculado al conteo
  y al responsable.
- Endpoints REST bajo el prefijo existente `/api/v1/inventario/...`.
- Offline con sincronización reutilizando la feature 24 (Sync Down + Outbox +
  Idempotency-Key).
- Lector de código de barras EAN/UPC vía cámara del dispositivo en mobile.

## Dependencias
- Feature 15: Inventario de insumos agrícolas (base de catálogo, stock y
  movimientos).
- Feature 24: Sincronización offline-first (Sync Down / Outbox).
- Operarios (responsable del conteo/movimiento).

## Estado
Pendiente (base cubierta por feature 15; resta auditoría de discrepancias,
offline/sincronización y lector de código de barras).
