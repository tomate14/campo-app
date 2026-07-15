# 47 - Ganaderia: Alertas en Potreros

## Estado
Pendiente.

## Origen
Pedido directo del usuario (2026-07-15): poder registrar alertas sobre un potrero (algo que requiere atencion: aguada rota, alambrado caido, animal enfermo suelto, etc.) desde web y mobile, verlas como pin de campanita sobre el mapa coloreada por gravedad, y que la carga funcione offline (integrada a la feature [24](24_COMPLETA_sincronizacion_offline_first.md)).

## Objetivo
Que cualquier usuario pueda dejar una alerta georreferenciada sobre un potrero en segundos, y que esa alerta sea visible en el mapa de potreros de web y mobile como una campanita del color de su gravedad.

## Modelo de datos

Nueva entidad `AlertaPotrero` (dominio `ganaderia`, tabla `alertas_potrero`, migracion Flyway `V42`):

| Campo | Tipo | Notas |
|---|---|---|
| `id` | VARCHAR(36) PK | `DEFAULT (UUID())` como el resto del dominio |
| `potrero_id` | VARCHAR(36) FK -> potreros | requerido |
| `usuario_id` | VARCHAR(36) | **usuario logueado, tomado del token en el backend** (principal del SecurityContext = userId, mismo patron que `IdempotencyFilter.currentUserId()`). No viaja en el request: el cliente no puede elegir otro usuario. |
| `fecha` | DATE | requerida; el formulario la precarga con hoy |
| `gravedad` | VARCHAR(40) | enum **reutilizando los mismos 4 niveles de lotes** (`SeveridadPlaga`): `BAJA`, `MEDIA`, `ALTA`, `CRITICA` |
| `observacion` | TEXT | requerida (es el contenido de la alerta) |
| `latitud` / `longitud` | DECIMAL | ubicacion del pin (ver reglas por plataforma abajo); si faltan, el pin cae en el centroide del potrero |
| `estado` | VARCHAR(20) | `ABIERTA` / `RESUELTA`, default `ABIERTA` (solo las abiertas se pintan en el mapa) |
| `created_at` / `updated_at` | TIMESTAMP | auditoria |

### Colores por gravedad (misma funcion que los pins de lotes)
Se adopta el mapeo de `severityColorFor` de `mobile/app/(tabs)/lotes.tsx` (decision explicita: existe un segundo mapeo `loteHealthColor` que difiere en BAJA, no usar ese):
- `BAJA` -> `#9FE870` · `MEDIA` -> `#FFB84D` · `ALTA` -> `#FF8A4C` · `CRITICA` -> `#FF6B6B`

## Backend

- `POST /api/v1/ganaderia/potreros/alertas` — crea la alerta. Request: `{ potreroId, fecha, gravedad, observacion, latitud?, longitud? }`. `usuarioId` se setea en el service desde el SecurityContext. `@PreAuthorize("hasAuthority('update:animales')")` (mismo permiso que el resto de las mutaciones de ganaderia).
- `GET /api/v1/ganaderia/potreros/alertas` — lista con filtros opcionales `potreroId` y `estado`. Response incluye `potreroNombre` y `usuarioNombre` (resueltos por join) ademas de los campos crudos. `@PreAuthorize("hasAuthority('read:animales')")`.
- `PUT /api/v1/ganaderia/potreros/alertas/{id}/resolver` — marca `RESUELTA` (para poder sacar el pin del mapa sin borrar historial).
- Estructura estandar del dominio: entity + repository + service (interfaz + impl) + DTOs records + controller en `com.campoapp.ganaderia`.
- La idempotencia del outbox mobile la cubre el `IdempotencyFilter` generico existente: no requiere trabajo por endpoint.

## Mobile

### Nueva burbuja "Alertas"
Quinta burbuja en la rail del mapa de potreros (`mobile/app/(tabs)/potreros.tsx`), icono `Bell` de lucide, color `#FF8A4C`, mismo patron visual de burbuja existente (circulo tapando la pildora). Navega a la nueva pantalla modal `mobile/app/ganaderia/nueva-alerta.tsx` (registrar en `app/_layout.tsx`).

### Pantalla "Nueva alerta" (patron "nueva actividad" + form-kit)
- Potrero: `PotreroSelect` del form-kit (el operario elige sobre que potrero alerta).
- Gravedad: `OptionChips` con los 4 niveles y su color.
- Fecha: `DateField` + `DatePickerSheet`, precargada con hoy.
- Observacion: `TextAreaField`, requerida.
- Ubicacion del pin: boton "Capturar ubicacion GPS" con el mismo patron de `plagas.tsx` (`expo-location`, `captureLocation`). Si el operario no captura GPS, el backend/render usa el centroide del potrero como fallback — igual que hacen las detecciones de lotes cuando no tienen coordenadas.
- Submit verde estandar.

### Render de pins en el mapa de potreros
- `usePotreroAlertas()` (hook nuevo sobre `GET /ganaderia/potreros/alertas?estado=ABIERTA`).
- Reutilizar el patron de pins de `lotes-field-map.native.tsx` (`Marker` + cabeza circular coloreada + glow + punta), pero con icono **`Bell`**. Requiere generalizar minimamente el mapa compartido: agregar un prop `alertas: AlertaMapItem[]` (o extender el item de pin con un icono opcional) sin romper el uso actual de `detections` en lotes. Agrupar por coordenada y badge de cantidad, igual que las detecciones.
- Tap en el pin: preview inferior con gravedad (badge coloreado), fecha, usuario, observacion y boton "Marcar resuelta" (mismo patron de `DetectionPreview` de lotes, con `zIndex` 10000 sobre las burbujas).

### Offline-first (obligatorio, feature 24)
- **Outbox**: agregar a `RULES` de `mobile/shared/sync/offlineInterceptor.ts` la regla `{ pattern: /^\/ganaderia\/potreros\/alertas$/, label: 'Alerta de potrero' }`. **ATENCION al orden**: debe insertarse **antes** de la regla existente `/^\/ganaderia\/potreros(\/[^/]+)?$/` (label 'Potrero'), porque esa regex tambien matchea `/ganaderia/potreros/alertas` y `RULES.find` devuelve la primera coincidencia. Alternativa equivalente: excluir `alertas` de la regla de potrero. Documentar la eleccion en el codigo.
- Si el potrero fue creado offline, `potreroId` llega como tempId en el payload: el remap FIFO existente lo resuelve solo (no requiere trabajo nuevo, pero agregar test).
- **Sync Down**: agregar dataset `{ queryKey: ['potreros-alertas', { estado: 'ABIERTA' }], fetch: () => getAlertasPotreros({ estado: 'ABIERTA' }) }` a `DATASETS` de `syncDown.ts`, usando exactamente la misma query key que el hook, para que los pins se rendericen offline.
- La alerta creada offline no se pinta en el mapa hasta sincronizar (consistente con la decision "sin UI optimista" de la feature 24); el banner/badge global ya comunica el pendiente.

## Web (Angular)

### Alta desde click en el potrero
En `ganaderia-potreros-page`, el click sobre el poligono de un potrero (`onPotreroClick`, layer `potreros-fill`) pasa a abrir el **modal de alta de alerta** con:
- El potrero preseleccionado (nombre visible, no editable).
- Las **coordenadas del click** (`event.lngLat`) como ubicacion del pin — en web el usuario marca exactamente donde esta el problema.
- Campos: gravedad (select/chips con los 4 niveles coloreados), fecha (default hoy), observacion (textarea, requerida).
- Estilo modal identico a los modales existentes de la pagina (alta/detalle de potrero, patron feature 38).
- Nota de comportamiento: hoy ese click solo resalta la card lateral (`selectedPotrero`); esa seleccion se mantiene, pero la accion primaria del click pasa a ser la alerta. El modo dibujo (`mapClick` en mapa vacio + doble click) no se toca.

### Render de pins
- Al cargar la pagina y al guardar una alerta, renderizar las alertas `ABIERTA` como `<mgl-marker>` en sus coordenadas (fallback centroide), con una **campanita SVG** dentro de un pin circular coloreado por gravedad (mismos hex de arriba), estilo consistente con el lenguaje premium dark (glow sutil del color).
- Click en el pin: popup/detalle con gravedad, fecha, usuario, observacion y accion "Marcar resuelta".
- Servicio Angular nuevo en `core/services` + modelos en `core/models/ganaderia.models.ts` espejando los DTOs.

## Fuera de alcance
- Notificaciones push/automaticas por alertas (candidato a integrarse con la bandeja de la feature [32](32_ganaderia_sanidad_notificaciones_offline_mobile.md)).
- Edicion de alertas (solo crear y resolver en v1).
- Alertas sobre lotes agricolas (esto es solo potreros; lotes ya tiene detecciones de plagas).
- Tap-en-el-mapa para elegir ubicacion en mobile (no existe ese gesto en el mapa nativo hoy; v1 usa GPS o centroide).

## Referencias Tecnicas
- Gravedad: `backend/.../agricultura/entity/plagas/SeveridadPlaga.java` (BAJA/MEDIA/ALTA/CRITICA), colores `severityColorFor` en `mobile/app/(tabs)/lotes.tsx`.
- Pins: `mobile/shared/components/lotes-field-map.native.tsx` (`Marker` + `DetectionPin`), `lotes-field-map.types.ts` (`DeteccionMapItem`).
- GPS: `captureLocation` en `mobile/app/agricola/plagas.tsx` (expo-location, `origenGeolocalizacion: 'MOBILE_GPS'`).
- Usuario logueado en backend: patron `currentUserId()` de `common/idempotency/IdempotencyFilter.java` (principal = userId String).
- Web: `frontend/src/app/pages/ganaderia-potreros-page/` (`onPotreroClick`, modales existentes, `mgl-marker` de vertices como referencia de markers).
- Offline: `mobile/shared/sync/offlineInterceptor.ts` (RULES, orden importa), `mobile/shared/sync/syncDown.ts` (DATASETS).
- Form-kit mobile: `mobile/shared/components/ganaderia-form-kit.tsx`.
- Migracion siguiente: `V42` (la V41 es de idempotencia).

## Validacion Tecnica (al implementar)
- `mvn compile` + test de service de alertas (usuario tomado del token, no del request).
- `npx tsc --noEmit` mobile y `npm run type-check` web.
- Test de outbox: la URL `/ganaderia/potreros/alertas` debe matchear la regla de alertas y NO la de potrero (regresion del orden de RULES).
- Prueba manual pendiente documentada: alta offline con modo avion y render del pin tras sincronizar.
