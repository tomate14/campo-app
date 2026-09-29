# 89 - Finanzas: retenciones y percepciones (sufridas y practicadas)

## Descripción
Incorporar el tratamiento de **retenciones y percepciones** que atraviesan la operación
agropecuaria: las **sufridas** (que a la empresa le retienen/perciben en sus cobros y
compras) y las **practicadas** (que la empresa debe retener al pagar a ciertos
proveedores). Cubre IVA (incluido el régimen agropecuario de retención de IVA con
devolución), Ganancias (SICORE / RG 830) e Ingresos Brutos (regímenes provinciales),
con sus certificados e impacto en el neto a cobrar/pagar y en la posición fiscal.

## Origen
Investigación de brechas contables (chat): sin retenciones/percepciones, ni la cuenta
corriente de terceros ni la posición de IVA/Ganancias son correctas.

## Alcance
1. **Catálogo de regímenes** de retención/percepción (IVA, Ganancias, IIBB por
   jurisdicción) con alícuotas, mínimos y base de cálculo, editable (Utilidades).
2. **Retenciones/percepciones sufridas**: registrar las que constan en los comprobantes
   de venta cobrados y en las compras; alimentan el crédito computable (IVA/Ganancias)
   y ajustan el neto cobrado/pagado.
3. **Retenciones practicadas**: al pagar a un proveedor sujeto a retención, calcular y
   registrar la retención, emitir el **certificado** y dejarla lista para SICORE.
4. **Certificados**: generación/almacenamiento (PDF) y numeración.
5. **Integración**:
   - Con cobros (`CobroVenta`) y pagos (`PagoProveedor`): el neto considera ret./perc.
   - Con la posición de IVA (feature 88): las retenciones/percepciones de IVA sufridas
     se restan del saldo.
6. **Exportación**: TXT SICORE (Ganancias/IVA practicadas) y reportes por período.
7. **Web**: gestión en Finanzas (regímenes, sufridas, practicadas, certificados) con
   lenguaje premium dark SaaS.

## Requisitos técnicos
- Backend: entidades de régimen y de retención/percepción (asociadas a
  comprobante/cobro/pago), motor de cálculo (alícuota, base, mínimo), numeración de
  certificados y export SICORE; endpoints REST; migración Flyway.
- Backend-driven; tests JUnit del cálculo (base, mínimo, alícuota) y de la integración
  con neto y posición.

## Decisiones abiertas (a resolver al desarrollar)
- Alcance inicial de jurisdicciones IIBB (¿solo la provincia del establecimiento o
  convenio multilateral?).
- Grado de automatización del cálculo vs carga manual asistida.
- Formato exacto de los TXT (SICORE, aplicativos provinciales).

## Dependencias
- Features 17 (ventas/cobros), 18 (compras/pagos), 88 (posición IVA).

## Fuera de alcance
- Liquidación completa de Ganancias/IIBB (solo se preparan retenciones/percepciones y
  sus exports).

## Prioridad
Alta / segunda (junto con la 88 completa el circuito impositivo de IVA).

## Estado
Pendiente.
