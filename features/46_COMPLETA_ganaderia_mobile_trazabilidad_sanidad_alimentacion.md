# 46 - Ganaderia Mobile: Trazabilidad, Sanidad y Alimentacion

## Estado
Realizada.

## Origen
Al implementar la feature [45](45_ganaderia_mobile_menu_potreros_alta_edicion.md) (menu de ganaderia mobile), el usuario decidio acotar el alcance de 45 a Potreros (alta/edicion) y a la burbuja "Agregar Reproduccion". El resto de las burbujas del mapa de potreros (Trazabilidad, Sanidad, Alimentacion) y la activacion de esos mismos 3 items en el menu Drawer (`mobile/app/(tabs)/_layout.tsx`) quedan derivados a esta feature nueva.

## Alcance
### 1. Activar en el menu Drawer
Dar ruta real a los 3 items hoy deshabilitados en `mobile/app/(tabs)/_layout.tsx` (sin `route`, icono gris): **Trazabilidad**, **Sanidad**, **Alimentacion**. Definir con el usuario si cada uno abre directo la pantalla de "nueva actividad" o si primero muestra un listado/consulta (como Potreros hoy).

### 2. Burbujas de "nueva actividad" en el mapa de potreros
Agregar a la rail de burbujas de `mobile/app/(tabs)/potreros.tsx` (donde la feature 45 ya deja la burbuja "Agregar Reproduccion" funcional) las 3 restantes, siguiendo el mismo patron visual de "Registrar evento" (`mobile/app/agricola/nueva-siembra.tsx`: pantalla completa, chips de seleccion, `CardGrid`/`SelectableCard` de tipos, formulario condicional):

- **Agregar Trazabilidad**: alta de un nuevo animal. Portar el formulario equivalente de `frontend/src/app/pages/ganaderia-trazabilidad-page/`.
- **Sanidad**: nueva actividad con opciones **Nueva vacuna**, **Nuevo tratamiento**, **Nueva aplicacion**, **Nuevo diagnostico**. Portar de los modales de `frontend/src/app/pages/ganaderia-sanidad-page/` (`vacunaModalOpen`, `tratamientoModalOpen`, `aplicacionModalOpen`, `diagnosticoModalOpen`). Hay overlap con la feature [32](32_ganaderia_sanidad_notificaciones_offline_mobile.md) (pantallas mobile de sanidad, ya pendiente) — evaluar si esta feature la absorbe o si 32 se mantiene separada.
- **Agregar Alimentacion**: nueva actividad con opciones **Nuevo pesaje**, **Registrar suministro**, **Nueva dieta**. Portar de `frontend/src/app/pages/ganaderia-alimentacion-page/`.

## Referencias Tecnicas
- Patron de picker de animal por chips + API `GET /api/v1/ganaderia/trazabilidad/animales` (`AnimalResponse`: `id`, `caravana`, `sexo`, `raza`, `potreroId`, `potreroNombre`, `estado`) — ya agregado como parte de la feature 45 para el picker de Reproduccion, reutilizable aca.
- Backend: `backend/src/main/java/com/campoapp/ganaderia/controller/TrazabilidadAnimalController.java`, `SanidadController.java`, `AlimentacionController.java`.
- Mobile: `mobile/app/(tabs)/_layout.tsx` (menu Drawer), `mobile/app/(tabs)/potreros.tsx` (rail de burbujas).

## Decision tecnica: clon exacto de los campos web, sin listados intermedios
El usuario pidio explicitamente que cada dato a registrar sea igual a la web, incluyendo el patron de selector con buscador donde la web usa `app-remote-search-select`. Se investigaron a fondo los 3 paginas Angular (`ganaderia-trazabilidad-page`, `ganaderia-sanidad-page`, `ganaderia-alimentacion-page`) y sus DTOs backend exactos para clonar campo por campo (nombres, opcionalidad y catalogos). Tanto el menu Drawer como las burbujas del mapa de potreros navegan directo a la pantalla de "nueva actividad" correspondiente (no hay pantallas de listado/consulta para estas 3 entidades en mobile todavia, igual que ya ocurria con Reproduccion en la feature 45).

## Implementado
- `mobile/shared/components/ganaderia-form-kit.tsx` (nuevo): se extrajeron a un modulo compartido todos los componentes de formulario que antes vivian solo en `nueva-reproduccion.tsx` (`SectionTitle`, `TextField`, `TextAreaField`, `OptionChips`, `ChipCheck`, `SelectableCard`, `DateField`, `DatePickerSheet`, `PickerColumn`, estilos `formKitStyles`) mas un `CatalogSelect<T>` generico que reemplaza al `app-remote-search-select` de la web (buscador + lista de resultados, con `hideWhenEmpty` opcional). Sobre ese generico se arman los selectores tipados `AnimalSelect`, `PersonSelect`, `RazaSelect`, `PotreroSelect`, `VacunaSelect` y `StaticCatalogSelect` (para catalogos locales tipo alimento/metodo de pesaje/dieta, equivalente al `[options]` estatico de la web). `nueva-reproduccion.tsx` se refactorizo para consumir este kit en vez de definiciones locales duplicadas.
- `mobile/shared/types/ganaderia.ts`: se agregaron `VacunaCatalogo(Request)`, `AplicacionVacuna(Request/Response)`, `TratamientoMedicamento(Request/Response)`, `DiagnosticoSanitario(Request/Response)`, `Dieta(Request)` + `DietaIngrediente(Request/Response)`, `RegistroAlimentacion(Request/Response)`, `Pesaje(Request/Response)` — con los mismos nombres de campo que los DTOs Java (`veterinario`, `operario`, `responsable` como strings de id de operario segun corresponda a cada endpoint, `fechaAplicacion`/`fechaInicio`/`fechaDiagnostico` segun cada DTO, etc.).
- `mobile/shared/api/ganaderia.ts`: `getVacunas`/`createVacuna`, `createAplicacion`, `createTratamiento`, `createDiagnostico`, `getDietas`/`createDieta`, `createRegistroAlimentacion`, `createPesaje`, todos contra los endpoints reales de `SanidadController`/`AlimentacionController`.
- `mobile/shared/hooks/useSanidad.ts` y `useAlimentacion.ts` (nuevos).
- `mobile/shared/api/operarios.ts` y `useOperarios.ts`: se agrego el parametro opcional `rol` (el backend ya soporta filtrar por `rolOperativo` via `OperarioGestionController`), usado para el selector de Veterinario en Diagnostico, igual que la web filtra `rol:'VETERINARIO'`.
- `mobile/app/ganaderia/nueva-trazabilidad.tsx` (nueva pantalla): clon de "Nuevo animal" — caravana, raza (`RazaSelect`), sexo, fecha de nacimiento, fecha de compra, peso actual, RFID, potrero actual (`PotreroSelect`), madre/padre (`AnimalSelect` con `hideWhenEmpty`), observaciones.
- `mobile/app/ganaderia/nueva-sanidad.tsx` (nueva pantalla): selector de 4 tipos (Vacuna/Aplicacion/Tratamiento/Diagnostico) con los campos exactos de cada modal web, incluyendo el picker de vacuna del catalogo (`VacunaSelect`) y el filtro de veterinario por rol en Diagnostico.
- `mobile/app/ganaderia/nueva-alimentacion.tsx` (nueva pantalla): selector de 3 tipos (Dieta/Suministro/Pesaje). Dieta incluye ingredientes dinamicos (agregar/quitar fila, cada fila con alimento del catalogo estatico + proporcion % + costo/kg). Suministro y Pesaje usan los catalogos estaticos de alimento y metodo de pesaje, igual que la web.
- `mobile/app/_layout.tsx`: registro de las 3 pantallas nuevas como modal.
- `mobile/app/(tabs)/_layout.tsx`: Trazabilidad, Sanidad y Alimentacion en el menu Drawer ahora navegan a sus pantallas respectivas (antes sin `route`).
- `mobile/app/(tabs)/potreros.tsx`: las 3 burbujas restantes del mapa (Trazabilidad, Sanidad, Alimentacion) navegan a sus pantallas en vez de mostrar "Disponible proximamente"; se elimino el campo `comingSoon` ya sin uso.

## Validacion Tecnica
- `npx tsc --noEmit -p tsconfig.json` sobre `mobile/` sin errores.
- Verificacion visual pendiente: mismo problema preexistente de entorno con `expo start --web` (falta el binario nativo `lightningcss.win32-x64-msvc.node`), no relacionado a esta feature.
- Pendiente de prueba manual en dispositivo/emulador real: alta de animal desde Trazabilidad, los 4 tipos de registro sanitario y los 3 tipos de registro de alimentacion contra el backend real.
