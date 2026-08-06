# 74 - Mobile: catálogo de referencia offline (AgroBoost)

## Descripción
Permitir usar en **modo offline** el catálogo de referencia de plagas por cultivo
que genera la feature 73. La app mobile descarga las imágenes del catálogo al
almacenamiento del dispositivo y las renderiza sin conexión, y mantiene una
carpeta de imágenes pendientes de sincronizar cuando vuelve la conexión.

## Contexto
- Feature 73 (backend): tabla `plaga_referencia` con imágenes descargadas desde
  GBIF al volumen Docker, servidas en `/uploads/plagas-referencia/...`, y endpoint
  de lectura `GET /plagas/catalogo-referencia`.
- Mobile ya tiene sync offline (outbox/sync down) y ahora `expo-image-picker`
  (feature 54).

## Estructura de carpetas pedida (y salvedad técnica)
El usuario pidió guardar en el **root del dispositivo** en `AgroBoost/catalogo`
(para renderizar) y `AgroBoost/local` (imágenes a sincronizar al reconectar).

**Salvedad:** en React Native/Expo no se puede escribir en el root del dispositivo
de forma portable (iOS es sandbox; Android moderno requiere Storage Access
Framework/MediaLibrary y permisos). El equivalente portable y sin fricción es el
**document directory de la app** (`FileSystem.documentDirectory`), creando ahí:
- `AgroBoost/catalogo/` → imágenes del catálogo de referencia ya sincronizadas,
  usadas para render offline.
- `AgroBoost/local/` → imágenes generadas/tomadas en el dispositivo pendientes de
  subir; se sincronizan (suben) cuando hay conexión y luego migran a `catalogo/`.

Si se requiere estrictamente el root visible del dispositivo (galería), evaluar
`expo-media-library` (Android) con sus permisos; a definir en la implementación.

## Alcance (mobile)
1. **Descarga/sync down del catálogo de referencia**: al tener conexión, la app
   consume `GET /plagas/catalogo-referencia`, descarga cada imagen
   (`/uploads/plagas-referencia/...`) a `AgroBoost/catalogo/` (nombre estable por
   id/hash) y guarda la metadata local (SQLite/JSON) para render offline.
2. **Render offline**: la ficha/listado de referencia por cultivo usa la ruta
   local (`file://.../AgroBoost/catalogo/...`) si existe; si no, cae a la URL
   remota. Debe verse sin conexión.
3. **Cola local a sincronizar** (`AgroBoost/local/`): imágenes creadas offline
   (p. ej. fotos tomadas) que quedan pendientes; al reconectar se suben al backend
   y, una vez confirmadas, se mueven/copian a `AgroBoost/catalogo/`. Integrar con
   el outbox existente.
4. **Gestión de espacio/invalidez**: limpiar imágenes de referencia que ya no
   están en el catálogo; re-descargar si cambió el path/imagen.

## Requisitos Técnicos
- `expo-file-system` para crear las carpetas y descargar/leer archivos.
- Detección de conectividad (ya existe `subscribeConnectivity`/`isOnline`).
- Metadata local persistente del catálogo (mapear id→archivo local).
- Estilo premium dark SaaS; iconos reales.

## Dependencias
- Feature 73 (catálogo de referencia backend), 54 (imágenes/volumen), sync offline
  mobile existente.

## Estado
Pendiente.
