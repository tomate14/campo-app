# 51 - Ganaderia: Nombres de Operarios y Potreros en Historiales

## Estado
Realizada.

## Origen
Detectado durante la verificacion en navegador de la feature [50](50_COMPLETA_ganaderia_mobile_animales_ficha_historiales.md) y confirmado por el usuario probando: en los historiales del animal, los campos que referencian personas (`responsable`/`operario`/`veterinario` en movimientos, vacunas, **tratamientos, diagnosticos**, pesajes e historial clinico) muestran el **UUID crudo** del operario en vez de su nombre, y en varias actividades tambien se renderiza el **id del potrero** en vez de su nombre. Los DTOs del backend devuelven los ids tal como se persistieron (los formularios de las features 45/46 guardan el id seleccionado) y nadie los resuelve al listar.

## Alcance
**Via elegida: resolver en el backend** (sirve para mobile y web a la vez, y es el patron que el dominio ya usa: `AnimalResponse` resuelve `potreroNombre`/`madreCaravana`, sanidad ya resuelve `animalCaravana`/`vacunaNombre`).

1. **Backend** — agregar campos `<campo>Nombre` resueltos (lookup batch, sin N+1) a:
   - `AplicacionVacunaResponse.operario` -> `operarioNombre`
   - `TratamientoMedicamentoResponse.responsable` -> `responsableNombre`
   - `DiagnosticoSanitarioResponse.veterinario` -> `veterinarioNombre`
   - `PesajeResponse.responsable` -> `responsableNombre`
   - `HistorialMedicoAnimalResponse.veterinario` -> `veterinarioNombre`
   - `MovimientoAnimalResponse.responsable` -> `responsableNombre`, y `potreroOrigenId`/`potreroDestinoId` -> `potreroOrigenNombre`/`potreroDestinoNombre`
   - `RegistroAlimentacionResponse.responsable` -> `responsableNombre` y `potreroId` -> `potreroNombre`
   Regla de resolucion: si el valor matchea un operario por id -> `nombreCompleto`; si no, se devuelve el valor crudo (el campo historicamente acepto texto libre). Potreros: id -> nombre, fallback al id.
2. **Mobile** — `animal-historial.tsx` muestra los campos `*Nombre` con fallback al valor crudo; se elimina la resolucion client-side de potreros que ya no hace falta (o se conserva solo como fallback offline).
3. **Web** — revisar las tablas de sanidad/alimentacion: si muestran los ids crudos, pasar a los campos resueltos.

## Referencias Tecnicas
- `mobile/app/ganaderia/animal-historial.tsx` (ya resuelve potreros por id contra la replica: mismo patron aplicable a operarios con `useOperarios`).
- Backend: DTOs en `com.campoapp.ganaderia.dto`, `OperarioRepository`.

## Implementado
Desarrollada sobre la branch de la feature 50 (depende de su pantalla de historiales), con los agentes backend/mobile/frontend en paralelo.

### Backend
- Nuevo helper `OperarioNombreResolver` (`ganaderia/service/impl`): `resolverNombres(ids)` hace UN solo `findAllById` batch (filtra nulos, distinct) y devuelve mapa id -> "nombre apellido" (`Operario` no tiene `nombreCompleto`: se compone, mismo patron que `InsumoServiceImpl`); `resolver(crudo, mapa)` devuelve el crudo tal cual si no matchea id (texto libre historico pasa intacto). Incluye operarios soft-deleted a proposito (los historiales viejos conservan el nombre). El cruce de modulos ganaderia->operarios tiene precedente (agricultura y finanzas ya lo hacen).
- Campos agregados (sin renombrar nada): `AplicacionVacunaResponse.operarioNombre`, `TratamientoMedicamentoResponse.responsableNombre`, `DiagnosticoSanitarioResponse.veterinarioNombre`, `PesajeResponse.responsableNombre`, `HistorialMedicoAnimalResponse.veterinarioNombre`, `MovimientoAnimalResponse.responsableNombre` + `potreroOrigenNombre`/`potreroDestinoNombre` (de las asociaciones JPA existentes, sin lookup extra), `RegistroAlimentacionResponse.responsableNombre` (+ `potreroNombre` con fallback al texto libre `potrero`).
- Paginados de sanidad resuelven sobre `page.getContent()` preservando totales; listados y dashboard hacen un unico batch por lista; sin N+1 (verificado por test con `verify(findAllById, times(1))`).
- Test nuevo `HistorialNombresOperarioTest` (3) + `AnimalServicePaginacionTest` actualizado: id -> nombre, texto libre intacto, potrero origen/destino por nombre, paginacion con totales.

### Mobile
- Tipos con los campos `*Nombre` opcionales; `animal-historial.tsx` muestra resuelto-con-fallback en los 6 tipos; en movimientos la cadena `ubicacion || potreroNombre-del-server || replica-local || id` (la resolucion client-side queda como fallback offline). Unico consumidor de estos DTOs verificado por barrido.

### Web
- Modelos con los campos nuevos; tablas de sanidad (operario/responsable/veterinario), cards de alimentacion (responsable x2), timeline de movimientos de trazabilidad (potrero origen/destino como fallback de ubicacion) y el computed `historialClinico()` de trazabilidad, todos con patron resuelto-con-fallback.

## Validacion Tecnica
- Backend: `mvn -q compile` limpio; `HistorialNombresOperarioTest` + `AnimalServicePaginacionTest` 6/6 verdes.
- Mobile: `tsc --noEmit` limpio; jest 7/7. Web: `npm run type-check` limpio.
- **Verificado en navegador contra el stack Docker** (imagen backend reconstruida): los historiales de Movimientos y Vacunas del animal 0123 muestran "Sergio Fernandez" en vez del UUID y los potreros por nombre ("Potrero Toros -> Potrero 12A"); ademas el 401 del entry point (fix de la 50) quedo activo en el stack. Tratamientos/diagnosticos sin datos de prueba en la base, pero cubiertos por los mismos mapper+test.
