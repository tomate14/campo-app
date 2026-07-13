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
- Color por estado del potrero: ya existe tanto en web (`STATUS_COLORS` en `ganaderia-potreros-page.component.ts`) como en mobile (`estadoColor()` en `potreros.tsx`), con el mismo mapeo: `ACTIVO` verde `#9FE870`, `DESCANSO` azul `#6EA8FF`, `MANTENIMIENTO` naranja `#FFB84D`, `INACTIVO` gris `#A6B0CF`. Al implementar, verificar que este color este realmente aplicado al relleno del poligono en el mapa mobile (no solo a un badge/listado), ya que `lotes-field-map.native.tsx` es compartido con lotes agricolas y su color por defecto viene de salud/severidad de plagas, no del estado del potrero.

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
En la pantalla de mapa de potreros se agregan 4 burbujas de acceso rapido, cada una abriendo una pantalla de "nueva actividad" con el mismo patron visual que ya usa **Registrar evento** de lotes agricolas (`mobile/app/agricola/nueva-siembra.tsx`): pantalla completa (no modal), selector del elemento relacionado via chips, `CardGrid`/`SelectableCard` para elegir el tipo de actividad, y formulario condicional segun el tipo elegido.

- **Agregar Trazabilidad**: alta de un nuevo animal. Portar el formulario equivalente de `ganaderia-trazabilidad-page` (web).
- **Sanidad**: la pantalla de nueva actividad debe ofrecer elegir entre **Nueva vacuna**, **Nuevo tratamiento**, **Nueva aplicacion** o **Nuevo diagnostico**. Portar de los modales `vacunaModalOpen` / `tratamientoModalOpen` / `aplicacionModalOpen` / `diagnosticoModalOpen` de `ganaderia-sanidad-page` (web).
- **Agregar Alimentacion**: la pantalla de nueva actividad debe ofrecer **Nuevo pesaje**, **Registrar suministro** o **Nueva dieta**. Portar de `ganaderia-alimentacion-page` (web): `PesajeRequest`, registro de suministro, alta de dieta.
- **Agregar Reproduccion**: la pantalla de nueva actividad debe ofrecer **Nueva monta**, **Nueva inseminacion**, **Preñez**, **Parto** e **Indice**. Portar de `ganaderia-reproduccion-page` (web): `MontaRequest`, `InseminacionRequest`, control de preñez, `PartoRequest`, indices reproductivos.

Falta definir: si las burbujas quedan siempre visibles sobre el mapa o si dependen de tener un potrero seleccionado, y si el alta queda asociada al potrero tocado en el mapa o es independiente (por ejemplo, alta de animal sin necesidad de estar parado sobre un potrero especifico).

## Fuera de alcance (salvo que se decida ampliar)
- Genealogia avanzada y funcionalidad reproductiva de laboratorio/genetica (features [33](33_ganaderia_reproduccion_offline_laboratorio_genetica_avanzada.md)/[34](34_ganaderia_ficha_tecnica_reproductiva_avanzada.md)) — el registro basico de eventos reproductivos (monta, inseminacion, preñez, parto, indice) SI queda dentro del alcance de esta feature via la burbuja "Agregar Reproduccion".
- Offline-first para los formularios de alta/edicion (evaluar si se necesita en esta feature o se deriva a otra, siguiendo el patron de las features 32/35/36 que ya separan "core" de "offline avanzado").

## Referencias Tecnicas
- Backend: `backend/src/main/java/com/campoapp/ganaderia/controller/PotreroController.java`, entidad `Potrero.java` (incluye `capacidadAnimales`, `cargaAnimalActual`, `disponibilidadAgua`, `tieneSombra`, `superficieHa`, `tipoUso`, `estado`, `recursoForrajero`, `observaciones`, `poligono`). El % de ocupacion no esta persistido, se calcula en el cliente (`cargaAnimalActual / capacidadAnimales * 100`). `estado` es un `String` libre (sin enum), valores en uso: `ACTIVO`, `DESCANSO`, `MANTENIMIENTO`, `INACTIVO`.
- Web (patrones de alta/edicion a portar por dominio):
  - Potreros: `frontend/src/app/pages/ganaderia-potreros-page/ganaderia-potreros-page.component.ts`.
  - Trazabilidad: `frontend/src/app/pages/ganaderia-trazabilidad-page/`.
  - Sanidad: `frontend/src/app/pages/ganaderia-sanidad-page/` (modales de vacuna, tratamiento, aplicacion, diagnostico).
  - Alimentacion: `frontend/src/app/pages/ganaderia-alimentacion-page/` (dietas, suministros, pesajes).
  - Reproduccion: `frontend/src/app/pages/ganaderia-reproduccion-page/` (montas, inseminaciones, preñez, partos, indices).
- Mobile:
  - `mobile/app/(tabs)/potreros.tsx`, `mobile/shared/components/lotes-field-map.native.tsx` / `.web.tsx` / `.types.ts`, `mobile/app/(tabs)/_layout.tsx` (definicion del menu Drawer).
  - Patron de referencia para las burbujas de "nueva actividad": `mobile/app/agricola/nueva-siembra.tsx` (pantalla completa con chips de seleccion + `CardGrid`/`SelectableCard` de tipos + formulario condicional), usado hoy por el boton "Registrar evento" de `mobile/app/(tabs)/lotes.tsx`.

## Validacion Tecnica (a definir segun alcance final)
- Build mobile (`expo` / type-check).
- Prueba manual en dispositivo/emulador de alta, edicion y baja de un potrero.
- Verificacion de que los items de menu activados navegan a pantallas reales.
