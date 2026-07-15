# 24 - Sincronizacion: Offline-First Mobile

## Estado
Realizada.

## Origen
Reformulada el 2026-07-14 tras el analisis de mercado de apps de campo: la falta de offline real es la queja numero uno de los productores contra el software agropecuario existente, y es el moat central de competidores como FieldData (que lo resuelve delegando en la cola de WhatsApp). La version original de esta feature (SQLite/Realm, protocolo delta-sync, endpoint `/api/v1/sync`, compresion, Firebase) se descarta por sobre-ingenieria para el volumen real de la app (decenas de eventos por dia, catalogos de cientos de filas): esta version se apoya en la infraestructura que ya existe (React Query + axios + endpoints REST de Spring Boot) y la extiende.

## Objetivo
Que un operario sin señal en el campo pueda:
1. **Ver** los datos de referencia (lotes, potreros, animales, operarios, catalogos) actualizados a la ultima vez que el telefono tuvo conectividad, sin importar que pantallas haya visitado antes.
2. **Registrar** eventos (siembra, cosecha, plagas, vacunacion, tratamiento, diagnostico, pesaje, suministro, dieta, monta, inseminacion, preñez, parto, indice, alta de animal, alta/edicion de potrero y lote) que se sincronizan solos al recuperar señal, sin perder ni duplicar registros.

## Alcance
- **Solo mobile.** El panel web se asume siempre online (queda fuera de esta feature).
- **Dominios cubiertos: agricultura, ganaderia y operarios.** Clima, maquinaria, inventario y finanzas quedan fuera de v1 (el cache pasivo de React Query les sigue aplicando, pero no entran en la Sync Down proactiva ni en el Outbox).

## Arquitectura: tres patas

```
        +------------- ONLINE --------------+
        |                                   |
   SYNC DOWN (pull)                    OUTBOX (push)
   replica local de                    cola FIFO de
   datos de referencia                 mutaciones offline
        |                                   |
        v                                   ^
   Cache React Query   <-- lee --   Pantallas/formularios
   persistido (disco)                (sin cambios: 45/46)
        |                                   |
        +---------- UI DE ESTADO ----------+
        banner conectividad, lastSyncAt,
        bandeja de pendientes y errores
```

### Pata 1: Sync Down proactiva (nube -> telefono)

El cache pasivo de React Query solo guarda lo que el usuario ya miro y queda desactualizado frente a cargas hechas desde la web. La solucion es un `SyncDownService` que, cada vez que hay conectividad, descarga de forma automatica y silenciosa el set completo de datasets criticos usando `queryClient.prefetchQuery` sobre las **mismas query keys** que ya usan los hooks existentes (las pantallas y selectores de las features 45/46 leen la replica sin cambios).

**Disparadores:**
- App abre / vuelve a foreground.
- `NetInfo` detecta reconexion.
- Timer periodico mientras hay conexion.
- Pull-to-refresh manual.
- (v2, opcional) `expo-background-fetch`: sincroniza sin abrir la app, p.ej. de noche en el wifi del casco.

**Datasets criticos v1 (orden de prioridad de descarga):**

| Prioridad | Dominio | Endpoint GET |
|---|---|---|
| 1 | Agricultura | `/agricola/lotes` |
| 1 | Ganaderia | `/ganaderia/potreros` y `/ganaderia/potreros/mapa` |
| 1 | Ganaderia | `/ganaderia/trazabilidad/animales` |
| 2 | Operarios | `/operarios/gestion/operarios?estado=ACTIVO` |
| 2 | Ganaderia | `/ganaderia/sanidad/vacunas` |
| 2 | Ganaderia | `/ganaderia/trazabilidad/razas-bovinas` |
| 2 | Ganaderia | `/ganaderia/alimentacion/dietas` |
| 3 | Agricultura | `/agricola/plagas/catalogo` y `/agricola/plagas/detecciones` |

**Persistencia:** `@tanstack/react-query-persist-client` + AsyncStorage. Al abrir la app sin señal, React Query hidrata desde disco. Se guarda metadata `lastSyncAt` global y por dataset para mostrar "Ultima sincronizacion: hoy 08:32".

**Full fetch, no delta:** en v1 cada sync baja los catalogos completos (JSON de pocos cientos de KB). Todas las entidades ya tienen `updatedAt`, asi que el upgrade natural futuro es `?since=<lastSyncAt>` + merge, pero no se paga esa complejidad ahora.

### Pata 2: Outbox (telefono -> nube)

Patron outbox clasico sobre los endpoints REST existentes (no se crea endpoint `/sync`). Un wrapper comun sobre los hooks de mutacion existentes intercepta el fallo por falta de red:

```
Usuario guarda formulario
        |
        v
  hay conexion? --SI--> POST normal (como hoy)
        |
        NO
        v
  Se encola en el OUTBOX (AsyncStorage):
  { opId: uuid-cliente, endpoint, metodo, payload,
    createdAt, tempIds: [...], estado: PENDIENTE }
        |
        v
  UI responde "Guardado (pendiente de sincronizar)"
  + badge con contador de pendientes
```

Un `SyncUpService` drena la cola **FIFO, de a un item**, con los mismos disparadores que la Sync Down:

- **200 OK** -> se saca de la cola, se invalidan las query keys afectadas.
- **Error de red** -> se corta el drenado; reintento con backoff en la proxima señal.
- **400/422 (validacion)** -> el item pasa a la bandeja de ERRORES con el motivo; el usuario puede editarlo, reintentarlo o descartarlo. Nunca bloquea al resto de la cola.

**Mutaciones cubiertas v1:**

| Dominio | Operaciones |
|---|---|
| Agricultura | crear/editar lote, evento de siembra, registro de cosecha, propiedad de suelo, historial de cultivo, deteccion de plaga, aplicacion fitosanitaria, seguimiento de plaga |
| Ganaderia | crear/editar potrero, alta de animal, monta, inseminacion, control de preñez, parto, indice genetico, vacuna (catalogo), aplicacion de vacuna, tratamiento, diagnostico, dieta, registro de suministro, pesaje |
| Operarios | (solo lectura en mobile hoy; entra al Outbox cuando exista una mutacion mobile de operarios) |

Los `DELETE` quedan **fuera del Outbox** en v1: borrar requiere confirmacion visual del estado actual del servidor, se exige conexion.

### Pata 3: UI de estado

- Banner de conectividad (online / offline / sincronizando) reutilizable en todas las pantallas cubiertas.
- Indicador "Ultima sincronizacion: <fecha hora>" alimentado por la metadata de Sync Down.
- Pantalla "Pendientes de sincronizar": lista de items del Outbox con estado (pendiente / enviando / error), detalle del motivo de error y acciones reintentar/descartar.
- Badge con contador de pendientes visible desde el mapa.

## Decisiones tecnicas

**Idempotencia (no duplicar).** Caso peligroso: el POST llega al servidor pero la respuesta se pierde por señal intermitente; el cliente reintenta y duplica. Solucion: cada operacion encolada lleva un UUID de cliente (`opId`) enviado como header `Idempotency-Key`. El backend suma un soporte generico: tabla `idempotency_keys` (clave -> respuesta serializada + timestamp) consultada por un filtro/interceptor antes de ejecutar el handler; si la clave ya existe devuelve la respuesta cacheada. Es el **unico cambio de backend** de esta feature. Las claves expiran (p.ej. 30 dias) para no crecer sin limite.

**IDs temporales (dependencias entre operaciones offline).** Escenario: sin señal se crea un ternero y luego se registra el parto que lo referencia. El create encolado recibe un `tempId` local; las operaciones posteriores que lo referencian lo guardan en su campo `tempIds`. Como la cola drena FIFO, cuando el create sincroniza y el servidor devuelve el ID real, el `SyncUpService` reescribe los items pendientes que referenciaban ese `tempId`. (Alternativa mas elegante para fase 2: que el backend acepte UUIDs generados por el cliente como PK.)

**Conflictos: Last-Write-Wins.** El 95% de las operaciones mobile son creates de eventos inmutables (una vacunacion, un pesaje, un parto ocurrieron; nadie los edita en paralelo). Los conflictos reales solo aparecen en updates (editar un potrero desde web y mobile a la vez): v1 resuelve con Last-Write-Wins por timestamp de servidor. La resolucion con merge del doc original se descarta explicitamente.

**Token JWT expirado offline.** Si el operario pasa dias sin señal el token puede vencer antes de sincronizar. La cola **no se pierde**: si la sync recibe 401, se pausa el drenado, se pide re-login y se reanuda. (Si se decide extender la vida del refresh token, eso pertenece a la feature 26 de autenticacion, no a esta.)

## Fuera de alcance (descartes explicitos del doc original)
- Offline para el panel web.
- SQLite / Realm / WatermelonDB: AsyncStorage alcanza para el volumen real.
- Endpoint `/api/v1/sync`, protocolo delta-sync, compresion de cambios, Firebase.
- Resolucion de conflictos con merge (se usa Last-Write-Wins).
- Cache offline de tiles satelitales del mapa: los poligonos y datos salen de la replica local, pero el fondo satelital (tiles de Google/Apple) depende del cache del sistema operativo y puede verse gris en zonas nunca visitadas. Si se quiere garantizar, es una feature propia.
- Dominios clima, maquinaria, inventario y finanzas.
- `DELETE` offline.

## Flujo de referencia (caso completo)
1. **08:00** — El administrador carga un potrero nuevo desde la web.
2. **08:15** — El operario abre la app camino al campo, todavia con señal. La Sync Down corre sola y baja lotes, potreros (incluido el nuevo), animales y catalogos. Banner: "Sincronizado 08:15".
3. **09:00** — Zona muerta. NetInfo detecta offline; banner de modo offline.
4. **10:00** — Abre el mapa: los poligonos se dibujan desde la replica local, incluido el potrero de las 08:00. El GPS funciona sin internet, la geolocalizacion se captura normal. Registra una deteccion de plaga y una vacunacion -> ambas al Outbox. Badge: "2 pendientes".
5. **10:30** — Crea un ternero (tempId local) y registra el parto que lo referencia -> Outbox items 3 y 4, el parto guarda el tempId.
6. **12:30** — Recupera señal. El Outbox drena FIFO: deteccion (200), vacunacion (200), create de ternero (200, devuelve ID real), el parto pendiente se reescribe con el ID real y se envia (200). En paralelo la Sync Down baja las novedades de la web. Badge en cero, banner "Sincronizado 12:30".
7. Caso limite documentado: si un dato se carga por web y el telefono no tiene ni un segundo de señal despues, ese dato no puede estar en el dispositivo; el mitigador es maximizar ventanas de sync (foreground + background fetch), no hay solucion magica.

## Decisiones tomadas en la implementacion
1. **UI optimista**: v1 sin insercion optimista en listas/mapa. El formulario resuelve normal (respuesta sintetica 202 con ID temporal), y la comunicacion del estado pasa por el banner global + badge + bandeja de pendientes. La insercion optimista con icono de pendiente queda como mejora futura.
2. **Token vencido offline**: un 401 durante el drenado pausa la cola sin perderla; se reanuda tras re-login. Extender la vida del refresh token queda para la feature 26 si se pide.
3. **Orden**: Sync Down y Outbox se entregaron juntas (comparten disparadores y provider).

## Implementado
- **Backend**: filtro generico `IdempotencyFilter` (`common/idempotency/`) registrado dentro de la security chain despues de la autorizacion (un replay nunca saltea auth), con tabla `idempotency_keys` (migracion `V41`), clave atada al usuario, cache solo de respuestas 2xx y purga diaria de claves con mas de 30 dias. Header `Idempotency-Key` agregado al CORS.
- **`mobile/shared/sync/outbox.ts`**: cola FIFO persistida en AsyncStorage (`sync_outbox_v1`) con estados PENDIENTE/ERROR, contadores, suscripcion para la UI y `replaceTempIdInOutbox` (reescribe payloads y URLs de los pendientes cuando el create devuelve el ID real).
- **`mobile/shared/sync/offlineInterceptor.ts`**: interceptor de respuesta de axios; si un POST/PUT de la allowlist (22 operaciones de agricultura y ganaderia) falla a nivel de red, encola en el outbox y devuelve una respuesta sintetica 202 con `tempId`, asi los formularios existentes (45/46) resuelven sin cambios. Flag `skipOutbox` para que el drenado no se re-encole.
- **`mobile/shared/sync/syncUp.ts`**: drenado FIFO de a un item contra los endpoints REST existentes con header `Idempotency-Key`; 2xx remueve y remapea tempIds, error de red/5xx/401 corta el drenado, 4xx de validacion manda el item a la bandeja de errores sin bloquear al resto; al final invalida las queries.
- **`mobile/shared/sync/syncDown.ts`**: replica local proactiva de 10 datasets criticos (lotes, potreros lista+mapa, animales, operarios activos y veterinarios, vacunas, razas, dietas, detecciones de plaga) via `fetchQuery` sobre las mismas query keys de los hooks; guarda `lastSyncAt`.
- **`mobile/shared/sync/connectivity.ts`**: NetInfo conectado al `onlineManager` de React Query.
- **`mobile/shared/sync/SyncProvider.tsx`**: orquestador con disparadores (arranque, reconexion, foreground, timer de 5 min, manual) y contexto `useSyncStatus` para la UI.
- **`mobile/app/_layout.tsx`**: `PersistQueryClientProvider` con persister de AsyncStorage (cache 7 dias, `gcTime` alineado), `networkMode: 'always'` para mutaciones (el interceptor decide ante falta de red), `SyncProvider` y `SyncBanner` globales, registro de la pantalla de pendientes.
- **`mobile/shared/components/sync-banner.tsx`**: pildora global que solo aparece con algo que comunicar (offline / pendientes / errores / sincronizando), navega a la bandeja.
- **`mobile/app/sync/pendientes.tsx`**: bandeja de sincronizacion con estado de conexion, ultima sync, boton "Sincronizar ahora" y lista de items con reintentar/descartar.
- **`mobile/babel.config.js`**: config explicita (preset expo) necesaria para que jest transforme react-native; `expo start` la infiere igual.
- **Tests**: `mobile/shared/sync/__tests__/outbox.test.ts` (4 tests: FIFO, remap de tempIds en payload y URL, contadores, remocion).
- Dependencias nuevas: `@react-native-async-storage/async-storage`, `@react-native-community/netinfo` (via `expo install`), `@tanstack/react-query-persist-client@5.40`, `@tanstack/query-async-storage-persister@5.40`.

## Referencias Tecnicas
- Mobile: `mobile/shared/api/client.ts` (axios + interceptor de token), `mobile/shared/api/{agricola,ganaderia,operarios}.ts` (inventario completo de GET/POST/PUT), `mobile/app/_layout.tsx` (QueryClient), hooks en `mobile/shared/hooks/`.
- Librerias: `@tanstack/react-query-persist-client`, `@react-native-async-storage/async-storage`, `@react-native-community/netinfo`, (v2) `expo-background-fetch`.
- Backend: filtro/interceptor generico `Idempotency-Key` + tabla `idempotency_keys` (unico cambio de servidor).
- Features relacionadas: [26](26_COMPLETA_autenticacion_seguridad_login_tokens.md) (tokens), [27](27_agricultura_offline_validacion_cierre_00_01.md), [32](32_ganaderia_sanidad_notificaciones_offline_mobile.md) y [35](35_ganaderia_alimentacion_offline_balanzas_nrc_inra.md) (sus partes offline quedan cubiertas por esta feature cuando se implemente).

## Validacion Tecnica
- `npx tsc --noEmit -p tsconfig.json` sobre `mobile/` sin errores.
- `mvn compile` sobre `backend/` sin errores.
- Jest: 4/4 tests de outbox pasando (FIFO, remap de tempIds, contadores, remocion).
- Pendiente de prueba manual en dispositivo/emulador real con modo avion: registrar cada tipo de evento offline, verificar encolado y drenado sin duplicados (matando la app entre medio para validar persistencia), remap de tempIds crear-animal+parto, e idempotencia ante timeout. El preview web del entorno sigue bloqueado por el problema preexistente de lightningcss.
