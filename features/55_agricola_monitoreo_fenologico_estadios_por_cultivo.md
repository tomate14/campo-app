# 55 - Agrícola: monitoreo fenológico por cultivo (estadios) y card por cultivo

## Descripción
Estandarizar los estadios fenológicos según el cultivo: crear un catálogo de
estadios por cultivo, y reemplazar el campo de "estadio" (hoy texto/valor libre)
por un **select con buscador** filtrado por el cultivo, tanto en web como en
mobile. Además, sumar una card de monitoreo fenológico que agrupe todos los lotes
de un cultivo con sus monitoreos e histórico.

## Alcance
1. **Tabla/catálogo de estadios por cultivo** (backend): p. ej. escala BBCH o
   estadios por cultivo (maíz: VE, V1..Vn, VT, R1..R6; soja: VE, VC, V1.., R1..R8;
   trigo: macollaje, encañado, espigazón, etc.). Migración Flyway con datos
   iniciales por cultivo.
2. **Select con buscador de estadio**: reemplazar el input de estadio fenológico
   por el componente de select-buscador ya existente (web: `remote-search-select`;
   mobile: patrón `OptionPicker`/buscador), filtrando las opciones por el cultivo
   del lote seleccionado. Aplica en los formularios de siembra/evento donde hoy se
   carga el estado fenológico (web y mobile).
3. **Card de monitoreo fenológico por cultivo**: similar a la vista de lotes pero
   mostrando, por cultivo, todos los lotes referenciados con su estadio actual y
   el **histórico** de monitoreos fenológicos.

## Requisitos Técnicos
- Catálogo versionable de estadios por cultivo (código + descripción + orden).
- Endpoint REST para listar estadios por cultivo.
- Reutilizar el selector con buscador existente en web y mobile.
- Estilo premium dark SaaS para la card.

## Dependencias
- Features 00/01 (siembra/eventos, lotes) y 31 (selector con buscador).

## Estado
Pendiente.
