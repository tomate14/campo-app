# 70 - Utilidades: tipo de pérdida como catálogo + reglas de visualización

## Descripción
Refinamiento del apartado **Utilidades** (feature 60):
1. El **tipo de pérdida** de cosecha deja de ser un enum fijo y pasa a ser un
   **catálogo configurable** administrado desde Utilidades (como el destino), con
   botón **"+"** para dar de alta nuevos tipos. El campo de cosecha toma sus
   opciones de la tabla `utilidad_opcion` (categoría `TIPO_PERDIDA_COSECHA`).
2. **Reglas generales del apartado Utilidades** (aplican a todo catálogo que se
   agregue a este menú):
   - Se muestran como **máximo 4 opciones**; si hay más, aparece la **scrollbar
     vertical (eje Y)** para subir/bajar (sin scrollbar horizontal).
   - Orden **alfabético** por valor.
   - Los datos se guardan en la **tabla nueva** genérica (`utilidad_opcion`).

## Alcance
### Backend
- Migración `V47`: seed de `TIPO_PERDIDA_COSECHA` (Cabezal, Cola, Otro) y
  `ALTER TABLE registros_cosecha MODIFY tipo_perdida VARCHAR(160)` (deja de ser
  ENUM para admitir nuevos tipos).
- `RegistroCosecha.tipoPerdida` y sus DTOs pasan de enum `TipoPerdidaCosecha` a
  `String` (valor del catálogo). Se elimina el enum. El service ya sólo pasa el
  valor, sin cambios.
- Orden del catálogo: el repositorio de Utilidades ordena **alfabéticamente por
  `valor`** (`OrderByValorAsc`), afectando a todos los catálogos y dropdowns.

### Frontend web
- `tipoPerdida` en los modelos pasa a `string`.
- El form de cosecha usa `app-configurable-select` con `categoria="TIPO_PERDIDA_COSECHA"`
  (dropdown + botón "+"), igual que el destino.
- Pantalla Utilidades: se agrega el catálogo `TIPO_PERDIDA_COSECHA` ("Tipo de
  pérdida"); la lista de opciones de cada catálogo muestra **máx. 4 visibles +
  scrollbar Y** con la identidad verde premium; orden alfabético (del backend).

### Mobile
- `tipoPerdida` pasa a `string`; el selector de tipo de pérdida se alimenta del
  catálogo `TIPO_PERDIDA_COSECHA` (`useUtilidadOpciones`), sumado a la sync down.
  El alta de opciones queda sólo en web.

## Requisitos Técnicos
- Backend compila; V47 aplica; Hibernate `validate` OK (tipo_perdida VARCHAR).
- Frontend `npm run type-check` verde; mobile `tsc` verde.

## Verificación
- Catálogo `TIPO_PERDIDA_COSECHA` disponible en Utilidades con alta/baja/"+".
- Cosecha: tipo de pérdida como dropdown desde el catálogo; alta persiste el
  string elegido.
- En Utilidades, un catálogo con >4 opciones muestra scroll Y; orden alfabético.

## Dependencias
- Feature 60 (módulo Utilidades y cosecha), 41 (permisos/menú), 67 (patrón de
  scrollbar premium).

## Estado
Realizada. Verificada end-to-end contra Docker: catálogo `TIPO_PERDIDA_COSECHA`
(Cabezal/Cola/Otro) con orden alfabético confirmado (alta de "Aacarreo" aparece
primero), tipo de pérdida de cosecha guardado como string del catálogo, y en la
pantalla Utilidades cada catálogo con `max-height` de 4 filas + scrollbar Y verde
premium (el de destino con 5 opciones scrollea; el de tipo de pérdida con 4 no).
Alta ("+"/Agregar) y baja (DELETE 204) OK. Gates: mvn compile + test-compile,
npm run type-check, tsc mobile — verdes.
