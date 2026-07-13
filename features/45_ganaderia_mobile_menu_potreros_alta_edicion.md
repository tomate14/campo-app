# 45 - Ganaderia Mobile: Menu Completo y Alta/Edicion de Potreros desde Mobile

## Estado
Pendiente.

## Origen
El usuario quiere avanzar con el menu de ganaderia en la app mobile. El menu `GANADERIA` en `mobile/app/(tabs)/_layout.tsx` ya muestra 4 items (Trazabilidad, Sanidad, Alimentacion, Potreros), pero solo `Potreros` tiene ruta y pantalla real (`mobile/app/(tabs)/potreros.tsx`); los otros 3 estan deshabilitados (sin `route`, icono gris, sin navegacion).

Objetivo general planteado por el usuario: trasladar a mobile todo lo que se pueda dar de alta y modificar desde la pantalla web de ganaderia, no solo consulta.

## Que ya existe hoy (no es pendiente de esta feature)
- `mobile/app/(tabs)/potreros.tsx`: mapa + listado de potreros (toggle Mapa/Listado), capas satelite/mapa/hibrido/terreno, ubicacion del usuario. Reutiliza `mobile/shared/components/lotes-field-map.native.tsx` (react-native-maps), el mismo componente que usa el mapa de lotes agricolas.
- Al tocar un potrero en el mapa ya se abre un panel `PotreroPreview` con: superficie, carga animal actual, % de ocupacion (con barra de progreso), badges de agua y sombra, observaciones e historial.
- Datos via `usePotrerosMapa()` contra `GET /api/v1/ganaderia/potreros/mapa` (`PotreroController.java`) — **solo lectura**, no hay POST/PUT desde mobile.

## Alcance propuesto (a priorizar por el usuario)

### 1. Alta y edicion de potreros desde mobile
Portar a mobile el flujo que ya existe en `frontend/src/app/pages/ganaderia-potreros-page/ganaderia-potreros-page.component.ts`:
- Dibujo de poligono sobre el mapa (equivalente mobile del click-a-click de MapLibre web, adaptado a gestos touch sobre `react-native-maps`).
- Calculo automatico de area y centroide (portar logica de `shared/lote-geometry`).
- Formulario de alta/edicion con los mismos campos que expone `PotreroController` (`POST` / `PUT /{id}`): nombre, tipo de uso, estado, capacidad de animales, recurso forrajero, disponibilidad de agua, tiene sombra, observaciones.
- Baja de potrero (`DELETE /{id}`).

### 2. Activar el resto del menu de Ganaderia
Definir y dar ruta real a los 3 items hoy deshabilitados en `_layout.tsx`:
- **Trazabilidad**
- **Sanidad** (hay overlap con la feature [32](32_ganaderia_sanidad_notificaciones_offline_mobile.md), que ya pide pantallas mobile de sanidad — evaluar si esta feature absorbe esa tarea o si 32 se mantiene separada)
- **Alimentacion**

Definir por cada uno si el alcance inicial es una pantalla de consulta (listado + detalle, como Potreros hoy) o si ya incluye alta/edicion desde el arranque.

### 3. Burbujas de tareas a la izquierda del mapa
El usuario pidio agregar "burbujas a la izquierda que definan ciertas tareas" en la pantalla de mapa de potreros. **Falta definir**: que tareas son (¿sanidad pendiente por potrero, alertas de sobrecarga, ordenes de trabajo asociadas al potrero, alimentacion pendiente?), que informacion muestra cada burbuja, y que pasa al tocarla (¿filtra el mapa, abre un listado, navega a otra pantalla?). Se deja como punto abierto para la conversacion de prioridades.

## Fuera de alcance (salvo que se decida ampliar)
- Reproduccion y genealogia en mobile (features [33](33_ganaderia_reproduccion_offline_laboratorio_genetica_avanzada.md)/[34](34_ganaderia_ficha_tecnica_reproductiva_avanzada.md), ya cubiertas por separado).
- Offline-first para los formularios de alta/edicion (evaluar si se necesita en esta feature o se deriva a otra, siguiendo el patron de las features 32/35/36 que ya separan "core" de "offline avanzado").

## Referencias Tecnicas
- Backend: `backend/src/main/java/com/campoapp/ganaderia/controller/PotreroController.java`, entidad `Potrero.java` (incluye `capacidadAnimales`, `cargaAnimalActual`, `disponibilidadAgua`, `tieneSombra`, `superficieHa`, `tipoUso`, `estado`, `recursoForrajero`, `observaciones`, `poligono`). El % de ocupacion no esta persistido, se calcula en el cliente (`cargaAnimalActual / capacidadAnimales * 100`).
- Web: `frontend/src/app/pages/ganaderia-potreros-page/ganaderia-potreros-page.component.ts` (patron de alta/edicion a portar).
- Mobile: `mobile/app/(tabs)/potreros.tsx`, `mobile/shared/components/lotes-field-map.native.tsx` / `.web.tsx` / `.types.ts`, `mobile/app/(tabs)/_layout.tsx` (definicion del menu Drawer).

## Validacion Tecnica (a definir segun alcance final)
- Build mobile (`expo` / type-check).
- Prueba manual en dispositivo/emulador de alta, edicion y baja de un potrero.
- Verificacion de que los items de menu activados navegan a pantallas reales.
