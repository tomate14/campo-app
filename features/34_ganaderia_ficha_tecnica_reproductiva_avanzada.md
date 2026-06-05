# Feature 34 - Ganaderia: Ficha tecnica reproductiva avanzada

## Summary
Completar los datos avanzados que requiere el popup de detalle de vacas proximas a parir y que todavia no estan modelados de forma persistente en el sistema.

## Pendientes detectados
- Registrar HBA/RP como campos formales separados de caravana.
- Modelar categoria productiva/reproductiva de la vaca.
- Persistir estado reproductivo historico y actual.
- Incorporar metodo diagnostico de prenez.
- Persistir condicion corporal.
- Persistir peso estimado por evento reproductivo, no solo peso actual del animal.
- Modelar potrero/lote como entidad formal para ubicacion actual.
- Registrar grupo reproductivo y responsable asignado.
- Calcular intervalo entre partos con historial completo.
- Incorporar notas, documentos y ficha medica reciente dentro del detalle reproductivo.
- Vincular ultimo servicio con toro/semen y fecha como dato consolidado.

## Alcance propuesto
- Backend: entidades, DTOs, repositorios y endpoints necesarios para ficha tecnica reproductiva avanzada.
- Frontend Angular: completar el modal premium de detalle con datos reales y eliminar placeholders.
- Migraciones: agregar columnas/tablas necesarias sin romper trazabilidad existente.

## Criterios de aceptacion
- El detalle de alerta de parto no muestra placeholders para campos soportados por el sistema.
- La ficha tecnica de la vaca muestra HBA/RP, categoria, estado reproductivo, condicion corporal, potrero, grupo y responsable.
- El resumen reproductivo muestra metodo diagnostico, ultimo servicio e intervalo de parto anterior reales.
- Historial medico, notas y documentos se muestran desde datos persistidos.

