# 73 - Plagas: identificación por nombre científico (GBIF/iNaturalist)

## Descripción
Derivada de la feature 54. Dado el `nombreCientifico` de una plaga del catálogo,
consultar un banco de biodiversidad externo (GBIF o iNaturalist) para mostrar
**imágenes de referencia externas** que ayuden a confirmar la identidad de la
plaga, con su atribución y respetando la licencia de reuso.

## Contexto
La feature 54 dejó el catálogo enriquecido con imágenes propias (subidas por el
usuario), zona/área típica, umbral y "plagas sugeridas" (algoritmo sobre el
catálogo propio). La identificación con imágenes externas se separó acá por
implicar llamadas de red salientes, cacheo y manejo de licencias.

## Alcance
- Cliente HTTP saliente a GBIF (`api.gbif.org`, media por especie) o iNaturalist
  (`api.inaturalist.org`), reusando el patrón `RestClient` de clima
  (`ClimaConfig`/`ClimaProperties`): nuevo bean `gbifRestClient` + properties con
  `base-url`.
- Buscar por `nombreCientifico`, traer thumbnails/URLs de imágenes y **cachear**
  en backend (URL + atribución por especie) para no depender de la red en cada
  consulta y respetar rate limits.
- Endpoint `GET /catalogo/{id}/imagenes-referencia` (o por nombre científico) que
  devuelve las imágenes externas cacheadas con su atribución/licencia.
- Web y mobile: bloque "Imágenes de referencia (fuente externa)" en la ficha de
  plaga, con atribución visible. No mezclar con las imágenes propias del usuario.

## Requisitos Técnicos
- Confirmar licencia de reuso de cada imagen antes de mostrarla; mostrar
  atribución cuando corresponda. No scrapear fuentes que lo prohíban.
- Cacheo con expiración (tabla o cache in-memory) + manejo de fallo de red
  (degradar a "sin imágenes de referencia disponibles").
- Estilo premium dark SaaS.

## Dependencias
- Feature 54 (catálogo enriquecido y ficha de plaga).

## Estado
Pendiente.
