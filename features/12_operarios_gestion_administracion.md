# 12 - Operarios: GestiÃ³n y AdministraciÃ³n

## DescripciÃ³n
Registro integral de operarios, roles, permisos y seguimiento de personal en operaciones agrÃ­colas.

## Funcionalidades Principales
- Base de datos de operarios
- Roles y permisos (RBAC)
- DocumentaciÃ³n legal (DNI, contratos)
- Seguimiento de jornadas
- EvaluaciÃ³n de desempeÃ±o

## Tareas
1. **Registro de Operarios**: Datos personales, documento, contacto
2. **Roles y Permisos**: AsignaciÃ³n de roles (peÃ³n, tractorista, supervisor, etc.)
3. **DocumentaciÃ³n**: Certificados, licencias, habilitaciones
4. **Contrato y Legales**: Datos del contrato, salario, fechas
5. **RBAC (Control de Acceso)**: QuÃ© puede hacer cada rol en el sistema
6. **Disponibilidad**: Calendarios de trabajo
7. **EvaluaciÃ³n de DesempeÃ±o**: Calificaciones, incidentes
8. **Historial de Cambios**: Promociones, cambios de rol

## Servicios
- `OperarioService`: CRUD y gestiÃ³n
- `RBACService`: Control de permisos
- `DesempenoService`: EvaluaciÃ³n y seguimiento

## Repositorios
- `OperarioRepository`
- `RolRepository`
- `PermisoRepository`
- `DesempenoRepository`

## Requisitos TÃ©cnicos
- UUID para cada operario
- Soft delete obligatorio
- AuditorÃ­a de cambios de rol/permisos
- Endpoint REST: `/api/v1/operarios/gestion`
- Cumplimiento normativo laboral
- Disponible offline (base de datos de operarios)

## Integraciones Externas
- Sistema de autenticaciÃ³n (OAuth/JWT)

## Dependencias
- AutenticaciÃ³n (login)
- Finanzas (nÃ³mina)
- Reportes (anÃ¡lisis de desempeÃ±o)
- Ã“rdenes de Trabajo (asignaciones)

