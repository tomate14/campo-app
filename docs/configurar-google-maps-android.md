# Configurar Google Maps (API key) para la app mobile en Android

Guía reutilizable para dar de alta una aplicación en **Google Cloud Console** y
activar la **API key de Google Maps** que necesita el mapa nativo. Aplicar estos
pasos cada vez que se instala/prepara una nueva app o un nuevo entorno.

## Por qué se necesita

La app mobile usa `react-native-maps`, que en **Android siempre** renderiza con
Google Maps y **exige** una API key declarada en `AndroidManifest.xml`
(`com.google.android.geo.API_KEY`). Sin la key, la pantalla del mapa (p. ej.
Lotes) crashea con:

```
API key not found. Check that <meta-data android:name="com.google.android.geo.API_KEY"
android:value="your API key"/> is in the <application> element of AndroidManifest.xml
```

## Datos del proyecto actual (referencia)

- Package Android: `com.campoapp.mobile` (si se cambia el nombre comercial /
  package, actualizar las restricciones de la key).
- SHA-1 del **debug keystore** (`mobile/android/app/debug.keystore`, password
  `android`): se obtiene con el comando de la sección "Obtener el SHA-1".
  > Nota: hoy el build **release** se firma con el mismo debug keystore
  > (config por defecto de Expo/RN), así que ese SHA-1 cubre debug y el APK
  > release local. Para publicar en Play Store ver la sección correspondiente.

## Prerrequisitos

- Una cuenta de Google.
- Poder habilitar **facturación** en el proyecto de Google Cloud (Google la
  exige para Maps aunque el uso caiga dentro de la capa gratuita). Este paso lo
  realiza el responsable de la cuenta; nadie más debe cargar datos de pago.

---

## Paso a paso en Google Cloud Console

### 1. Crear o elegir el proyecto
1. Entrar a <https://console.cloud.google.com/>.
2. Barra superior → selector de proyecto → **New Project** (o elegir uno
   existente). Poner un nombre claro (p. ej. el nombre comercial de la app).

### 2. Habilitar facturación
1. Menú **☰ ▸ Billing**.
2. Vincular una cuenta de facturación al proyecto. Sin esto, las APIs de Maps
   devuelven error de autorización.

### 3. Habilitar la API de Maps para Android
1. Menú **☰ ▸ APIs & Services ▸ Library**.
2. Buscar **"Maps SDK for Android"** ▸ **Enable**.
3. (Opcional, si también se buildeará iOS) habilitar **"Maps SDK for iOS"**.

### 4. Crear la API key
1. Menú **☰ ▸ APIs & Services ▸ Credentials**.
2. **Create credentials ▸ API key**.
3. Copiar la key generada (se configura en el proyecto, ver más abajo).

### 5. Restringir la key (muy recomendado)
La key viaja dentro del APK, así que la protección real es restringirla por app.
1. En la lista de **Credentials**, abrir la key ▸ **Edit**.
2. **Application restrictions ▸ Android apps ▸ Add**:
   - **Package name**: `com.campoapp.mobile`
   - **SHA-1**: el del keystore que firma el build (ver "Obtener el SHA-1").
   - Repetir el "Add" por cada keystore que aplique (debug, release, Play).
3. **API restrictions ▸ Restrict key** ▸ seleccionar solo **Maps SDK for
   Android** (y iOS si corresponde).
4. **Save**. Los cambios pueden tardar unos minutos en propagarse.

---

## Obtener el SHA-1 del keystore

Desde `mobile/android`, con el JDK 17 instalado:

```bash
# Debug keystore (y release local, que hoy usa el mismo)
keytool -list -v -keystore app/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

Buscar la línea `SHA1:` en la salida. Para un **keystore de release propio**
(cuando se genere uno para producción):

```bash
keytool -list -v -keystore <ruta-al-release.keystore> -alias <alias>
```

### Play Store (Play App Signing)
Si se publica en Google Play con **Play App Signing**, Google re-firma la app con
su propio certificado. Hay que agregar TAMBIÉN el SHA-1 que figura en:
**Play Console ▸ (tu app) ▸ Setup ▸ App integrity ▸ App signing key certificate**.
Sin ese SHA-1, el mapa fallará en la versión publicada aunque funcione localmente.

---

## Configurar la key en el proyecto

### Opción recomendada: `app.json` (sobrevive a `expo prebuild`)
En `mobile/app.json`, dentro de `expo.android`, agregar el bloque `config`:

```json
"android": {
  "package": "com.campoapp.mobile",
  "config": {
    "googleMaps": { "apiKey": "TU_API_KEY" }
  }
}
```

Luego regenerar el proyecto nativo y recompilar:

```bash
cd mobile
npx expo prebuild -p android
```

El plugin de Expo inyecta la `<meta-data>` de la key en el `AndroidManifest.xml`
automáticamente.

### Opción rápida (solo para probar; se pierde al re-prebuildear)
Agregar manualmente dentro de `<application>` en
`mobile/android/app/src/main/AndroidManifest.xml`:

```xml
<meta-data android:name="com.google.android.geo.API_KEY" android:value="TU_API_KEY"/>
```

---

## Seguridad de la key

- **No** commitear la key en texto plano. Preferir inyectarla por variable de
  entorno / archivo local ignorado por git y no versionar el `AndroidManifest.xml`
  con la key embebida.
- La key es visible dentro del APK: la defensa real es la **restricción por
  package + SHA-1 + API** (paso 5). Una key sin restringir puede ser abusada por
  terceros y generar consumo facturable.
- Si se filtra, **regenerarla/rotarla** desde Credentials.

---

## Emulador de Android

El mapa necesita **Google Play Services**. El AVD debe ser una imagen con
**Google Play** o **Google APIs** (en Device Manager muestra el ícono de Play
Store o la etiqueta "Google APIs"). Una imagen **AOSP** pura no renderiza Google
Maps aunque la key sea válida.

---

## Verificación

1. Build + instalación (Android Studio ▸ Run, o `npx expo run:android`).
2. Abrir la pantalla con mapa (p. ej. **Lotes**).
3. El mapa debe cargar los tiles sin crashear.
4. Revisar **Logcat** filtrando por `com.campoapp.mobile` si algo falla.

---

## Troubleshooting

| Síntoma | Causa probable | Solución |
|---|---|---|
| `API key not found ...` (crash) | No hay `<meta-data>` de la key en el manifest | Configurar la key (sección "Configurar la key") y re-prebuild |
| Mapa gris con "For development purposes only" | Facturación no habilitada, o Maps SDK for Android no habilitado | Habilitar billing y la API (pasos 2 y 3) |
| Mapa vacío / no carga en el celular publicado | Falta el SHA-1 de Play App Signing | Agregar el SHA-1 de Play Console a las restricciones |
| Funciona en un teléfono pero no en otro/emulador | SHA-1 o package no coinciden, o AVD sin Play Services | Revisar restricciones de la key y usar imagen con Google APIs |
| `This API key is not authorized to use this service` | API restriction mal configurada | Incluir "Maps SDK for Android" en API restrictions |

---

## iOS (opcional)

Si se compila para iOS, además de habilitar **Maps SDK for iOS**, la key se
configura en `app.json` bajo `expo.ios.config.googleMapsApiKey` y se restringe
por **iOS apps ▸ bundle identifier** (`com.campoapp.mobile`).
