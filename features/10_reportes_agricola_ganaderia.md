# 10 - Reportes: Dashboard Agricola Ejecutivo Premium

## Estado
Realizada. Implementada con endpoint backend `GET /api/v1/reportes/agricola/dashboard` y pantalla web Angular en `/reportes/agricola`. La UI renderiza exclusivamente datos recibidos del backend: KPIs, estado fenologico por cultivo, rendimiento actual vs historico, distribucion de cultivos, mapa satelital con poligonos GeoJSON activos, alertas recientes y tareas recomendadas.

## Objetivo
Disenar una pantalla web ejecutiva para productores agricolas que permita visualizar en una sola vista el estado general de la campana, facilitando la toma de decisiones operativas y estrategicas.

La pantalla debe transmitir:
- Agricultura de precision
- Inteligencia operativa
- Tecnologia aplicada al agro
- Control de campana
- Software enterprise premium

## Fuente de Datos
Todos los datos visibles del dashboard deben provenir del backend. No se permite mockear valores ni series en el frontend.

### Endpoint
- `GET /api/v1/reportes/agricola/dashboard`

### Datos implementados
- Hectareas en produccion: suma de hectareas de lotes activos.
- Estado fenologico: dropdown por cultivo con ultimo monitoreo fenologico registrado.
- Rendimiento actual cosechado: promedio de cosechas del ano actual.
- Rendimiento historico: promedio de los ultimos 5 anos desde historico de cultivos.
- Alertas activas: agricultura y maquinaria.
- Lotes con monitoreo pendiente: lotes con detecciones activas sin seguimiento en los ultimos 10 dias.
- Indice de salud de cultivos: promedio de salud de lotes activos segun detecciones activas.
- Precipitacion acumulada: suma de precipitaciones del periodo siembra-cosecha en lotes activos cuando hay periodo disponible.
- Distribucion de lotes por cultivo: cantidad, hectareas y porcentaje por cultivo.
- Mapa de lotes: poligonos GeoJSON activos con color segun salud del lote.
- Alertas recientes: ultimas 5 alertas de agricultura/maquinaria.
- Proximas tareas recomendadas: 4 tareas mas urgentes de agricultura/maquinaria.

### Datos sin fuente suficiente por ahora
- Riesgo climatico: removido de la vista.
- Evolucion historica del indice de salud: se muestra estado vacio hasta contar con serie backend.
- Costo por hectarea: se muestra sin datos hasta implementar costos.
- Margen bruto proyectado: se muestra sin datos hasta implementar rentabilidad.

## Referencias Visuales
Inspirado en:
- Stripe Dashboard
- Linear
- Vercel
- Notion Enterprise
- Climate FieldView
- Auravant
- John Deere Operations Center

## Estilo Visual

### Paleta
| Elemento | Color |
|---|---|
| Fondo principal | `#081225` |
| Cards | `#0B1730` |
| Verde principal | `#9FE870` |
| Azul tecnologico | `#6EA8FF` |
| Amarillo alertas | `#FFB84D` |
| Rojo critico | `#FF6B6B` |

### Caracteristicas
- Dark Mode Premium
- Glassmorphism suave
- Glow verde sutil
- Bordes 20px
- Sombras suaves
- Inter Font
- Mucho espacio negativo
- Diseno modular
- UI Enterprise

## Layout General
```txt
+----------------------------------------------+
| Header                                       |
+----------------------------------------------+
| KPIs Principales                             |
+----------------------------------------------+
| Graficos + Distribucion + Mapa               |
+----------------------------------------------+
| Salud Cultivos + Alertas + Tareas            |
+----------------------------------------------+
```

## Sidebar

### Logo
Campo App  
AgroERP

### Menu

#### Dashboard
- Activo

#### Agricultura
- Lotes
- Ciclo agricola
- Monitoreos
- Siembra
- Aplicaciones
- Cosecha
- Rendimientos
- Analytics

#### General
- Clima
- Insumos
- Maquinaria
- Reportes

## Header

### Titulo
Dashboard Agricola

### Subtitulo
Resumen ejecutivo de la campana agricola.

### Acciones
- Selector Campana 2026/27
- Ultima actualizacion
- Perfil usuario

## KPIs Principales

### 1. Hectareas en Produccion
Valor: `2450 ha`

Indicadores:
- `+8.5%`
- Mini grafico tendencia

### 2. Estado Fenologico Promedio
Mostrar:
- Maiz -> V8
- Soja -> R3
- Trigo -> Z65

### 3. Riesgo Climatico
Valor: `Moderado`

Visual:
- Semaforo verde
- Semaforo amarillo
- Semaforo rojo

### 4. Rendimiento Proyectado
Valor: `4.2 tn/ha`

Indicadores:
- `+5.6%`
- Tendencia positiva

### 5. Alertas Activas
Valor: `7`

Visual:
- Mini grafico rojo

### 6. Lotes con Monitoreo Pendiente
Valor: `12`

Subtexto:
- de 32 lotes

### 7. Indice de Salud de Cultivos
Valor: `89%`

Visual:
- Grafico radial premium

### 8. Precipitacion Acumulada
Valor: `428 mm`

Indicadores:
- `+9%`
- Comparativa historica

### 9. Costo por Hectarea
Valor: `USD 512/ha`

### 10. Margen Bruto Proyectado
Valor: `+14%`

Indicadores:
- `+3.2%`
- Tendencia positiva

## Fila Analitica

### Rendimiento Proyectado vs Historico
Tipo: Line Chart

Series:
- Campana actual
- Promedio ultimos 5 anos

Indicador principal:
- `4.2 tn/ha`

### Distribucion de Cultivos
Tipo: Donut Chart

Cultivos:
- Soja
- Maiz
- Trigo
- Girasol

Mostrar:
- Cantidad lotes
- Porcentaje
- Total

### Mapa de Lotes
Tipo: Mapa satelital

Mostrar:
- Poligonos GeoJSON
- Salud por lote

Escala:
- Excelente
- Muy Bueno
- Bueno
- Regular
- Malo

## Fila Operativa

### Evolucion Indice de Salud
Tipo: Line Chart

Meses:
- Sep
- Oct
- Nov
- Dic
- Ene
- Feb
- Mar
- Abr
- May

Objetivo:
- Visualizar tendencia general de salud.

### Alertas Recientes
Tipo: Timeline

Eventos:
- Riesgo de helada
- Deficit hidrico
- Fertilizacion recomendada
- Viento fuerte previsto

Mostrar:
- Fecha
- Lote
- Prioridad

### Proximas Tareas Recomendadas
Lista operativa.

Ejemplos:
- Aplicacion fungicida
- Monitoreo de plagas
- Control de malezas
- Fertilizacion nitrogenada

Mostrar:
- Cantidad de lotes afectados
- Fecha sugerida

## Graficos
Todos los graficos deben:
- Tener glow verde suave
- Fondo transparente
- Estilo minimalista
- Sin ruido visual
- Sin grid excesivo
- Lineas suaves

## Experiencia Deseada
El productor debe poder responder inmediatamente:
- Como esta la campana?
- Que lotes requieren atencion?
- Cual es el riesgo climatico?
- Como evoluciona el rendimiento?
- Que tareas deberia ejecutar hoy?
- Como impacta eso en la rentabilidad?

## Resultado Esperado
La pantalla debe parecer:
- Producto SaaS multimillonario
- Agricultura de precision moderna
- Software listo para produccion
- Dashboard ejecutivo de nivel enterprise

Comparable visualmente con:
- Climate FieldView
- John Deere Operations Center
- Auravant
- Stripe
- Linear
- Vercel
