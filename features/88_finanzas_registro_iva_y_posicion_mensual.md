# 88 - Finanzas: registro de IVA (ventas + compras) y posición mensual

## Descripción
Agregar la capa de **IVA** sobre los comprobantes que el sistema ya carga: registro
(libro) de IVA de **ventas** y de **compras**, y la **posición mensual de IVA**
(débito fiscal, crédito fiscal, saldo técnico a pagar o a favor). Alinear el modelo y
las exportaciones al esquema vigente de ARCA (**Portal IVA / IVA Simple**, RG 5707/2025,
que reemplaza el uso del "Libro de IVA Digital" para responsables inscriptos desde el
período 11/2025), sin reemplazar el criterio del contador.

## Origen
Investigación de brechas contables (chat): hoy el módulo es operativo (factura ventas
y compras con IVA por ítem) pero no consolida IVA ni produce la posición mensual, que
es lo primero que necesita un contador.

## Alcance
1. **Registro IVA Ventas**: listado de comprobantes de venta por período con
   discriminación de neto gravado, IVA por alícuota (0/2,5/5/10,5/21/27), exento y no
   gravado, percepciones, totales; ordenado por fecha/comprobante.
2. **Registro IVA Compras**: ídem para compras (crédito fiscal), con validación de CUIT
   del proveedor y tipo de comprobante.
3. **Posición mensual de IVA**: débito fiscal (ventas) − crédito fiscal (compras) −
   retenciones/percepciones de IVA sufridas (cuando exista la feature 89) → saldo del
   período y arrastre de saldo a favor.
4. **Soporte multi-alícuota**: hoy el ítem asume 21%; permitir varias alícuotas por
   comprobante y su desglose. Migración de datos existentes con default 21%.
5. **Exportación**: reporte imprimible (PDF) y export TXT/CSV compatible con el registro
   electrónico de comprobantes (Portal IVA) y/o para el estudio contable.
6. **Web**: pantalla de "Libros/Posición de IVA" en Finanzas con selector de período,
   pestañas Ventas/Compras/Posición, siguiendo el lenguaje premium dark SaaS.

## Requisitos técnicos
- Backend: entidad/columnas de desglose de IVA por alícuota a nivel ítem/comprobante
  (extender `FacturaVentaItem`/`CompraProveedorItem` o tabla de alícuotas); servicio de
  agregación por período; endpoints REST `GET /finanzas/iva/ventas`,
  `/finanzas/iva/compras`, `/finanzas/iva/posicion` con filtro de período; export TXT/PDF.
- Migración Flyway (la máxima al desarrollar; hoy V58) para el desglose de alícuotas.
- Backend-driven, sin datos mock. Tests JUnit de la determinación de posición.

## Decisiones abiertas (a resolver en el brainstorming al desarrollar)
- Formato exacto de export (Portal IVA vs aplicativo del estudio) y alcance de la
  conciliación con "Mis Comprobantes" de ARCA.
- Si se modela una tabla de alícuotas separada o se agregan columnas por alícuota.

## Dependencias
- Features 17 (facturación ventas), 18 (compras proveedores).
- Se integra con la feature 89 (retenciones/percepciones) para la posición.

## Fuera de alcance
- Facturación electrónica real (WSFE) — es otro track.
- Determinación de Ganancias/IIBB.

## Prioridad
Alta / primera (quick win: los datos ya existen). Base para la feature 89 y 90.

## Estado
Pendiente.
