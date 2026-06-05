# Features - Plataforma Agropecuaria Integral

## DescripciÃ³n General

Este directorio contiene la especificaciÃ³n de todas las features del sistema agropecuaria Campo. Cada feature estÃ¡ documentada con:
- DescripciÃ³n y objetivos
- Funcionalidades principales
- Tareas especÃ­ficas
- Servicios y Repositorios necesarios
- Requisitos tÃ©cnicos
- Dependencias con otras features

## Estructura de Features

Las features estÃ¡n organizadas por dominio del negocio y nombradas con el formato: `NN_modulo_nombre_feature.md`

### Agricultura (00-03, 25)
| # | Nombre | DescripciÃ³n |
|---|--------|------------|
| 00 | Monitoreo de Siembra y Cosecha | Ciclo completo desde siembra a cosecha |
| 01 | GestiÃ³n de Lotes | AdministraciÃ³n de lotes y propiedades |
| 02 | Clima y Monitoreo | IntegraciÃ³n meteorolÃ³gica e inteligencia climÃ¡tica |
| 03 | Rendimiento y Analytics | AnÃ¡lisis de productividad y KPIs |
| 25 | Control de Plagas y Enfermedades | DetecciÃ³n geoposicionada con fotos GPS |

### GanaderÃ­a (04-07)
| # | Nombre | DescripciÃ³n |
|---|--------|------------|
| 04 | Trazabilidad Animal | SENASA e identificaciÃ³n de animales |
| 05 | Sanidad y VacunaciÃ³n | Programas de inmunizaciÃ³n y medicinas |
| 06 | ReproducciÃ³n y GenealogÃ­a | Programas reproductivos y pedigree |
| 07 | AlimentaciÃ³n y Monitoreo | NutriciÃ³n, pesaje y condiciÃ³n corporal |

### Maquinaria (08-11)
| # | Nombre | DescripciÃ³n |
|---|--------|------------|
| 08 | Inventario y Control | Parque de mÃ¡quinas |
| 09 | Mantenimiento Preventivo | Programas de servicio y reparaciones |
| 10 | GPS y TelemetrÃ­a | Tracking en vivo y sensores |
| 11 | Consumo de Combustible | Monitoreo de eficiencia energÃ©tica |

### Operarios (12-14)
| # | Nombre | DescripciÃ³n |
|---|--------|------------|
| 12 | GestiÃ³n y AdministraciÃ³n | RRHH y RBAC |
| 13 | Ã“rdenes de Trabajo | Sistema de tareas y asignaciones |
| 14 | Disponibilidad y Asignaciones | Calendarios y planificaciÃ³n |

### Inventario (15-16)
| # | Nombre | DescripciÃ³n |
|---|--------|------------|
| 15 | Insumos AgrÃ­colas | Stock de semillas, fertilizantes, etc. |
| 16 | Stock y Control | Almacenes y movimientos centralizados |

### Finanzas (17-19)
| # | Nombre | DescripciÃ³n |
|---|--------|------------|
| 17 | FacturaciÃ³n y Ventas | EmisiÃ³n de comprobantes y AFIP |
| 18 | Compras y Proveedores | Ã“rdenes de compra y gestiÃ³n de deuda |
| 19 | Reportes Financieros | Estados contables y anÃ¡lisis |

### GeolocalizaciÃ³n (20-21)
| # | Nombre | DescripciÃ³n |
|---|--------|------------|
| 20 | Mapas y Lotes | VisualizaciÃ³n de territorio |
| 21 | Tracking de Operarios | LocalizaciÃ³n en vivo de personas |

### Reportes (22-23)
| # | Nombre | DescripciÃ³n |
|---|--------|------------|
| 22 | Operacionales | Productividad diaria |
| 23 | AgrÃ­cola y GanaderÃ­a | Indicadores tÃ©cnicos |

### Infraestructura (24)
| # | Nombre | DescripciÃ³n |
|---|--------|------------|
| 24 | SincronizaciÃ³n Offline-First | Base de datos local y sync |

## Matriz de Dependencias

```
SincronizaciÃ³n (24) â† Todas las features

Reportes (22, 23) â† Todas las features operacionales

Finanzas (17-19) â† Maquinaria, Operarios, Inventario, GanaderÃ­a, Agricultura
â†‘
â”œâ”€ FacturaciÃ³n: Inventario
â”œâ”€ Compras: Inventario, Presupuesto
â””â”€ Reportes: TodoOperacionales, GanaderÃ­a, Maquinaria

Geo (20-21) â† Lotes, MÃ¡quinas, Operarios, Ã“rdenes

Operarios (12-14) â† Nada (base)
â†“ (usado por)
â”œâ”€ Ã“rdenes (13): MÃ¡quinas, Lotes
â”œâ”€ Disponibilidad (14): Ã“rdenes, Finanzas
â””â”€ Gestion (12): RBAC central

Inventario (15-16) â† Nada (base)
â†“ (usado por)
â”œâ”€ Insumos: Agricultura, Sanidad
â””â”€ Stock: Compras, Ventas, Finanzas

Maquinaria (08-11) â† Nada (base)
â†“
â”œâ”€ Inventario: Mantenimiento, GPS
â”œâ”€ Ã“rdenes: Disponibilidad
â””â”€ Finanzas: Costos deprec.

GanaderÃ­a (04-07) â† Nada (base)
â†“
â”œâ”€ Trazabilidad: Operarios, GeolocalizaciÃ³n
â”œâ”€ Sanidad: Inventario (vacunas)
â”œâ”€ ReproducciÃ³n: Trazabilidad
â””â”€ AlimentaciÃ³n: Inventario, Pesaje

Agricultura (00-03) â† Nada (base)
â†“
â”œâ”€ Lotes: GeolocalizaciÃ³n, Reportes
â”œâ”€ Siembra-Cosecha: Lotes, Clima
â”œâ”€ Clima: Lotes, Alertas
â””â”€ Analytics: TodosAgrÃ­cola
```

## Requisitos de ImplementaciÃ³n SegÃºn CLAUDE.md

### Arquitectura
- âœ… Cada feature es un mÃ³dulo independiente
- âœ… Servicios + Repositorios con interfaz e implementaciÃ³n
- âœ… DDD donde sea Ãºtil
- âœ… LÃ³gica en servicios, no en controllers

### Base de Datos
- âœ… UUID obligatorio
- âœ… Soft delete obligatorio
- âœ… AuditorÃ­a automÃ¡tica en todas las features

### APIs
- âœ… REST first
- âœ… OpenAPI obligatorio
- âœ… Versionado `/api/v1`

### Seguridad
- âœ… JWT + OAuth
- âœ… RBAC por feature
- âœ… AuditorÃ­a de acciones crÃ­ticas

### Offline-First
- âœ… Feature 24 de sincronizaciÃ³n
- âœ… Todas las features deben tener soporte offline
- âœ… Bajo consumo de baterÃ­a

### Calidad
- âœ… Cobertura 80% mÃ­nimo
- âœ… Conventional commits
- âœ… PR reviews obligatorios

## PrÃ³ximos Pasos

1. **RevisiÃ³n de Features**: Cada feature debe ser procesada por el Orchestrator Agent
2. **DerivaciÃ³n de Tareas**: Descomponer cada feature en issues
3. **PriorizaciÃ³n**: Definir MVP (Producto MÃ­nimo Viable)
4. **PlanificaciÃ³n de Sprints**: Agrupar features por sprints
5. **ImplementaciÃ³n**: Comenzar desarrollo segÃºn prioridades

## Notas Importantes

- Las features estÃ¡n diseÃ±adas para ser **independientes** pero **conectadas**
- La sincronizaciÃ³n **offline-first** (Feature 24) es **transversal** a todas
- Mantener **bajo acoplamiento** entre mÃ³dulos
- Usar **interfaces** explÃ­citas para comunicaciÃ³n entre features
- Cada feature debe tener **tests con cobertura >= 80%**

---

**Ãšltima actualizaciÃ³n**: 2026-05-16
**Estado**: Borrador listo para revisiÃ³n por Orchestrator Agent

