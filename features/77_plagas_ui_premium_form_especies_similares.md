# 77 - Plagas: refactor visual premium del form de especie + "Especies similares (GBIF)"

## Descripción
Refactor **exclusivamente visual** (frontend web, Angular) del formulario de
catálogo/especie de plagas (`plagas-page`, modal de alta/edición de catálogo) y
sobre todo de la sección **"Especies similares (GBIF)"** (feature 75). La
**funcionalidad y los contratos NO cambian**; el foco es estética premium, layout,
jerarquía, responsive y componentes de selección. Además, un **nuevo componente
reutilizable "Searchable Multi Select"** para "Cultivos afectados".

## Estética (identidad Campo App, dark premium)
Inspiración: Linear / Stripe / ArcGIS Field Maps / John Deere Operations Center.
Paleta: fondo `#081225`, cards `#0B1730`, verde `#9FE870`, azul `#6EA8FF`, violeta
`#9A7DFF`, naranja `#FFB84D`, rojo `#FF6B6B`, texto `#FFFFFF`/`#A6B0CF`, bordes
`rgba(255,255,255,.08)`. Glassmorphism suave, radios 16–24px, sombras sutiles, glow
verde leve, tipografía Inter, mucho espacio negativo. Nada de look Bootstrap.

## Alcance (web)
### Inputs del form (mantener campos)
Nombre científico, Tipo, Cultivos afectados, Zona/área típica, Umbral, Síntomas.
Inputs oscuros premium: alto 52–56px, radio 16–18px, fondo `#081225`, borde
`rgba(255,255,255,.08)`, focus borde verde + glow suave. Labels chicas, `#A6B0CF`.
Síntomas: textarea full width 100–120px + contador `0 / 500`.
"Buscar similares": acción **secundaria** (icono Search, borde verde suave, fondo
`rgba(159,232,112,.08)`, radio 16px), NO botón verde sólido grande.

### Nuevo componente `searchable-multi-select` (reutilizable)
Reemplaza `configurable-multi-select` en Cultivos afectados. Input único con icono
Search + placeholder "Buscar cultivos...", ChevronDown, dropdown flotante (overlay
z-index alto, no deforma layout), búsqueda por nombre con match destacado, opciones
con checkbox moderno + hover, scroll interno para listas largas. Seleccionados como
**chips compactos** dentro del input (fondo `rgba(159,232,112,.12)`, borde
`rgba(159,232,112,.30)`, color `#9FE870`, radio 999px, × para remover); overflow
`+N`. Mobile: 100% ancho, dropdown full width, alto máx ~280px.
**Contrato intacto**: bindea/emite el CSV de **ids** de `utilidad_cultivo` (como el
componente actual); opciones desde `UtilidadesService` por `categoria`.

### Sección "Especies similares (GBIF)"
Card contenedora con header (icono Leaf/Sprout en cuadrado glass + título +
subtítulo "Candidatas taxonómicas según el nombre científico") y link opcional "Ver
fuentes en GBIF". Grid responsive: **desktop 3 / tablet 2 / mobile 1** por fila, gap
20–24px, alturas homogéneas. Cada card: **imagen grande arriba** (aspect ~16:10/4:3,
`object-fit:cover`, radios solo arriba, ~60–65% de la card) + **footer** `#0B1730`.
Sobre la imagen: badge de confianza (Star + glass, esquina sup. der.). Placeholder
premium si no hay imagen (ImageOff, mismo tamaño). Footer: badge taxonómico
(GÉNERO/ESPECIE), nombre principal (Inter bold), nombre científico en cursiva
`#A6B0CF`, y botón **"Usar"** compacto (Check, borde verde, fondo `rgba(159,232,112,.08)`,
radio 14px). Debajo del grid: **"Ver más resultados"** (secundario, ChevronDown).
Hover desktop: levantar 2px + glow leve; transiciones 150–220ms.

## Realidad de datos (no inventar)
`EspecieSimilar` = `{ usageKey, nombreCientifico, nombreVulgar, nivel(GENERO|FAMILIA),
imagenUrl, licencia, atribucion }`. **No** trae cultivos afectados ni zona típica ni
score → el **badge de confianza se deriva de `nivel`** (GÉNERO → "Coincidencia alta",
verde; FAMILIA → "Posible", azul). Cultivos/zona NO se muestran en estas cards (no
existen). Licencia/atribución/fuente van a tooltip o link "Ver fuente"
(`https://www.gbif.org/species/{usageKey}` y/o `urlOriginal`). `imagenUrl` puede ser
absoluta (remota) o `/uploads/...` → usar el helper `imagenUrl()` existente.

## Requisitos Técnicos
- Solo frontend web; sin cambios de contrato ni de backend/mobile.
- `npm run type-check` verde. Verificar responsive (desktop/tablet/mobile) y que la
  funcionalidad (buscar similares, usar, alta/edición con cultivos) siga igual.

## Dependencias
- Features 54/73/75 (catálogo, ficha, especies similares GBIF), 72 (cultivos por id).

## Estado
Realizada (frontend web). Verificada contra Docker (estructural + interacción; el
browser pane de este entorno no compone frames, no hubo screenshot):
- Nuevo `searchable-multi-select` (standalone, reutilizable): dropdown flotante
  (`.sms__dropdown` position fixed, no recortado por el modal), búsqueda con
  resaltado (`.hit`), multiselección con chips `.sms__chip` + overflow `+N`, cierre
  por click-afuera/Escape. Reemplaza a `configurable-multi-select` SOLO en Cultivos
  afectados (el viejo queda intacto). Contrato de ids preservado: al editar Oruga
  cogollera (`cult-maiz,cult-sorgo`) preselecciona chips MAIZ + SORGO.
- Form premium (scoped a `.plaga-form`/`.plaga-form__grid`): inputs oscuros altos,
  focus verde; textarea de síntomas `maxlength=500` + contador `N / 500`; "Buscar
  similares" como acción secundaria (borde verde suave), no botón sólido.
- Sección "Especies similares (GBIF)": card contenedora con header (icono glass +
  título + subtítulo) y "Ver fuentes en GBIF"; grid `.gbif-grid` **3/2/1**
  (desktop/tablet/mobile vía media queries), cards image-dominant (imagen arriba
  4:3 `object-fit:cover`, radios solo arriba), badge de confianza derivado de
  `nivel` (GÉNERO→"Coincidencia alta" verde / FAMILIA→"Posible" azul), placeholder
  "Sin imagen disponible", footer con nombre + científico en cursiva, "Usar" (en el
  alta), licencia/atribución fuera de la card (link a gbif.org/species/{usageKey}),
  y "Ver más resultados" (primeras 6, resto client-side). Mismo diseño en el panel
  del alta y en el bloque de la ficha.
- Sin cambios de contrato/funcionalidad ni backend/mobile. `npm run type-check` y
  `ng build` verdes.
