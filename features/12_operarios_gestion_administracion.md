# 12 - Operarios: Gestión y Administración

## Descripción
Registro integral de operarios, roles, permisos y seguimiento de personal en operaciones agrícolas.

## Funcionalidades Principales
- Base de datos de operarios
- Roles y permisos (RBAC)
- Documentación legal (DNI, contratos)
- Seguimiento de jornadas
- Evaluación de desempeño

## Tareas
1. **Registro de Operarios**: Datos personales, documento, contacto
2. **Roles y Permisos**: Asignación de roles (peón, tractorista, supervisor, etc.)
3. **Documentación**: Certificados, licencias, habilitaciones
4. **Contrato y Legales**: Datos del contrato, salario, fechas
5. **RBAC (Control de Acceso)**: Qué puede hacer cada rol en el sistema
6. **Disponibilidad**: Calendarios de trabajo
7. **Evaluación de Desempeño**: Calificaciones, incidentes
8. **Historial de Cambios**: Promociones, cambios de rol

## Servicios
- `OperarioService`: CRUD y gestión
- `RBACService`: Control de permisos
- `DesempenoService`: Evaluación y seguimiento

## Repositorios
- `OperarioRepository`
- `RolRepository`
- `PermisoRepository`
- `DesempenoRepository`

## Requisitos Técnicos
- UUID para cada operario
- Soft delete obligatorio
- Auditoría de cambios de rol/permisos
- Endpoint REST: `/api/v1/operarios/gestion`
- Cumplimiento normativo laboral
- Disponible offline (base de datos de operarios)

## Integraciones Externas
- Sistema de autenticación (OAuth/JWT)

## Dependencias
- Autenticación (login)
- Finanzas (nómina)
- Reportes (análisis de desempeño)
- Órdenes de Trabajo (asignaciones)
