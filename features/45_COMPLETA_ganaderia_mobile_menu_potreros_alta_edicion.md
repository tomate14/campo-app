# 45 - Ganaderia Mobile: Alta/Edicion de Potreros y Burbuja de Reproduccion

## Estado
Realizada.

## Origen
El usuario quiere avanzar con el menu de ganaderia en la app mobile. El menu `GANADERIA` en `mobile/app/(tabs)/_layout.tsx` ya muestra 4 items (Trazabilidad, Sanidad, Alimentacion, Potreros), pero solo `Potreros` tiene ruta y pantalla real (`mobile/app/(tabs)/potreros.tsx`); los otros 3 estan deshabilitados.

Al definir prioridades, el usuario decidio acotar esta feature a Potreros y a la burbuja de Reproduccion. Activar el menu (Trazabilidad/Sanidad/Alimentacion) y sus burbujas correspondientes queda derivado a la feature [46](46_COMPLETA_ganaderia_mobile_trazabilidad_sanidad_alimentacion.md).

## Que ya existe hoy (verificado en codigo, no es pendiente de esta feature)
- `mobile/app/(tabs)/potreros.tsx`: mapa + listado de potreros, capas satelite/mapa/hibrido/terreno, ubicacion del usuario. Reutiliza `mobile/shared/components/lotes-field-map.native.tsx` (react-native-maps).
- Al tocar un potrero se abre `PotreroPreview` con: superficie, carga animal actual, % de ocupacion, badges de agua y sombra, observaciones e historial.
- **Color por estado del potrero: ya esta correctamente aplicado al relleno del poligono en el mapa.** `buildMapItems()` → `potreroColor()` → `estadoColor()` asigna `#9FE870` (verde) a `ACTIVO`, `#6EA8FF` (azul) a `DESCANSO`, `#FFB84D` (naranja) a `MANTENIMIENTO` y `#A6B0CF` (gris) a `INACTIVO`, y ese color llega a `strokeColor`/`fillColor` del `<Polygon>` en `lotes-field-map.native.tsx`. No requiere cambios.
- La rail de 4 "burbujas" a la izquierda del mapa (`actions` en `potreros.tsx`) ya existe visualmente, pero son placeholders sin funcionalidad real (Ver detalle, Carga animal, Ver historial, Forraje).
- Datos via `usePotrerosMapa()` — **solo lectura**, no hay POST/PUT/DELETE desde mobile todavia.

## Decision tecnica: poligono como texto GeoJSON (no dibujo touch)
No existe en mobile ningun flujo de dibujo de poligono touch sobre el mapa (se busco explicitamente, no hay nada para extender). El unico precedente de alta con poligono es `mobile/app/lotes/nuevo.tsx`, que usa un campo de texto multilinea donde se pega/escribe el GeoJSON a mano. Para no inventar una interaccion nueva sin precedente en la app y poder entregar la funcionalidad en esta feature, el formulario de potrero sigue el mismo patron (campo de texto para el poligono). Si mas adelante se quiere dibujo touch real sobre el mapa, es candidato a una feature propia (no trivial: requiere manejo de gestos, edicion de vertices, etc.).

## Alcance

### 1. Alta, edicion y baja de potreros desde mobile
Nueva pantalla `mobile/app/ganaderia/potrero-form.tsx` (sirve para alta y edicion segun se le pase o no un `id`), con los mismos campos que expone `PotreroRequest` (backend): nombre, descripcion, superficie (ha), tipo de uso (chips: PASTOREO/RESERVA/RECRIA/MATERNIDAD/ENCIERRE/OTRO), estado (chips: ACTIVO/DESCANSO/MANTENIMIENTO/INACTIVO), capacidad de animales, recurso forrajero, disponibilidad de agua (switch), tiene sombra (switch), observaciones, poligono (GeoJSON como texto) y centroide (latitud/longitud).

- Boton "Nuevo potrero" desde `potreros.tsx`.
- Boton "Editar" y "Eliminar" desde `PotreroPreview`.

### 2. Burbuja "Agregar Reproduccion"
Nueva pantalla `mobile/app/ganaderia/nueva-reproduccion.tsx`, con el mismo patron visual que "Registrar evento" de lotes (`mobile/app/agricola/nueva-siembra.tsx`): pantalla completa, `CardGrid`/`SelectableCard` para elegir el tipo, formulario condicional segun el tipo, selector de animal por chips (igual que el selector de lote).

Tipos de actividad (portados de `frontend/src/app/pages/ganaderia-reproduccion-page/`):
- **Nueva monta**: vaca (chip, filtrado a hembras), toro (chip, filtrado a machos), fecha, resultado (chips: Pendiente/Preñada/Fallida), observaciones.
- **Nueva inseminacion**: vaca (chip, hembras), fecha, genetica usada (texto, requerido), tecnico (texto libre — la web usa busqueda de usuarios, se simplifica a texto en mobile), costo (numerico), observaciones.
- **Preñez** (control de preñez): vaca (chip, hembras), fecha de diagnostico, estado (chips: Preñada/Vacia/Control), fecha estimada de parto (opcional), nivel de riesgo del parto (chips: Bajo/Medio/Alto), veterinario (texto libre), observaciones.
- **Parto**: madre (chip, hembras), ternero (chip, cualquier animal, opcional), fecha, complicaciones (texto), viabilidad del ternero (chips: Viable/No viable/Observacion), observaciones.
- **Indice** (indice genetico): animal (chip, cualquier animal), fecha de evaluacion, EPD, DEP, indice productivo (numericos opcionales), fuente (texto), observaciones.

El selector de animal usa `GET /api/v1/ganaderia/trazabilidad/animales` (campo `sexo` para filtrar hembra/macho en Monta), con un buscador simple por caravana arriba de los chips dado que puede haber muchos animales.

Las burbujas de Trazabilidad, Sanidad y Alimentacion quedan visibles en la rail (mismo diseño final) pero muestran un aviso "Disponible proximamente" al tocarlas hasta que se desarrolle la feature 46.

## Fuera de alcance (derivado a otras features)
- Activar Trazabilidad, Sanidad y Alimentacion en el menu Drawer y sus burbujas correspondientes → feature [46](46_ganaderia_mobile_trazabilidad_sanidad_alimentacion.md).
- Genealogia avanzada y funcionalidad reproductiva de laboratorio/genetica (features [33](33_ganaderia_reproduccion_offline_laboratorio_genetica_avanzada.md)/[34](34_ganaderia_ficha_tecnica_reproductiva_avanzada.md)).
- Dibujo de poligono touch sobre el mapa (ver decision tecnica arriba).
- Offline-first para los formularios de alta/edicion.

## Referencias Tecnicas
- Backend: `PotreroController.java` (`GET/POST/PUT/DELETE /api/v1/ganaderia/potreros`), `PotreroRequest.java`. `ReproduccionController.java` (`/api/v1/ganaderia/reproduccion/montas|inseminaciones|prenez|partos|indices`), DTOs `MontaRequest`, `InseminacionRequest`, `ControlPrenezRequest`, `PartoRequest`, `IndiceGeneticoRequest`. `TrazabilidadAnimalController.java` (`GET /api/v1/ganaderia/trazabilidad/animales`, `AnimalResponse` con `id`/`caravana`/`sexo`).
- Web (patrones portados): `ganaderia-potreros-page/`, `ganaderia-reproduccion-page/`.
- Mobile: `mobile/app/(tabs)/potreros.tsx`, `mobile/app/lotes/nuevo.tsx` (patron de formulario con poligono como texto), `mobile/app/agricola/nueva-siembra.tsx` (patron de "nueva actividad"), `mobile/shared/hooks/usePotreros.ts`, `mobile/shared/api/ganaderia.ts`, `mobile/shared/types/ganaderia.ts`, `mobile/app/_layout.tsx` (registro de nuevas pantallas modal).

## Implementado
- `mobile/shared/types/ganaderia.ts`: `PotreroRequest`, `Animal`, y request/response de `Monta`, `Inseminacion`, `ControlPrenez`, `Parto`, `IndiceGenetico`.
- `mobile/shared/api/ganaderia.ts`: `createPotrero`/`updatePotrero`/`deletePotrero`, `getAnimales`, `createMonta`/`createInseminacion`/`createControlPrenez`/`createParto`/`createIndiceGenetico`.
- `mobile/shared/hooks/usePotreros.ts`: `useCreatePotrero`/`useUpdatePotrero`/`useDeletePotrero`. Nuevos `useAnimales.ts` y `useReproduccion.ts`.
- `mobile/app/ganaderia/potrero-form.tsx` (nueva pantalla): alta y edicion de potrero, poligono como texto GeoJSON (ver decision tecnica), chips de tipo de uso y estado.
- `mobile/app/ganaderia/nueva-reproduccion.tsx` (nueva pantalla): los 5 tipos de actividad reproductiva con formulario condicional. Los selectores de animal (vaca/toro/madre/ternero/animal) y de persona (tecnico/veterinario) siguen el mismo patron de "Responsable" de Registrar aplicacion (buscador + lista de resultados, sin chips fijos): `AnimalSelect` muestra hasta 2 resultados, `PersonSelect` (sobre `useOperarios`) hasta 6. Se quitan los campos "Complicaciones" (Parto) y "Fuente" (Indice) a pedido del usuario.
- El campo "Ternero" en Parto suma un boton "Registrar nuevo animal" con alta completa inline (`useCreateAnimal`), replicando todos los campos de "Nuevo animal" de `ganaderia-trazabilidad-page` (web): caravana, raza (`RazaSelect` sobre `useRazasBovinas`), sexo, fecha de nacimiento, fecha de compra, peso actual, RFID, potrero actual (`PotreroSelect` sobre `usePotrerosList`), madre y padre (`AnimalSelect` con `hideWhenEmpty`) y observaciones. Los selectores de raza/potrero/madre/padre en esta alta no muestran resultados por defecto, solo al escribir en el buscador.
- `mobile/app/(tabs)/potreros.tsx`: boton "Nuevo potrero", boton "Editar"/"Eliminar" en `PotreroPreview`, rail de burbujas actualizada a Trazabilidad/Sanidad/Alimentacion (aviso "Disponible proximamente", quedan para la feature 46) y Reproduccion (funcional, navega a `nueva-reproduccion`).
- `mobile/app/_layout.tsx`: registro de las 2 pantallas nuevas como modal.

## Validacion Tecnica
- `npx tsc --noEmit -p tsconfig.json` sobre `mobile/` sin errores.
- Verificacion visual pendiente: se intento levantar `expo start --web` para probar en el navegador, pero el entorno tiene un problema preexistente no relacionado a esta feature (falta el binario nativo `lightningcss.win32-x64-msvc.node` que necesita el build web de `maplibre-gl`). No bloquea mobile nativo (Android/iOS), solo el preview web de este entorno.
- Pendiente de prueba manual en dispositivo/emulador real: alta, edicion y baja de un potrero, y creacion de cada uno de los 5 tipos de actividad reproductiva contra el backend real.
