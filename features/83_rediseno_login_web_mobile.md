# 83 - Rediseño del login (web + mobile)

## Descripción
Rediseñar la pantalla de login del panel web (Angular) y de la app mobile
(React Native/Expo) según los diseños provistos (mapa de lotes de fondo + emblema
de dominios Ganadería/Agricultura/Gestión + tarjeta de acceso premium dark SaaS).

## Alcance
1. **Web** (`frontend/src/app/pages/login-page`): tarjeta centrada sobre un fondo de
   "mapa de lotes" (grilla de tiles rotada con la paleta de la app + chips de lote),
   emblema con los 3 íconos ilustrados, título "Ingresar", subtítulo, campos Email
   y Password con íconos y toggle de visibilidad, botón "Entrar" (gradiente verde con
   glow), link "¿Olvidaste tu contraseña?" y pill de ayuda "¿Necesitás ayuda? Contactar".
2. **Mobile** (`mobile/app/(auth)/login.tsx`): hero superior con el mapa de lotes +
   chips + emblema, y una tarjeta tipo bottom-sheet con el mismo formulario. Franja
   superior multicolor emulada con segmentos (sin dependencias de gradiente nuevas).
3. **Assets**: íconos ilustrados (`icono1/2/3-sm.png`) copiados a `frontend/public/login`
   y `mobile/assets/images/login`.

## Decisiones
- Solo **login** (se quitó el tab de registro): las cuentas las crea el administrador
  del establecimiento; se muestra ayuda inline en su lugar.
- Se preserva la lógica de auth existente: web → `AuthService.login` + `SessionService`
  → navega a `/agricola/lotes`; mobile → `login` + `persistSession`, respeta
  `mustChangePassword` (→ cambiar-password) y dispara `syncNow` al entrar.
- Paleta y tokens del diseño (Inter/dark SaaS): #070d19, #0b1220, #4d7c0f, #9fe870,
  #b45309/#ffb84d, #0891b2; borde superior en gradiente; inputs con glow al focus.

## Requisitos Técnicos
- Íconos reales (imágenes ilustradas), no siglas.
- Sin nuevas dependencias en mobile (gradiente emulado con segmentos + sombras).

## Estado
Realizada (web + mobile). type-check web + mobile OK; build Angular OK; login web
verificado visualmente contra el mockup. Verificación en dispositivo/emulador mobile
pendiente (revisión visual).
