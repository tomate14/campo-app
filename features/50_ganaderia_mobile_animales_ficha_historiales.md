# 50 - Ganaderia Mobile: Listado de Animales con Ficha e Historiales

## Estado
Pendiente.

## Origen
Pedido del usuario (2026-07-16): reorganizar el menu GANADERIA del Drawer mobile y agregar una vista de consulta de animales. Hoy el menu muestra 4 items (Trazabilidad, Sanidad, Alimentacion, Potreros); deben quedar solo **Potreros** y una nueva opcion **Animales**.

## Alcance (solo mobile; el backend ya expone todo lo necesario)

### 1. Menu Drawer
En `mobile/app/(tabs)/_layout.tsx`, seccion GANADERIA: quitar Trazabilidad, Sanidad y Alimentacion del menu (las pantallas y las burbujas del mapa de potreros NO se tocan, siguen accesibles desde el mapa) y agregar **Animales** -> `/(tabs)/animales`. Queda: Animales, Potreros.

### 2. Pantalla "Animales" (`mobile/app/(tabs)/animales.tsx`, ruta de Drawer, no modal)
- Lista de **todos los animales del sistema** (`useAnimales()`, dataset ya replicado offline por la feature 24).
- **Rows colapsables**: la fila colapsada muestra lo minimo (caravana, raza, potrero, badge de estado); al tocarla se expande inline una **card resumen** con la informacion basica completa: caravana, RFID, sexo, raza, estado, fecha de nacimiento, fecha de compra, peso actual, potrero actual, madre/padre (caravanas) y observaciones. Solo una row expandida a la vez. Animacion simple (LayoutAnimation o expansion condicional), estilo premium dark consistente.
- **Boton de filtros arriba** (icono real, no lupa suelta): abre un sheet inferior con dos filtros combinables:
  - **Caravana**: input de texto (filtro local por `includes`).
  - **Potrero**: `PotreroSelect` del form-kit (filtra por `potreroId`).
  - Chips de filtros activos visibles bajo el header con opcion de limpiarlos.
- Contador "N animales" en el header.

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

## Decisiones
- Los historiales se consultan on-demand: NO entran en la Sync Down de la feature 24 (serian N requests por animal). Offline muestran el error de red estandar; la lista de animales si funciona offline porque ya esta replicada.
- Se reutiliza el patron visual de cards/chips del resto de ganaderia mobile; sin componentes duplicados (form-kit para el PotreroSelect del filtro).

## Fuera de alcance
- Edicion del animal desde la ficha (el alta/edicion ya existe via burbuja Trazabilidad del mapa).
- Paginacion del listado (el volumen actual no lo requiere; candidato a feature futura si crece).
- Replicacion offline de los historiales.

## Referencias Tecnicas
- Backend (sin cambios): `TrazabilidadAnimalController` (`GET /animales`, `GET /animales/{id}`, `/movimientos`, `/historial-medico`), `AlimentacionController` (`GET /pesajes?animalId=`), `SanidadController` (`GET /aplicaciones|tratamientos|diagnosticos?animalId=`). DTOs: `AnimalDetalleResponse`, `MovimientoAnimalResponse`, `HistorialMedicoAnimalResponse`, `PesajeResponse`, `AplicacionVacunaResponse`, `TratamientoMedicamentoResponse`, `DiagnosticoSanitarioResponse`.
- Mobile: `mobile/app/(tabs)/_layout.tsx` (Drawer), `mobile/shared/hooks/useAnimales.ts`, `mobile/shared/api/ganaderia.ts`, form-kit (`PotreroSelect`), patron de sheet inferior de `potreros.tsx` (capas) para el sheet de filtros.

## Validacion Tecnica (al implementar)
- `npx tsc --noEmit` mobile limpio y jest verde.
- Prueba manual pendiente en dispositivo: expandir/colapsar rows, filtros combinados, apertura de cada historial.
