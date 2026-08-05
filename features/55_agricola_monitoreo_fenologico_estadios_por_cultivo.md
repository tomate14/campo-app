# 55 - Agrícola: monitoreo fenológico por cultivo (estadios) y card por cultivo

## Descripción
Estandarizar los estadios fenológicos según el cultivo: crear un catálogo de
estadios por cultivo, y reemplazar el campo de "estadio" (hoy texto/valor libre)
por un **select con buscador** filtrado por el cultivo, tanto en web como en
mobile. Además, sumar una card de monitoreo fenológico que agrupe todos los lotes
de un cultivo con sus monitoreos e histórico.

## Flujo de captura del evento (definición agregada)
El monitoreo fenológico no se elige "en el aire": se deriva de dónde y sobre qué
se está monitoreando. El flujo es:
1. Al **registrar un evento** de monitoreo fenológico, el evento ocurre sobre una
   **coordenada GPS** (la posición capturada, igual que en las detecciones de
   plagas — ver feature 68).
2. Esa coordenada **debe caer dentro de uno de los lotes definidos** (resolución
   por punto-en-polígono, reutilizando el `resolverLote` ya existente que ubica
   el lote a partir de lat/lng). Si la coordenada no cae en ningún lote, no se
   puede registrar el monitoreo (o se pide seleccionar el lote manualmente).
3. Ese lote tiene una **siembra registrada**, es decir un **cultivo** asociado
   (el `cultivo` del lote y/o el de la siembra vigente).
4. Los **estados fenológicos sugeridos** salen del catálogo de estadios de **ese
   cultivo sembrado**: el select con buscador se **pre-filtra por el cultivo del
   lote resuelto por la coordenada**, sin que el usuario tenga que elegir el
   cultivo a mano.

Ejemplo: si la coordenada del evento cae en un lote con **maíz** sembrado, el
selector de estadio debe ofrecer los estados del maíz (VE, V1..Vn, VT, R1..R6);
si el lote tiene **soja**, ofrece los de soja (VE, VC, V1.., R1..R8), etc.

## Alcance
1. **Tabla/catálogo de estadios por cultivo** (backend): p. ej. escala BBCH o
   estadios por cultivo (maíz: VE, V1..Vn, VT, R1..R6; soja: VE, VC, V1.., R1..R8;
   trigo: macollaje, encañado, espigazón, etc.). Migración Flyway con datos
   iniciales por cultivo.
2. **Select con buscador de estadio**: reemplazar el input de estadio fenológico
   por el componente de select-buscador ya existente (web: `remote-search-select`;
   mobile: patrón `OptionPicker`/buscador). Las opciones se filtran **por el
   cultivo del lote resuelto a partir de la coordenada GPS del evento** (ver
   "Flujo de captura"): primero se resuelve el lote por la coordenada, se toma el
   cultivo de su siembra, y con ese cultivo se piden los estadios al backend. El
   usuario no elige el cultivo a mano. Aplica en los formularios de siembra/evento
   donde hoy se carga el estado fenológico (web y mobile).
3. **Card de monitoreo fenológico por cultivo**: similar a la vista de lotes pero
   mostrando, por cultivo, todos los lotes referenciados con su estadio actual y
   el **histórico** de monitoreos fenológicos.

## Requisitos Técnicos
- Catálogo versionable de estadios por cultivo (código + descripción + orden).
- Endpoint REST para listar estadios por cultivo (`?cultivo=`), consumido tras
  resolver el cultivo desde el lote.
- Resolución del lote por coordenada GPS (reutilizar `resolverLote`
  punto-en-polígono) y obtención del cultivo de la siembra de ese lote para
  pre-filtrar los estadios. Manejo del caso "coordenada fuera de todo lote".
- Reutilizar el selector con buscador existente en web y mobile.
- Estilo premium dark SaaS para la card.

## Dependencias
- Features 00/01 (siembra/eventos, lotes), 31 (selector con buscador), 37/68
  (resolución de lote por coordenada y captura de GPS en el alta de evento).

## Estado
Pendiente.
