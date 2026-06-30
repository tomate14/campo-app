# 18 - Finanzas: Compras y Proveedores

## Estado
Realizada.

## Descripcion
Gestion de proveedores, compras de insumos, pagos y cuentas por pagar dentro del modulo Finanzas.

## Alcance Implementado
- Registro, edicion, baja logica y busqueda paginada de proveedores.
- Registro de compras con proveedor, responsable, comprobante, vencimiento e items.
- Items de compra vinculados opcionalmente a insumos por `insumo_id`.
- Calculo backend de subtotal, IVA, total y saldo pendiente.
- Registro de pagos a proveedores con responsable por `operario_id`.
- Actualizacion automatica del estado de compra a `PARCIAL` o `PAGADA` segun saldo.
- Dashboard con proveedores activos, compras registradas, compras del periodo, cuentas por pagar, pagos del periodo y compras vencidas.
- Filtros por texto, estado y rango de fechas.
- Tablas paginadas con selector de cantidad de registros.
- Pantalla Angular premium con tabs estilo Campo App.
- Opcion visible en sidebar bajo Finanzas.
- Opcion de menu persistida y asignada por defecto a `super_admin`, `admin` y `contador`.

## Backend
- Endpoint REST: `/api/v1/finanzas/compras-proveedores`.
- Servicio: `ComprasProveedoresService`.
- Implementacion: `ComprasProveedoresServiceImpl`.
- Controlador: `ComprasProveedoresController`.
- Migracion: `V36__finanzas_compras_proveedores.sql`.

## Entidades
- `ProveedorFinanciero`.
- `CompraProveedor`.
- `CompraProveedorItem`.
- `PagoProveedor`.

## Repositorios
- `ProveedorFinancieroRepository`.
- `CompraProveedorRepository`.
- `PagoProveedorRepository`.

## Frontend
- Ruta: `/finanzas/compras-proveedores`.
- Pantalla: `FinanzasComprasPageComponent`.
- Servicio Angular: `FinanzasComprasService`.
- Sidebar: opcion `Compras` dentro de Finanzas.

## Validacion Tecnica
- `mvn -DskipTests compile`: OK.
- `npx ng build --configuration development`: OK.

## Pendientes Fuera de Alcance
- Integracion real con proveedores externos.
- Integracion fiscal externa para comprobantes de compra.
- Recepcion fisica con impacto automatico sobre stock.
- Comparativa avanzada de cotizaciones.
