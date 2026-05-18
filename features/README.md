# Features - Plataforma Agropecuaria Integral

## Descripción General

Este directorio contiene la especificación de todas las features del sistema agropecuaria Campo. Cada feature está documentada con:
- Descripción y objetivos
- Funcionalidades principales
- Tareas específicas
- Servicios y Repositorios necesarios
- Requisitos técnicos
- Dependencias con otras features

## Estructura de Features

Las features están organizadas por dominio del negocio y nombradas con el formato: `NN_modulo_nombre_feature.md`

### Agricultura (00-03, 25)
| # | Nombre | Descripción |
|---|--------|------------|
| 00 | Monitoreo de Siembra y Cosecha | Ciclo completo desde siembra a cosecha |
| 01 | Gestión de Lotes | Administración de lotes y propiedades |
| 02 | Clima y Monitoreo | Integración meteorológica e inteligencia climática |
| 03 | Rendimiento y Analytics | Análisis de productividad y KPIs |
| 25 | Control de Plagas y Enfermedades | Detección geoposicionada con fotos GPS |

### Ganadería (04-07)
| # | Nombre | Descripción |
|---|--------|------------|
| 04 | Trazabilidad Animal | SENASA e identificación de animales |
| 05 | Sanidad y Vacunación | Programas de inmunización y medicinas |
| 06 | Reproducción y Genealogía | Programas reproductivos y pedigree |
| 07 | Alimentación y Monitoreo | Nutrición, pesaje y condición corporal |

### Maquinaria (08-11)
| # | Nombre | Descripción |
|---|--------|------------|
| 08 | Inventario y Control | Parque de máquinas |
| 09 | Mantenimiento Preventivo | Programas de servicio y reparaciones |
| 10 | GPS y Telemetría | Tracking en vivo y sensores |
| 11 | Consumo de Combustible | Monitoreo de eficiencia energética |

### Operarios (12-14)
| # | Nombre | Descripción |
|---|--------|------------|
| 12 | Gestión y Administración | RRHH y RBAC |
| 13 | Órdenes de Trabajo | Sistema de tareas y asignaciones |
| 14 | Disponibilidad y Asignaciones | Calendarios y planificación |

### Inventario (15-16)
| # | Nombre | Descripción |
|---|--------|------------|
| 15 | Insumos Agrícolas | Stock de semillas, fertilizantes, etc. |
| 16 | Stock y Control | Almacenes y movimientos centralizados |

### Finanzas (17-19)
| # | Nombre | Descripción |
|---|--------|------------|
| 17 | Facturación y Ventas | Emisión de comprobantes y AFIP |
| 18 | Compras y Proveedores | Órdenes de compra y gestión de deuda |
| 19 | Reportes Financieros | Estados contables y análisis |

### Geolocalización (20-21)
| # | Nombre | Descripción |
|---|--------|------------|
| 20 | Mapas y Lotes | Visualización de territorio |
| 21 | Tracking de Operarios | Localización en vivo de personas |

### Reportes (22-23)
| # | Nombre | Descripción |
|---|--------|------------|
| 22 | Operacionales | Productividad diaria |
| 23 | Agrícola y Ganadería | Indicadores técnicos |

### Infraestructura (24)
| # | Nombre | Descripción |
|---|--------|------------|
| 24 | Sincronización Offline-First | Base de datos local y sync |

## Matriz de Dependencias

```
Sincronización (24) ← Todas las features

Reportes (22, 23) ← Todas las features operacionales

Finanzas (17-19) ← Maquinaria, Operarios, Inventario, Ganadería, Agricultura
↑
├─ Facturación: Inventario
├─ Compras: Inventario, Presupuesto
└─ Reportes: TodoOperacionales, Ganadería, Maquinaria

Geo (20-21) ← Lotes, Máquinas, Operarios, Órdenes

Operarios (12-14) ← Nada (base)
↓ (usado por)
├─ Órdenes (13): Máquinas, Lotes
├─ Disponibilidad (14): Órdenes, Finanzas
└─ Gestion (12): RBAC central

Inventario (15-16) ← Nada (base)
↓ (usado por)
├─ Insumos: Agricultura, Sanidad
└─ Stock: Compras, Ventas, Finanzas

Maquinaria (08-11) ← Nada (base)
↓
├─ Inventario: Mantenimiento, GPS
├─ Órdenes: Disponibilidad
└─ Finanzas: Costos deprec.

Ganadería (04-07) ← Nada (base)
↓
├─ Trazabilidad: Operarios, Geolocalización
├─ Sanidad: Inventario (vacunas)
├─ Reproducción: Trazabilidad
└─ Alimentación: Inventario, Pesaje

Agricultura (00-03) ← Nada (base)
↓
├─ Lotes: Geolocalización, Reportes
├─ Siembra-Cosecha: Lotes, Clima
├─ Clima: Lotes, Alertas
└─ Analytics: TodosAgrícola
```

## Requisitos de Implementación Según CLAUDE.md

### Arquitectura
- ✅ Cada feature es un módulo independiente
- ✅ Servicios + Repositorios con interfaz e implementación
- ✅ DDD donde sea útil
- ✅ Lógica en servicios, no en controllers

### Base de Datos
- ✅ UUID obligatorio
- ✅ Soft delete obligatorio
- ✅ Auditoría automática en todas las features

### APIs
- ✅ REST first
- ✅ OpenAPI obligatorio
- ✅ Versionado `/api/v1`

### Seguridad
- ✅ JWT + OAuth
- ✅ RBAC por feature
- ✅ Auditoría de acciones críticas

### Offline-First
- ✅ Feature 24 de sincronización
- ✅ Todas las features deben tener soporte offline
- ✅ Bajo consumo de batería

### Calidad
- ✅ Cobertura 80% mínimo
- ✅ Conventional commits
- ✅ PR reviews obligatorios

## Próximos Pasos

1. **Revisión de Features**: Cada feature debe ser procesada por el Orchestrator Agent
2. **Derivación de Tareas**: Descomponer cada feature en issues
3. **Priorización**: Definir MVP (Producto Mínimo Viable)
4. **Planificación de Sprints**: Agrupar features por sprints
5. **Implementación**: Comenzar desarrollo según prioridades

## Notas Importantes

- Las features están diseñadas para ser **independientes** pero **conectadas**
- La sincronización **offline-first** (Feature 24) es **transversal** a todas
- Mantener **bajo acoplamiento** entre módulos
- Usar **interfaces** explícitas para comunicación entre features
- Cada feature debe tener **tests con cobertura >= 80%**

---

**Última actualización**: 2026-05-16
**Estado**: Borrador listo para revisión por Orchestrator Agent
