# Feature 79 - Captura de foto previa en detección de plaga y alerta de potrero

## Objetivo
Al registrar una **nueva detección de plaga** (agrícola) o una **nueva alerta de potrero**
(ganadería), la app debe **capturar primero una foto** de lo encontrado en el lugar y recién
después mostrar el formulario con el resto de los datos. Esa foto queda asentada junto al registro
y se muestra como **imagen protagonista en el header de la card**, con el mismo lenguaje visual que
las imágenes de especies sugeridas/similares.

- **Mobile:** al iniciar la carga se abre la **cámara** (con opción de elegir de galería).
- **Web:** se permite **seleccionar una foto** (input de archivo; `capture` sugiere cámara en
  navegadores móviles).
- La foto es **opcional**: siempre hay un "Continuar sin foto" para no bloquear la carga.

## Alcance
Aplica a los dos flujos equivalentes de "registrar algo encontrado en el campo":
1. **Detección de plaga** (agrícola): `DeteccionPlaga` / pantalla de plagas.
2. **Alerta de potrero** (ganadería): `AlertaPotrero` / pantalla de potreros.

En web y mobile. Un solo branch/PR.

## Estado previo (base sobre la que se construye)
- **Detección de plaga:** la entidad `DeteccionPlaga` y sus DTOs **ya tienen** los campos de foto
  (`fotoUrl`, `fotoNombre`, `fotoContentType`, `fotoTamanioBytes`, migración V12). Existe un endpoint
  multipart `POST /detecciones/con-foto` pero está **incompleto** (no persiste el archivo con
  `FileStorageService`, inventa la URL y descarta los bytes) y **ningún cliente lo usa**. Hoy web y
  mobile crean detecciones con `POST /detecciones` (JSON, sin foto).
- **Alerta de potrero:** `AlertaPotrero` (feature 47) **no tiene** ningún campo de imagen.
- **Infra de imágenes existente y reutilizable:** `FileStorageService` (`storePlagaImage`,
  `storeBytes`), servido en `/uploads/**` (`WebMvcConfig`). El catálogo de plagas ya sube imágenes
  por multipart (`POST /catalogo/{id}/imagenes`, campo `foto`): web `uploadCatalogoPlagaImagen`
  (`FormData`), mobile `pickAndUpload` + `toImageAsset` (expo-image-picker, cámara + galería).
- **Convención de URL:** en DB se guarda el path relativo (`plagas-catalogo/uuid.jpg`) y la URL
  expuesta es `/uploads/{path}`; web `imagenUrl()` y mobile `resolveAssetUrl()` anteponen el origin.

## Backend
1. **`FileStorageService`**: agregar `storeImage(MultipartFile file, String subfolder): String`
   (valida tipo/tamaño como `storePlagaImage`, guarda `{subfolder}/{uuid}.{ext}`, devuelve el path
   relativo). `storePlagaImage` delega en él con `plagas-catalogo`. Nuevos subfolders:
   `plagas-detecciones` y `ganaderia-alertas`.
2. **Detección de plaga con foto**: corregir `POST /api/v1/agricola/plagas/detecciones/con-foto`
   (multipart: part `payload` = JSON de `DeteccionPlagaRequest`, part `foto` = archivo opcional).
   Cuando llega `foto`: `rel = storeImage(foto, "plagas-detecciones")`, setear en la entidad
   `fotoUrl = "/uploads/" + rel`, `fotoNombre`, `fotoContentType`, `fotoTamanioBytes` **desde el
   archivo** (ignorar los campos de foto que mande el cliente). El endpoint JSON `POST /detecciones`
   se mantiene para el caso sin foto.
3. **Alerta de potrero con foto** (aditivo):
   - Migración **V52** `V52__ganaderia_alertas_potrero_foto.sql`: `ALTER TABLE alertas_potrero ADD
     COLUMN foto_url VARCHAR(500) NULL, foto_nombre VARCHAR(255) NULL, foto_content_type
     VARCHAR(100) NULL, foto_tamanio_bytes BIGINT NULL;` (aditiva, no requiere regenerar la base).
   - `AlertaPotrero`: agregar los 4 campos de foto. `AlertaPotreroResponse`: agregar al menos
     `fotoUrl`.
   - Controller: nuevo `POST /api/v1/ganaderia/potreros/alertas/con-foto` (multipart: `payload` =
     JSON de `AlertaPotreroRequest`, `foto` opcional), auth `update:animales`. Se mantiene el JSON
     `POST /potreros/alertas`. Al llegar `foto`: `storeImage(foto, "ganaderia-alertas")` →
     `fotoUrl = "/uploads/" + rel`.

## Frontend Web (Angular)
- **Servicios**: `createDeteccionPlagaConFoto(request, file)` y `createAlertaPotreroConFoto(request,
  file)` que arman `FormData` (`payload` = JSON string, `foto` = File) y postean a los endpoints
  `con-foto`. Si no hay archivo, se usa el create JSON existente.
- **Detección (`plagas-page`)**: el modal de "Nueva detección" pasa a **2 pasos**: paso 1 "Foto"
  (selector de archivo `accept="image/*"` con preview + "Continuar" y "Continuar sin foto"), paso 2
  el formulario actual. Guardar el `File` seleccionado; en submit, multipart si hay foto, JSON si no.
- **Alerta (`ganaderia-potreros-page`)**: el modal de alerta suma el paso/sección de foto análogo.
- **Card header**: mostrar la foto (`fotoUrl` vía `imagenUrl()`) como imagen protagonista en el
  header de las cards de detección y de alerta, con el patrón visual de las imágenes sugeridas/
  similares (imagen dominante, placeholder cuando no hay foto).

## Mobile (React Native / Expo)
- **API**: `createDeteccionPlagaConFoto(request, asset)` y `createAlertaPotreroConFoto(request,
  asset)` (`FormData` con `foto = {uri,name,type}`, `skipOutbox: true`). Reutilizar `toImageAsset`.
- **Detección (`agricola/plagas.tsx`)**: al iniciar una nueva detección se **abre la cámara**
  primero (`ImagePicker.launchCameraAsync`, con permiso; opción "Elegir de galería"). Tras
  capturar/cancelar se muestra el form con una **card de foto** arriba (preview + reintentar/quitar).
  En submit, multipart si hay foto. Si el usuario cancela la cámara, sigue sin foto.
- **Alerta (`ganaderia/nueva-alerta.tsx`)**: mismo patrón cámara-primero + card de foto + submit
  multipart.
- **Card header**: render de la foto (`resolveAssetUrl(fotoUrl)`) como imagen protagonista en las
  cards/listas de detección y de alerta, con el patrón del hero de la ficha del catálogo.

## Contratos (resumen)
- `POST /api/v1/agricola/plagas/detecciones/con-foto` — multipart `payload` (JSON) + `foto?`.
- `POST /api/v1/ganaderia/potreros/alertas/con-foto` — multipart `payload` (JSON) + `foto?`.
- Respuestas: `DeteccionPlagaResponse.fotoUrl` y `AlertaPotreroResponse.fotoUrl` en formato
  `/uploads/{subfolder}/{uuid}.{ext}` (relativo; el front antepone el origin).
- Límites de imagen: los de `FileStorageService` (5 MB; `image/jpeg|png|webp`).

## Criterios de aceptación
- En mobile, "nueva detección" y "nueva alerta" abren la cámara antes del form; se puede omitir.
- En web, ambos flujos permiten elegir una foto antes del form; se puede continuar sin foto.
- La foto elegida se guarda en el volumen (`plagas-detecciones/` o `ganaderia-alertas/`) y la
  detección/alerta queda con su `fotoUrl`.
- La foto se ve como imagen protagonista en el header de la card de detección y de alerta.
- Sin foto, el flujo funciona igual que hoy (create JSON) y la card muestra el placeholder.

## Fuera de alcance
- Múltiples fotos por detección/alerta (una sola foto principal, como el modelo actual de detección).
- Uso offline de estas fotos (sync down / captura sin conexión): se maneja en el track offline
  (features 74/78); acá el upload de foto requiere conexión (`skipOutbox`).
- Audio/medición u otra multimedia (feature 56).
