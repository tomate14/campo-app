# Integraciones externas de Campo App

Documento central de las integraciones con servicios externos que usa Campo App:
para qué se usan, si requieren cuenta/credenciales y el **paso a paso** para darlas
de alta y configurarlas. Mantener actualizado al agregar o quitar integraciones.

> Convención: las credenciales viven en el archivo **`.env`** (no se commitea; ver
> `.env.example` como plantilla). Nunca hardcodear secretos en el código ni subirlos
> al repo, salvo excepciones ya existentes que se señalan más abajo.

## Resumen

| Integración | Uso | ¿Cuenta/credenciales? | Dónde se configura | Costo |
|---|---|---|---|---|
| Copernicus Data Space (Sentinel‑2) | NDVI / mapa de verdes (feature 59) | Sí — OAuth2 client | `.env` (`NDVI_*`) | Gratis (cuota) |
| Google Maps Platform | Mapa nativo mobile (Android) | Sí — API key | `mobile/app.json` | Gratis (cuota) + tarjeta |
| Open‑Meteo | Clima, pronóstico y precipitaciones | No | `application.yml` (`clima.*`) | Gratis |
| GBIF | Catálogo de referencia de plagas / especies similares | No | `application.yml` (`gbif.*`) | Gratis |
| OpenFreeMap + EOX (tiles) | Fondos de mapa web (MapLibre) | No | Frontend (URLs de estilo/tiles) | Gratis |
| OAuth2 SSO (Google / Azure) | Login federado | Reservado — **no implementado** | `.env` / `application.yml` (`oauth2.*`) | — |

---

## 1) Copernicus Data Space Ecosystem — Sentinel‑2 (NDVI / mapa de verdes)

- **Para qué**: obtener imágenes Sentinel‑2 y generar el NDVI ("mapa de verdes") por
  lote (feature 59). Backend: `NdviService` + `SentinelAuthClient` (OAuth2 client‑credentials).
- **Datos**: los de Sentinel‑2 son **gratuitos y abiertos** (programa Copernicus de la UE).
  El acceso vía CDSE (API Sentinel Hub) es **gratis** con una cuota mensual de
  *processing units*, suficiente para un NDVI por lote cada 15 días. **Requiere credenciales**.

### Paso a paso — crear cuenta y obtener credenciales
1. **Crear la cuenta (gratis)**: ir a <https://dataspace.copernicus.eu> → **Register**
   (o **Login → Create account**), completar email + contraseña y **confirmar desde el
   mail** que llega.
2. **Entrar al dashboard de Sentinel Hub** de CDSE:
   <https://shapps.dataspace.copernicus.eu/dashboard/> (misma cuenta recién creada).
3. **Crear el cliente OAuth2**: dentro del dashboard, **User settings / Account settings**
   → sección **OAuth clients** → **+ Create / New OAuth client** → ponerle un nombre
   (ej. `campo-app-ndvi`) y confirmar.
4. Copiar los valores que muestra:
   - **Client ID** → variable `NDVI_CLIENT_ID`
   - **Client Secret** → variable `NDVI_CLIENT_SECRET`
   > ⚠️ El **secret se muestra una sola vez**. Copiarlo en el momento; si se pierde,
   > crear otro cliente.

### Dónde cargarlas
En **`.env`** (raíz del repo), completar:
```
NDVI_CLIENT_ID=tu_client_id
NDVI_CLIENT_SECRET=tu_client_secret
```
El resto ya viene con los endpoints correctos de CDSE (no tocar salvo que cambie el
proveedor):
```
NDVI_TOKEN_URL=https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token
NDVI_PROCESS_URL=https://sh.dataspace.copernicus.eu/api/v1/process
NDVI_ENABLED=true
NDVI_DIR=/app/ndvi
NDVI_SYNC_CRON=0 0 4 */15 * *
NDVI_VENTANA_DIAS=15
NDVI_MAX_NUBOSIDAD=40
NDVI_IMG_SIZE=512
```
Las imágenes se guardan en el volumen Docker `backend_ndvi` (`/app/ndvi/{loteId}.png`,
una por lote, pisando la anterior).

### Verificar
```bash
docker compose up -d --build backend   # toma el código + credenciales
docker exec campo-backend ls -la /app/ndvi
```
Notas: si no se cargan las credenciales, el proceso **no corre** y la app arranca igual.
La cuota gratis alcanza de sobra para el uso previsto.

---

## 2) Google Maps Platform — mapa nativo mobile (Android)

- **Para qué**: `react-native-maps` en **Android** renderiza con Google Maps y **exige**
  una API key; sin ella la pantalla de mapa (Lotes) crashea.
- **Requiere**: proyecto en Google Cloud + **Maps SDK for Android** habilitado + API key.
- **Dónde se configura**: `mobile/app.json` →
  `expo.android.config.googleMaps.apiKey`.

### Paso a paso
La guía detallada (crear proyecto, habilitar la SDK, generar la key, obtener el SHA‑1 y
restringir la key por package + firma) está en:
**[`docs/configurar-google-maps-android.md`](./configurar-google-maps-android.md)**.

Resumen rápido:
1. <https://console.cloud.google.com> → crear/seleccionar proyecto.
2. **APIs y servicios** → habilitar **Maps SDK for Android** (y iOS si aplica).
3. **Credenciales** → **Crear credencial → Clave de API**.
4. **Restringir** la key: por aplicación Android (package `com.campoapp.mobile` + SHA‑1)
   y por API (Maps SDK for Android).
5. Pegar la key en `mobile/app.json`.

> ⚠️ **Nota de seguridad**: hoy la API key está **hardcodeada en `mobile/app.json`**
> (archivo versionado). Es aceptable para una key **restringida** por package + SHA‑1,
> pero conviene: (a) mantener las restricciones activas, (b) rotarla si se filtró sin
> restricción. Para keys de Google, la restricción por app es la protección real (la key
> viaja igual en el APK).

---

## 3) Open‑Meteo — clima, pronóstico y precipitaciones

- **Para qué**: datos de clima/pronóstico y la serie diaria de precipitaciones que
  alimenta el dashboard y el KPI de lluvia. Backend: `ClimaService` + `ClimaScheduler`.
- **Cuenta/credenciales**: **no requiere** (API pública y gratuita, sin key).
- **Dónde se configura**: `application.yml` → `clima.open-meteo.base-url`
  (`https://api.open-meteo.com/v1`). Toggles de sync por `.env`:
  `CLIMA_SYNC_ENABLED`, `CLIMA_SYNC_INTERVALO_MS`.

> Nota: existe una variable **`OWM_API_KEY`** (OpenWeatherMap) en `.env` que es
> **legado y no se usa** — la integración de clima vigente es Open‑Meteo. Puede
> eliminarse del `.env` en una limpieza futura.

---

## 4) GBIF — catálogo de referencia de plagas

- **Para qué**: enriquecer el catálogo de plagas y el descubrimiento de especies
  similares por nombre científico (features 73/75).
- **Cuenta/credenciales**: **no requiere** (API pública y gratuita).
- **Dónde se configura**: `application.yml` → `gbif.base-url` (`https://api.gbif.org/v1`).
  Toggles por `.env`: `GBIF_SYNC_ENABLED`, `GBIF_SYNC_CRON`, `GBIF_SIMILAR_*`.

---

## 5) Tiles / fondos de mapa web (MapLibre)

- **Para qué**: fondos del mapa web (Lotes, Plagas). No llevan datos propios.
- **Cuenta/credenciales**: **no requieren** (gratuitos; requieren atribución).
- **Fuentes** (en el frontend Angular):
  - **OpenFreeMap** — estilo vectorial: `https://tiles.openfreemap.org/styles/bright`.
  - **EOX Sentinel‑2 cloudless** — capa satelital:
    `https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2020_3857/default/g/{z}/{y}/{x}.jpg`.

---

## 6) OAuth2 SSO (Google / Azure) — reservado, no implementado

- **Estado**: hay **placeholders** de configuración (`oauth2.google.*`, `oauth2.azure.*`
  en `application.yml` y variables `OAUTH2_*` en `.env`/`docker-compose`), pero **no hay
  implementación** de login federado (no está la dependencia `spring-security-oauth2-client`
  ni el flujo `oauth2Login`). El login actual es propio (JWT).
- **Si se implementa a futuro**, cada proveedor necesitaría:
  - **Google**: proyecto en Google Cloud → *OAuth consent screen* → **Credenciales →
    ID de cliente OAuth** (Web) → `OAUTH2_GOOGLE_CLIENT_ID` / `OAUTH2_GOOGLE_CLIENT_SECRET`.
  - **Azure AD/Entra ID**: registrar una app en *App registrations* → `OAUTH2_AZURE_TENANT`,
    `OAUTH2_AZURE_CLIENT_ID`, `OAUTH2_AZURE_CLIENT_SECRET`.
  - Debería crearse como **feature numerada** antes de desarrollarse.

---

## Buenas prácticas
- Credenciales solo en `.env` (gitignored). Mantener `.env.example` como plantilla
  actualizada (sin valores reales).
- Restringir siempre las keys que viajan al cliente (Google Maps) por app/API.
- Toda integración nueva se documenta acá y, si implica desarrollo, se crea como
  **feature numerada** en `features/` con su registro en `MANIFEST.md`.
