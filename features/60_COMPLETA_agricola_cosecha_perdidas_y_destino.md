# 60 - Agrícola: cosecha con pérdidas y destino

## Descripción
Ampliar el registro de cosecha para contemplar las pérdidas de cosecha con su
detalle y causa, y el destino del grano en el día (camión, silo, puerto, etc.),
sumando un apartado en el dashboard de administración.

## Alcance
1. **Pérdidas de cosecha**: agregar al registro de cosecha:
   - Área real cosechada (en %) y hectáreas cosechadas.
   - Granos perdidos y kilos de pérdida por hectárea.
   - Aclarar la semántica: lo que junta la cosechadora es el **rendimiento**; la
     pérdida es lo que queda en el campo.
   - Tipo de pérdida y causa (cabezal, cola, etc.).
2. **Destino del día**: registrar a dónde fue la cosecha en el día (camión, silo,
   puerto, etc.), con la cantidad correspondiente. El dropdown de destino se
   alimenta del catálogo configurable de **Utilidades** (ver más abajo), con un
   botón **"+"** al lado para dar de alta un destino nuevo.
3. **Dashboard de administración**: apartado que consolide destino y pérdidas
   (por lote/campaña), integrado al dashboard existente.
4. **Utilidades (nuevo apartado del menú)**: apartado para administrar catálogos
   configurables que alimentan dropdowns del sistema; su primer catálogo es el
   destino de la cosecha (ver sección dedicada).

## Utilidades (catálogos configurables)
Se agrega un apartado **"Utilidades"** en el menú lateral (ícono real, lenguaje
premium dark SaaS) con **su propio permiso RBAC**, registrado en el sistema de
roles/menú (feature 41): opción de menú + permisos (`read:utilidades` para ver,
`write:utilidades` para dar de alta), asignables por rol.

Utilidades sirve para **administrar información útil / catálogos configurables**
que alimentan distintos dropdowns del sistema. Es un módulo **genérico y
reutilizable**: acá se define su primer catálogo (destino de la cosecha) y más
adelante se especificarán otros dropdowns que también se administrarán desde acá.

Primer catálogo: **"Destino de la cosecha"**
- Dropdown con las opciones base de esta feature (camión, silo, puerto, …).
- Botón **"+"** al lado del dropdown para **dar de alta un destino nuevo** (un
  string libre de a dónde fue la cosecha), que queda disponible en el dropdown.

### Almacenamiento
Tabla nueva de opciones (id + string). Como el módulo va a alimentar **varios
dropdowns** (a especificar más adelante), se recomienda **una tabla genérica con
un discriminador de categoría** en vez de una tabla por caso, p. ej.:
`utilidad_opcion (id, categoria, valor, activo, orden, created_at, updated_at)`,
con `categoria = 'DESTINO_COSECHA'` para este caso. Cada dropdown configurable
pasa a ser una `categoria` distinta. (Alternativa: arrancar con una tabla
específica `cosecha_destino (id, nombre)` y generalizar luego; queda como
decisión técnica al implementar.)

### Alcance del apartado Utilidades
- Backend: entidad + migración Flyway; endpoints CRUD (listar por categoría y
  alta) protegidos por los permisos de utilidades; seed de las opciones base de
  destino (camión, silo, puerto); registro de la opción de menú y del permiso en
  el sistema de la feature 41.
- Frontend web: pantalla **Utilidades** (premium) para listar y dar de alta
  opciones por catálogo, y un **componente reutilizable "dropdown + botón +"**
  que consume las opciones de una categoría y permite el alta inline.
- El dropdown de destino de la cosecha (punto 2 del Alcance) consume este
  catálogo en web y mobile.
- Mobile: consume el catálogo en el dropdown de destino (el alta de nuevas
  opciones puede quedar solo en web por ahora).

## Requisitos Técnicos
- Backend: extender el modelo de `RegistroCosecha` (o entidad relacionada) con los
  campos de pérdidas y con el/los destinos del día. Migración Flyway.
- Backend: tabla y endpoints del catálogo de Utilidades + opción de menú y
  permisos RBAC (feature 41).
- Web y mobile: formularios de cosecha con los nuevos campos (usar selects/chips
  para tipo de pérdida; el destino usa el dropdown configurable con botón "+").
- Web: pantalla del apartado Utilidades.
- Dashboard: nuevas métricas/serie de destino y pérdidas.
- Estilo premium dark SaaS; ícono real para el menú de Utilidades (no siglas).

## Dependencias
- Feature 00 (siembra/cosecha), 10-reportes (dashboard agrícola), 41
  (roles/menú y permisos, para el apartado Utilidades).

## Estado
Realizada.

## Resumen de implementación
- **Backend**: migración `V45` (tabla `utilidad_opcion` id/categoria/valor/activo/orden
  + seed destino Camión/Silo/Puerto; permisos `read:utilidades`/`write:utilidades`
  asignados a super_admin y admin; opción de menú `utilidades` y su visibilidad
  por rol) y `V46` (campos de pérdidas/destino en `registros_cosecha`;
  `tipo_perdida` como ENUM MySQL para validar con Hibernate). Módulo Utilidades
  (`com.campoapp.utilidades`: entidad/repo/service/controller) con
  `GET/POST/DELETE /api/v1/utilidades/opciones` protegidos por permisos.
  `RegistroCosecha` + DTOs + service extendidos (áreaReal%, ha cosechadas,
  perdidaKgHa, granosPerdidosKg, tipoPerdida CABEZAL/COLA/OTRO, destino,
  destinoCantidadTn). Dashboard agrícola con sub-record `resumenCosecha`
  (toneladas totales, pérdida promedio kg/ha, destinos agrupados).
- **Frontend web**: pantalla `Utilidades` (lista/alta/baja por catálogo) + item de
  sidebar (`isMenuVisible('utilidades')`) + ruta `/utilidades`; componente
  reutilizable `configurable-select` (dropdown + botón "+" con alta inline y
  auto-selección); form de cosecha con los campos de pérdidas y el destino
  configurable; sección "Cosecha: destino y pérdidas" en el dashboard.
- **Mobile**: form de cosecha (`registro-cosecha.tsx`) con campos de pérdidas y
  selector de destino alimentado por el catálogo (`useUtilidadOpciones`), sumado
  a la sync down para offline; el alta de opciones queda solo en web.
- **Verificado end-to-end contra Docker**: admin tiene `read/write:utilidades`,
  ve el menú, GET/POST del catálogo de destino, alta de cosecha con pérdidas y
  destino persistida, y `resumenCosecha` del dashboard con datos. Pantalla
  Utilidades web renderiza el catálogo. Gates: `mvn compile` + test-compile,
  `npm run type-check`, `tsc` mobile — verdes.
