# 43 - Integridad Referencial Transversal por ID

## Descripcion
Refactor tecnico transversal para asegurar que todas las relaciones entre entidades del sistema se resuelvan por identificadores (`id`) y claves foraneas, nunca por textos descriptivos, nombres visibles o campos libres.

El objetivo es evitar inconsistencias como `Animal.ubicacionActual = "Potrero Madres"` mientras el potrero real se llama `Madres`, o cualquier join basado en nombres que pueda cambiar, duplicarse o escribirse distinto.

## Problema Detectado
En el dashboard ganadero, el grafico `Animales por Potrero` agrupa animales usando el campo textual `animales.ubicacion_actual`. Esto permite que existan valores como `Potrero Madres` o `Potrero Toros`, aunque el nombre real del potrero sea `Madres` o `Toros`.

Esto rompe:
- Consistencia de datos.
- Calculo de carga actual por potrero.
- Reportes y dashboards.
- Selectores y filtros.
- Trazabilidad historica.
- Integridad referencial.

## Regla General Obligatoria
Toda relacion entre entidades del sistema debe resolverse por `id`.

No se debe usar:
- Nombre de potrero como relacion.
- Nombre de lote como relacion.
- Nombre de operario como relacion.
- Nombre de maquinaria como relacion.
- Nombre de vacuna, dieta, insumo, usuario o cualquier entidad como join logico.
- Campos libres como fuente de verdad para relaciones.

Los nombres quedan solo como datos descriptivos de visualizacion.

## Alcance Transversal
Revisar y corregir todas las relaciones del sistema donde hoy se use texto libre para vincular entidades.

Dominios a revisar:
- Ganaderia.
- Agricultura.
- Maquinaria.
- Operarios.
- Inventario.
- Reportes.
- Calendario de operaciones.
- Mobile/offline.

## Caso Principal: Animales y Potreros

### Modelo Correcto
Crear una entidad relacional historica:

`animales_potreros`

Campos sugeridos:
- `id`
- `animal_id`
- `potrero_id`
- `fecha_desde`
- `fecha_hasta`
- `activo`
- `motivo`
- `responsable_id` o `responsable_usuario_id`
- `movimiento_id` opcional
- `observaciones`
- auditoria: `created_at`, `updated_at`, `deleted_at`

Reglas:
- Un animal puede tener muchos registros historicos de potrero.
- Solo un registro puede estar activo por animal.
- La ubicacion actual del animal se obtiene desde el registro activo.
- El nombre del potrero se obtiene por join contra `potreros.id`.
- `animales.ubicacion_actual` no debe ser fuente de verdad.

### Movimiento de Animal
Cada movimiento de animal hacia un potrero debe:
- Recibir `animal_id` y `potrero_destino_id`.
- Cerrar el registro activo anterior en `animales_potreros` cargando `fecha_hasta` y `activo = false`.
- Crear un nuevo registro activo con `animal_id`, `potrero_id` y `fecha_desde`.
- Registrar el movimiento en la tabla historica correspondiente.

Si el movimiento es entre potreros:
- `origen` debe salir del registro activo anterior.
- `destino` debe ser el `potrero_id` seleccionado.

No se debe permitir cargar origen/destino como texto libre.

## Cambios Backend Requeridos
- Crear migracion para `animales_potreros`.
- Migrar datos existentes desde `animales.ubicacion_actual` intentando matchear por `potreros.nombre`.
- Cuando no haya match, dejar registro pendiente o crear reporte de inconsistencias.
- Agregar entidad JPA `AnimalPotrero`.
- Agregar repository `AnimalPotreroRepository`.
- Actualizar `Animal` para exponer potrero actual via relacion o DTO derivado.
- Actualizar `AnimalRequest` para recibir `potreroId` en lugar de `ubicacionActual`.
- Actualizar `AnimalResponse` para devolver:
  - `potreroId`
  - `potreroNombre`
  - `ubicacionActual` como alias derivado temporal si hace falta compatibilidad.
- Actualizar `MovimientoAnimalRequest` para usar:
  - `potreroOrigenId`
  - `potreroDestinoId`
- Actualizar servicios de trazabilidad, movimientos, dashboard ganadero, alimentacion y reportes para usar joins por ID.
- Remover joins o agrupaciones por `ubicacionActual`.

## Cambios Frontend Requeridos
- En alta/edicion de animal, seleccionar potrero por `id` usando el componente generico de select con busqueda.
- En movimiento de animal, origen y destino deben ser potreros por `id`.
- Mostrar nombre del potrero desde `potreroNombre`, no desde texto libre.
- Actualizar dashboard ganadero:
  - `Animales por Potrero` debe agrupar por `potrero_id`.
  - `Ocupacion de Potreros` debe calcular carga actual desde `animales_potreros` activo.
- Actualizar filtros de ubicacion para que usen `potreroId` o selector de potrero.

## Otros Casos a Revisar
Aplicar el mismo criterio a:
- Alimentacion: suministro por potrero debe usar `potrero_id`.
- Agricultura: eventos, siembra, cosecha, plagas y clima deben usar `lote_id`, nunca nombre del lote.
- Maquinaria: mantenimientos e intervenciones deben usar `maquinaria_id`, nunca codigo o modelo como relacion.
- Operarios: responsables deben usar `usuario_id` u `operario_id`, nunca nombre libre.
- Sanidad: veterinario/responsable deben usar `usuario_id` u `operario_id`.
- Reproduccion: vaca, toro, ternero y tecnico deben estar relacionados por IDs.
- Inventario: insumos, alimentos, vacunas y productos deben relacionarse por IDs.
- Calendario de operaciones: toda referencia a lote, potrero, animal, maquinaria y operario debe resolverse por ID.

## Reglas de Migracion
- No perder datos historicos.
- Mantener compatibilidad temporal en DTOs si el frontend todavia consume nombres.
- Agregar campos derivados de visualizacion, pero no usarlos como fuente de verdad.
- Documentar inconsistencias de datos que no puedan migrarse automaticamente.

## Criterios de Aceptacion
- No existe ningun calculo de carga, dashboard o reporte basado en nombres de entidades.
- `Animales por Potrero` usa IDs y muestra el nombre por join.
- `Ocupacion de Potreros` usa la asignacion activa de `animales_potreros`.
- Movimiento de animal cambia la asignacion activa por ID.
- No se puede asignar un animal a un potrero inexistente.
- Los selectores del frontend envian IDs, no nombres.
- El backend valida existencia y estado activo de la entidad relacionada.
- Tests cubren asignacion, movimiento, cierre de asignacion anterior y dashboard.

## Test Plan
- Backend:
  - `mvn -DskipTests compile`
  - Tests unitarios de movimiento animal y asignacion a potrero.
  - Test de dashboard ganadero agrupando animales por `potrero_id`.
  - Test de migracion basica desde `ubicacion_actual` a `animales_potreros`.
- Frontend:
  - `npm.cmd run type-check`
  - `npm.cmd run build`
  - Verificar alta/edicion de animal con selector de potrero.
  - Verificar movimiento entre potreros.
  - Verificar dashboard ganadero sin prefijos incorrectos ni agrupaciones por texto.

## Estado
Pendiente.
