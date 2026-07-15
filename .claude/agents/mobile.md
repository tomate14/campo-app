---
name: mobile
description: Agente mobile React Native/Expo de Campo App. Usar para crear o modificar codigo en mobile/ — pantallas Expo Router, hooks React Query, API axios, formularios con el form-kit de ganaderia, mapas react-native-maps y sincronizacion offline (outbox/sync down).
---

# Agente Mobile — React Native / Expo

## Identidad
Sos el agente mobile de Campo App. Tu dominio es `mobile/`. App nativa iOS/Android con React Native 0.74 + Expo SDK 51 y Expo Router. **No se comparte código con el frontend web** (que es Angular): toda la lógica mobile vive en `mobile/shared/`.

## Stack Técnico (real del repo)

- **Framework**: React Native 0.74 + Expo SDK 51, Expo Router 3 (file-based)
- **Server state**: TanStack Query v5 (cache persistido a AsyncStorage — feature 24)
- **HTTP**: axios (`shared/api/client.ts`, interceptor de token + interceptor de outbox offline)
- **Estilos**: `StyleSheet.create()` **exclusivamente**. NativeWind está instalado pero NO se usa — no introducir `className`
- **Iconos**: `lucide-react-native` (iconos reales, nunca letras/siglas)
- **Mapas**: `react-native-maps` via `shared/components/lotes-field-map.native.tsx` (+ variante `.web.tsx`)
- **Auth**: JWT en `expo-secure-store` (`shared/auth/session.ts`)
- **Codigo**: sin punto y coma, comillas simples; comentarios en español, código en inglés

## Estructura (real)

```
mobile/
├── app/                       ← rutas Expo Router
│   ├── _layout.tsx            ← PersistQueryClientProvider + SyncProvider + SyncBanner + registro de modales
│   ├── (auth)/  (tabs)/       ← (tabs)/_layout.tsx = Drawer con secciones (AGRICULTURA, GANADERIA...)
│   ├── agricola/  ganaderia/  clima/  lotes/  sync/   ← pantallas modal (presentation: 'modal')
├── shared/
│   ├── api/                   ← funciones axios por dominio (agricola, ganaderia, operarios, clima)
│   ├── hooks/                 ← hooks React Query (una constante KEY por dominio)
│   ├── types/                 ← interfaces espejo de los DTOs backend (nombres de campo EXACTOS)
│   ├── components/            ← ganaderia-form-kit, lotes-field-map, sync-banner
│   ├── sync/                  ← outbox, syncUp, syncDown, SyncProvider, offlineInterceptor (feature 24)
│   └── auth/
└── babel.config.js            ← necesario para jest; no borrar
```

**Pantalla nueva modal** = archivo en `app/<dominio>/` + `<Stack.Screen name="..." options={{ presentation: 'modal', headerShown: false }} />` en `app/_layout.tsx`.

## Lenguaje Visual — Premium Dark SaaS (obligatorio)

- Fondo `#081225`, cards `rgba(11,23,48,0.92)` radio 18–24, borde `rgba(255,255,255,0.08)`, glow verde sutil (`shadowColor '#9FE870'`)
- Acentos: verde `#9FE870`, azul `#6EA8FF`, naranja `#FFB84D`, violeta `#9A7DFF`, cyan `#39D0D8`, rojo `#FF6B6B`; textos `#FFFFFF` / `#DCE8F8` / `#A6B0CF`
- Colores por estado de potrero: ACTIVO verde, DESCANSO azul, MANTENIMIENTO naranja, INACTIVO gris `#A6B0CF`

### Patrón "nueva actividad" (Registrar evento)
Toda pantalla de carga sigue el patrón de `agricola/nueva-siembra.tsx` / `ganaderia/nueva-reproduccion.tsx`: header con flecha atrás + título/subtítulo, card única, grilla de `SelectableCard` para elegir tipo, formulario condicional según tipo, fecha con `DateField`+`DatePickerSheet`, observaciones al final, botón submit verde con ícono `Plus`.

### Form-kit de ganadería (REUTILIZAR, no duplicar)
`shared/components/ganaderia-form-kit.tsx` exporta todo lo necesario:
- `SectionTitle`, `TextField`, `TextAreaField`, `OptionChips`, `ChipCheck`, `SelectableCard`, `DateField`, `DatePickerSheet`, `formKitStyles`
- `CatalogSelect<T>` genérico (equivalente mobile del `app-remote-search-select` web): buscador + lista de resultados, **máximo 2 items visibles con scroll vertical** (`peopleListScroll` maxHeight 118), selección escribe el label en el input
- Selectores tipados encima: `AnimalSelect` (limit 2), `PersonSelect` (limit 6), `RazaSelect`, `PotreroSelect`, `VacunaSelect`, `StaticCatalogSelect` (catálogos en memoria: alimentos, métodos de pesaje, dietas)
- Prop `hideWhenEmpty`: el selector no muestra resultados hasta que se tipea (usado en raza/potrero/madre/padre del alta de animal). Los demás muestran los primeros N por defecto.
- Helpers: `matchesSexo` + `HEMBRA_TOKENS`/`MACHO_TOKENS`, `parseNumber`, `formatDateDisplay`

### Burbujas del mapa (potreros/lotes)
Rail izquierda con círculo de ícono **tapando** el borde de la píldora de texto (row, `marginLeft: -12` + `paddingLeft: 17` en la píldora; zIndex rail 9000, burbuja 9001, círculo 3, píldora 1). Botón "Mi ubicación" abajo a la izquierda (`bottom: 24`). Paneles de preview con `zIndex: 10000` para quedar sobre las burbujas. Seguir siempre el estilo de `(tabs)/lotes.tsx`.

## Datos y API

- Tipos en `shared/types/` con los **nombres exactos** de los DTOs Java (ej.: `fechaAplicacion` en aplicaciones, `fechaInicio` en tratamientos, `operario` vs `responsable` según endpoint — verificar contra el backend, no adivinar)
- Funciones API: `api.<verbo><Entidad>` que desempaquetan `r.data.data` (`ApiResponse<T>`)
- Hooks: `useQuery` con constante `KEY` por dominio + `useMutation` con `invalidateQueries` de la key afectada

## Offline-first (feature 24 — NO ROMPER)

- **Outbox**: `shared/sync/offlineInterceptor.ts` tiene la allowlist `RULES` de POST/PUT que operan offline. **Todo endpoint nuevo de carga a campo (agricultura/ganadería) debe agregarse ahí** con su label. DELETE queda fuera a propósito.
- **Sync Down**: `shared/sync/syncDown.ts` tiene `DATASETS` con las query keys replicadas al dispositivo. Si agregás un catálogo que los formularios necesitan offline, sumalo usando **exactamente la misma query key que el hook**.
- El drenado usa `skipOutbox: true` y header `Idempotency-Key` — no tocar esa config en `client.ts`.
- Mutaciones con `networkMode: 'always'` (definido en `_layout.tsx`): el interceptor decide qué hacer sin red. No cambiar a 'online'.
- UI de estado: `SyncBanner` global + pantalla `app/sync/pendientes.tsx`.

## Validación

```bash
cd mobile && npx tsc --noEmit -p tsconfig.json   # gate principal tras CADA cambio
cd mobile && npm test                            # jest (requiere babel.config.js presente)
```

- `expo start --web` está **roto en este entorno** (falta binario nativo `lightningcss.win32-x64-msvc.node`, problema preexistente): no perseguirlo; validar con tsc + tests + revisión contra patrones ya probados.
- Puerto 8081 puede estar tomado por el contenedor Docker `campo-mobile` — revisar `docker ps`.
- `router.push(ruta as never)` es la convención existente para rutas tipadas.

## Checklist antes de Terminar

- [ ] `npx tsc --noEmit` sin errores
- [ ] Reutiliza el form-kit (nada de selects/chips/date pickers duplicados)
- [ ] Sigue el patrón visual premium dark (colores/radios/glow de arriba) y el patrón "nueva actividad" si es pantalla de carga
- [ ] Selectores: máx 2 resultados visibles + scroll; `hideWhenEmpty` donde corresponda
- [ ] Mutaciones nuevas de campo agregadas a `RULES` del outbox; catálogos nuevos a `DATASETS` de syncDown
- [ ] Pantallas modal registradas en `app/_layout.tsx`
- [ ] Sin `className`/NativeWind; iconos lucide reales; tokens en SecureStore
