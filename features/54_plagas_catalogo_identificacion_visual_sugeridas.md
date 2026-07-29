# 54 - Plagas: catálogo con identificación visual y plagas sugeridas

## Descripción
Enriquecer el catálogo de plagas con material visual e identificación asistida:
imágenes de la plaga, imágenes de posibles plagas para comparar, área/zona típica
y umbral de acción; y a partir del nombre científico mostrar imágenes de
referencia para confirmar la identidad, además de sugerir plagas relacionadas o
similares.

## Contexto
- Catálogo actual: `CatalogoPlaga` (backend `PlagasController` + entidad) con
  `nombreComun`, `nombreCientifico`, `tipo`, `cultivosAfectados`, `sintomas`,
  `umbralAccion`, `activo`. Consumido por web (`plagas-page`) y mobile
  (`plagas.tsx`, alta desde el selector — feature 53).

## Alcance
1. **Imágenes del catálogo**: permitir asociar una o varias imágenes a cada
   `CatalogoPlaga` (foto principal + galería de "posibles plagas"). Persistencia
   de imágenes (definir almacenamiento: ver Requisitos).
2. **Campos adicionales**: reforzar/mostrar "área o zona típica de la plaga" y el
   `umbralAccion` en las fichas web y mobile.
3. **Identificación por nombre científico**: dado el `nombreCientifico`, mostrar
   imágenes de referencia externas para que el usuario confirme si es esa plaga.
4. **Plagas sugeridas / relacionadas**: listar plagas similares para descartar
   confusiones.

## Criterio sugerido para "plagas relacionadas/similares"
El usuario pidió proponer criterio. Sugerencia (combinable, con score):
- Mismo `tipo` (PLAGA / ENFERMEDAD / MALEZA).
- Mismo **género taxonómico** = primera palabra del `nombreCientifico`
  (p. ej. *Spodoptera* frigiperda ↔ *Spodoptera* cosmioides).
- Solapamiento de `cultivosAfectados` (comparten al menos un cultivo).
- Similitud de texto en `sintomas` (coincidencia de palabras clave).
Ranking: priorizar mismo género + cultivo compartido; luego tipo + síntomas.
Implementación pragmática: cálculo en backend sobre el catálogo propio (sin ML).

## Fuente de imágenes por nombre científico (a confirmar licencia)
Propuesta: consultar un banco de biodiversidad por nombre científico y cachear:
- **GBIF** (`api.gbif.org`, media por especie, pagina de la API: https://techdocs.gbif.org/en/openapi/) o **iNaturalist** (`api.inaturalist.org`).
- Guardar en backend la URL/So thumbnail cacheado por especie para no depender de
  la red en cada consulta y respetar rate limits.
- Confirmar licencia de reuso de cada imagen (mostrar atribución si corresponde).
No inferir ni scrapear fuentes que lo prohíban.

## Requisitos Técnicos
- Almacenamiento de imágenes: definir (columna con URL + storage de archivos, o
  tabla `catalogo_plaga_imagen`). Evaluar tamaño/formatos.
- Endpoints REST para subir/listar imágenes del catálogo y para "sugeridas".
- Web y mobile: galería en la ficha de plaga y en el alta (feature 53).
- Estilo premium dark SaaS.

## Dependencias
- Feature 37 (plagas) y 53 (alta de catálogo desde mobile).

## Estado
Pendiente.
