# 50 - Ganaderia Mobile: Listado de Animales con Ficha e Historiales

## Estado
Realizada.

## Origen
Pedido del usuario (2026-07-16): reorganizar el menu GANADERIA del Drawer mobile y agregar una vista de consulta de animales. Hoy el menu muestra 4 items (Trazabilidad, Sanidad, Alimentacion, Potreros); deben quedar solo **Potreros** y una nueva opcion **Animales**.

## Alcance
Originalmente solo mobile (el backend ya exponia los historiales); ampliada a pedido del usuario con **paginacion server-side de a 20** para el listado, lo que suma un endpoint nuevo en el backend (ver seccion 5).

### 1. Menu Drawer
En `mobile/app/(tabs)/_layout.tsx`, seccion GANADERIA: quitar Trazabilidad, Sanidad y Alimentacion del menu (las pantallas y las burbujas del mapa de potreros NO se tocan, siguen accesibles desde el mapa) y agregar **Animales** -> `/(tabs)/animales`. Queda: Animales, Potreros.

### 2. Pantalla "Animales" (`mobile/app/(tabs)/animales.tsx`, ruta de Drawer, no modal)
- Lista de **todos los animales del sistema**, **paginada de a 20 contra el servidor** (`GET /animales/page`); los filtros viajan como query params. Fallback offline: si no hay red, cae a la replica local completa (`useAnimales()`, dataset de la feature 24) con filtrado y paginacion en el cliente y un aviso "Sin conexion: mostrando datos de la ultima sincronizacion".
- **Controles de paginacion** al pie de la lista: anterior/siguiente (deshabilitados en primera/ultima pagina) + indicador "Pagina N de M". El contador del header muestra el total real del servidor (`totalElements`).
- **Rows colapsables**: la fila colapsada muestra lo minimo (caravana, raza, potrero, badge de estado); al tocarla se expande inline una **card resumen** con la informacion basica completa: caravana, RFID, sexo, raza, estado, fecha de nacimiento, fecha de compra, peso actual, potrero actual, madre/padre (caravanas) y observaciones. Solo una row expandida a la vez. Animacion simple (LayoutAnimation o expansion condicional), estilo premium dark consistente.
- **Boton de filtros arriba** (icono real, no lupa suelta): abre un sheet inferior con dos filtros combinables:
  - **Caravana**: input de texto (substring case-insensitive, resuelto server-side; en fallback offline, `includes` local).
  - **Potrero**: `PotreroSelect` del form-kit (filtra por `potreroId`, resuelto server-side; local en fallback offline).
  - Chips de filtros activos visibles bajo el header con opcion de limpiarlos. Aplicar/limpiar filtros resetea a la pagina 0.
- Contador "N animales" en el header (total del servidor).

### 3. Botones de historiales dentro de la card expandida
Fila de botones chicos (chips con icono + label, NO botones grandes) que abren la pantalla de historial del animal:
- **Clinico** (`GET /ganaderia/trazabilidad/animales/{id}/historial-medico`)
- **Pesos** (`GET /ganaderia/alimentacion/pesajes?animalId=`)
- **Movimientos** (`GET /ganaderia/trazabilidad/animales/{id}/movimientos`)
- **Vacunas** (`GET /ganaderia/sanidad/aplicaciones?animalId=`)
- **Tratamientos** (`GET /ganaderia/sanidad/tratamientos?animalId=`)
- **Diagnosticos** (`GET /ganaderia/sanidad/diagnosticos?animalId=`)

### 4. Pantalla de historial (`mobile/app/ganaderia/animal-historial.tsx`, modal)
Una unica pantalla parametrizada por `useLocalSearchParams` (`animalId`, `caravana`, `tipo`). Header con caravana + tipo de historial. Cada tipo renderiza su lista como timeline/cards (fecha + datos principales + observaciones), con estado vacio "Sin registros". Los datos se piden on-demand (react-query por `[tipo, animalId]`).

### 5. Paginacion server-side (ampliacion pedida por el usuario)
- Backend: nuevo `GET /api/v1/ganaderia/trazabilidad/animales/page` siguiendo la convencion de los `/page` de `SanidadController`: `ApiResponse<Page<AnimalResponse>>`, params `caravana` (substring case-insensitive), `potreroId` (asignacion activa via EXISTS sobre `animales_potreros`, coincide con lo que muestra la respuesta), `estado`, `page` (default 0) y `size` (default 20, acotado 1..100). Orden estable `caravana ASC, id ASC` para paginacion deterministica, `countQuery` explicito por los fetch joins de madre/padre, mapeo batch de asignaciones sin N+1.
- Mobile: la pantalla consume la pagina del servidor (`useAnimalesPage`, `placeholderData` para no parpadear al cambiar de pagina); filtros server-side con reset a pagina 0.

## Decisiones
- Los historiales se consultan on-demand: NO entran en la Sync Down de la feature 24 (serian N requests por animal). Offline muestran el error de red estandar; la lista de animales si funciona offline porque ya esta replicada.
- Se reutiliza el patron visual de cards/chips del resto de ganaderia mobile; sin componentes duplicados (form-kit para el PotreroSelect del filtro).

## Fuera de alcance
- Edicion del animal desde la ficha (el alta/edicion ya existe via burbuja Trazabilidad del mapa).
- Replicacion offline de los historiales.

## Referencias Tecnicas
- Backend: nuevo `GET /animales/page` en `TrazabilidadAnimalController` + `AnimalRepository.findFilteredPage` + `AnimalService.listAnimalesPaginados`. Sin cambios el resto: `TrazabilidadAnimalController` (`GET /animales`, `GET /animales/{id}`, `/movimientos`, `/historial-medico`), `AlimentacionController` (`GET /pesajes?animalId=`), `SanidadController` (`GET /aplicaciones|tratamientos|diagnosticos?animalId=`). DTOs: `AnimalDetalleResponse`, `MovimientoAnimalResponse`, `HistorialMedicoAnimalResponse`, `PesajeResponse`, `AplicacionVacunaResponse`, `TratamientoMedicamentoResponse`, `DiagnosticoSanitarioResponse`.
- Mobile: `mobile/app/(tabs)/_layout.tsx` (Drawer), `mobile/shared/hooks/useAnimales.ts`, `mobile/shared/api/ganaderia.ts`, form-kit (`PotreroSelect`), patron de sheet inferior de `potreros.tsx` (capas) para el sheet de filtros.

## Implementado
Desarrollada con el agente mobile, coordinada por el orquestador.

- `mobile/app/(tabs)/_layout.tsx`: seccion GANADERIA reducida a **Animales** (`/(tabs)/animales`, icono `Beef` de lucide — representa ganado mejor que `Tag`, que en la app identifica caravana) y **Potreros**. Las pantallas de Trazabilidad/Sanidad/Alimentacion y las burbujas del mapa quedaron intactas (siguen accesibles desde el mapa de potreros). Nueva `Drawer.Screen` registrada.
- `mobile/shared/api/ganaderia.ts`: `getAnimalDetalle`, `getMovimientosAnimal`, `getHistorialMedicoAnimal`, `getPesajes`, `getAplicaciones`, `getTratamientos`, `getDiagnosticos` (query param `animalId` verificado contra los controllers).
- `mobile/shared/types/ganaderia.ts`: tipos espejo de `MovimientoAnimalResponse` (con enum de `tipoMovimiento` INGRESO/EGRESO/TRANSFERENCIA/SANIDAD/CONTROL), `HistorialMedicoAnimalResponse` y `AnimalDetalleResponse`, con los campos exactos de los records Java.
- `mobile/shared/hooks/useAnimalHistorial.ts` (nuevo): hook parametrizado por tipo con mapa de fetchers tipado, query key `['animal-historial', tipo, animalId]` y `enabled: Boolean(animalId)`.
- `mobile/app/(tabs)/animales.tsx` (nueva pantalla de Drawer): listado de todos los animales con **rows colapsables** (una sola expandida a la vez, `LayoutAnimation` con el guard de `UIManager` para Android), fila colapsada con caravana/raza/potrero/badge de estado, y ficha resumen expandida con la info basica completa (caravana, RFID, sexo, raza, estado, fechas, peso, potrero, madre/padre, observaciones). **Boton de filtros** arriba que abre un sheet inferior (patron del sheet de capas de potreros) con filtro por caravana (texto, local) y por potrero (`PotreroSelect` del form-kit), combinables, con chips de filtros activos removibles bajo el header y contador de resultados. Debajo de la ficha, **fila de chips chicos con scroll horizontal** que abren los historiales: Clinico, Pesos, Movimientos, Vacunas, Tratamientos, Diagnosticos.
- `mobile/app/ganaderia/animal-historial.tsx` (nueva pantalla modal, registrada en `_layout.tsx`): parametrizada por `animalId`/`caravana`/`tipo`, renderiza cada historial como cards timeline con sus campos principales (severidad de diagnosticos con badge coloreado por los hex de gravedad, `tipoMovimiento` como badge, origen→destino de movimientos resolviendo nombres de potrero contra la replica local), estado vacio "Sin registros" y mensaje de error de red estandar.
- Offline: sin cambios en `RULES` ni `DATASETS` — no hay mutaciones nuevas y los historiales son on-demand por decision de la spec; el listado de animales ya funciona offline por la replica de la feature 24.

### Paginacion server-side (segunda iteracion, agentes backend + mobile)
- Backend: `AnimalRepository.findFilteredPage` (query paginada con `(:param IS NULL OR ...)`, EXISTS sobre `AnimalPotrero` activo para `potreroId` — la misma condicion que llena el `potreroId` de la respuesta —, orden estable `caravana ASC, id ASC`, `countQuery` explicito), `AnimalService.listAnimalesPaginados` (size acotado 1..100, mapeo batch de asignaciones sin N+1) y endpoint `GET /animales/page` en el controller. Test `AnimalServicePaginacionTest` (3 tests).
- Mobile: tipo generico `PageResponse<T>`, `getAnimalesPage`, hook `useAnimalesPage` con `placeholderData` (la lista no parpadea al cambiar de pagina), pantalla con paginador al pie (anterior/siguiente deshabilitados en extremos + "Pagina N de M" + mini spinner durante el fetch), filtros server-side con reset a pagina 0 y colapso de la ficha al paginar, contador del header con `totalElements`.
- **Fallback offline**: como las queries se pausan sin red (feature 24, `networkMode: 'online'` + onlineManager), la condicion de fallback es `isError || !online` (via `useSyncStatus`); en ese modo la pantalla usa la replica local completa con el filtrado y paginacion de a 20 en el cliente, con aviso "Sin conexion: mostrando datos de la ultima sincronizacion".

## Validacion Tecnica
- Backend: `mvn -q compile` limpio; `AnimalServicePaginacionTest` 3/3 verde.
- Mobile: `npx tsc --noEmit -p tsconfig.json` sin errores; jest 7/7 verde.
- Prueba manual pendiente en dispositivo: expandir/colapsar rows, filtros combinados, paginacion (incluido modo avion con fallback a replica) y apertura de cada historial.
