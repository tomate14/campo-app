# 76 - Datos de prueba: demo seeder (backend, gateado por env)

## Descripción
Cargar un **dataset de demo coherente y enlazado** para toda la aplicación, de modo
que todas las pantallas (web y mobile) se vean con datos realistas para probar.

## Decisiones (confirmadas por el usuario)
- **Mecanismo: seeder en el backend**, gateado por variable de entorno
  `SEED_DEMO_DATA` (default `false`). Corre al arrancar la app (después de las
  migraciones y del `DataInitializer`) SOLO si el flag está en `true`. Crea los
  datos vía **repositorios** (respetando entidades, relaciones e ids: cultivo/tipo
  de `utilidad_*`, feature 72). No pasa por endpoints.
- **Volumen: chico** (demo navegable): 1 campo/tenant con ~5-8 lotes, series cortas
  de cosecha/clima, algunas detecciones/insumos, ~20-30 animales con sanidad/
  reproducción, unos operarios/máquinas/facturas. Suficiente para poblar todas las
  vistas sin saturar.
- **Idempotente**: usa **ids fijos** con prefijo `demo-`; si el dataset ya existe
  (chequeo de un sentinel), no hace nada. **Nunca borra** datos que no sean demo.
- **Alcance: todos los módulos**.

## Alcance (módulos a poblar)
- **Agricultura**: lotes (con polígono GeoJSON y `cultivo` = id de `utilidad_cultivo`),
  eventos de siembra / monitoreo fenológico, registros de cosecha (con destino /
  tipo de pérdida = ids de `utilidad_*`), histórico de cultivos, propiedades de suelo.
- **Plagas**: detecciones georreferenciadas (sobre lotes demo, catálogo existente),
  aplicaciones fitosanitarias, seguimientos.
- **Insumos**: catálogo (tipo/unidad = ids de `utilidad_*`), stock por depósito/lote,
  movimientos.
- **Clima**: datos/mediciones y precipitación diaria para los lotes demo (serie corta).
- **Ganadería**: animales (con trazabilidad), sanidad/vacunación, reproducción/
  genealogía, alimentación/pesajes.
- **Maquinaria**: inventario + mantenimientos programados.
- **Operarios**: operarios demo (con su user), órdenes de trabajo.
- **Finanzas**: proveedores, facturas/ventas, compras.

## Diseño
- `DemoDataProperties` (`campo.demo.seed-enabled = ${SEED_DEMO_DATA:false}`).
- `DemoDataSeeder` (`ApplicationRunner`, orden después del `DataInitializer`),
  gateado por el flag; si el sentinel (`demo-lote-1` o similar) existe → skip y
  loguea. Orquesta seeders por dominio (`AgriculturaDemoSeeder`, `PlagasDemoSeeder`,
  `GanaderiaDemoSeeder`, `MaquinariaDemoSeeder`, `OperariosDemoSeeder`,
  `FinanzasDemoSeeder`, `ClimaDemoSeeder`, `InsumosDemoSeeder`), respetando el orden
  de dependencias (primero lotes/animales, luego lo que los referencia).
- Ids fijos `demo-*` para poder ser idempotente y para referenciar entre seeders.
- Fechas relativas coherentes (campaña actual); coordenadas dentro de Argentina.
- `docker-compose.yml`: pasar `SEED_DEMO_DATA: ${SEED_DEMO_DATA:-false}` al backend.

## Requisitos Técnicos
- Respetar `ddl-auto: validate` (no crear columnas; solo insertar filas válidas).
- No romper el arranque si el flag está apagado (comportamiento actual intacto).
- Compila + Hibernate validate OK. Verificable: con `SEED_DEMO_DATA=true` aparecen
  los datos en las pantallas; re-arranque no duplica.

## Dependencias
- Toda la app (entidades/repositorios existentes). Ids de catálogos: 71/72
  (`utilidad_*`). No introduce migraciones nuevas.

## Estado
Realizada. Verificada end-to-end contra Docker (base regenerada, `SEED_DEMO_DATA=true`):
- Andamiaje: `DemoDataProperties` (`campo.demo.seed-enabled` = env `SEED_DEMO_DATA`,
  default false), interfaz `DemoSeeder`, `DemoDataRunner` (`@Order(100)`, corre
  después del `DataInitializer` con `@Order(1)`), `DemoIds` (ids fijos compartidos).
  `docker-compose.yml` pasa `SEED_DEMO_DATA`.
- 9 seeders por dominio: operarios (8), agricultura (10), plagas (20), insumos (30),
  clima (40), ganadería (50), maquinaria (60), órdenes-trabajo (72), finanzas (80).
- 1ª corrida: **243 filas** creadas (operarios 4, agricultura 28, plagas 11,
  insumos 20, clima 84, ganadería 73, maquinaria 7, órdenes 6, finanzas 10),
  **0 fallos**. Datos consultables por API (lotes, insumos, operarios, animales,
  máquinas, detecciones, etc.).
- **Idempotente**: al re-arrancar, los 9 dominios crean 0 filas (sin duplicados).
  Se corrigió un bug de conteo en `InsumosDemoSeeder` (contaba los existentes).
- Con el flag apagado no siembra nada (comportamiento por defecto intacto).
- No requiere migraciones ni cambios en web/mobile (puebla pantallas existentes).
- Gates verdes: `mvn clean package` (compile + test-compile).
