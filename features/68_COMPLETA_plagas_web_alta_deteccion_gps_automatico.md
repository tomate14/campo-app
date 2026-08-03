# 68 - Plagas web: captura GPS automática al crear una detección

## Descripción
En el web, al crear una detección desde el botón "Registrar evento", las
coordenadas quedaban vacías (solo se cargaban si el usuario hacía click en el
mapa), por lo que se creaban detecciones sin `latitud`/`longitud` y sin pin. Se
pide que al crear un pin nuevo se **capture automáticamente la posición actual**
del navegador (equivalente web al botón de GPS del mobile).

## Contexto
- El web no tenía geolocalización (`navigator.geolocation`); las coords solo
  venían del click en el mapa (`openDetectionFromMap`, origen `WEB_MAPA`).
- El mobile usa `expo-location` (`getCurrentPositionAsync`) para el GPS.
- Relacionada con la feature 66 (fallback del pin sin coords al centro del lote):
  esta feature ataca la causa (que no se generen detecciones sin coords).

## Solución (resuelto en el branch de la feature 65 por pedido del usuario)
- Backend: nuevo valor `WEB_GPS` en el enum `OrigenGeolocalizacion`
  (`MOBILE_GPS, WEB_MAPA, MANUAL, WEB_GPS`).
- Frontend (`plagas-page`):
  - `capturarUbicacionActual()`: usa `navigator.geolocation.getCurrentPosition`
    (high accuracy) y vuelca `latitud`/`longitud` (7 decimales) + `precisionMetros`
    (de `accuracy`) + `origenGeolocalizacion: 'WEB_GPS'` al form. Si el GPS se
    deniega o falla, no bloquea: se puede seguir cargando por click en el mapa.
  - `nuevaDeteccion()`: abre el alta y dispara la captura GPS. El botón
    "Registrar evento" ahora llama a `nuevaDeteccion()`.
  - Botón visible "Usar mi ubicación (GPS)" en el form (junto a lat/lng) para
    recapturar, con estado "Ubicando…".
  - Tipo `OrigenGeolocalizacion` del front actualizado con `'WEB_GPS'`.

## Requisitos Técnicos
- Backend compila; el enum acepta `WEB_GPS`.
- Frontend `npm run type-check` verde.
- Geolocalización requiere contexto seguro (localhost/https).

## Verificación
- Contra el stack Docker: al hacer "Registrar evento" el form se abre con
  `latitud`/`longitud` precargadas por GPS (verificado con un mock de
  `getCurrentPosition`), y el botón "Usar mi ubicación (GPS)" está presente.
  El backend acepta y persiste `origenGeolocalizacion=WEB_GPS` con coords (API).

## Dependencias
- Feature 37 (plagas), 66 (fallback del pin sin coords), 57 (área/mapa, pendiente).

## Estado
Realizada.
