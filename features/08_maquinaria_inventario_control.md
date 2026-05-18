# 08 - Maquinaria: Inventario y Control

## Descripción
Registro y gestión del parque de maquinaria agrícola con identificación, ubicación y estado operacional.

## Funcionalidades Principales
- Inventario completo de máquinas
- Estado operacional en tiempo real
- Disponibilidad y asignación
- Historiales de uso
- Detalles técnicos y especificaciones

## Tareas
1. **Registro de Máquinas**: Tipo, marca, modelo, serie, año, características técnicas
2. **Estado Operacional**: Disponible, en reparación, inactiva, descartada
3. **Ubicación Actual**: Dónde está la máquina
4. **Asignación a Operarios**: Quién usa la máquina
5. **Horometro/Kilometraje**: Registro de horas/km utilizadas
6. **Documentación**: Títulos, seguros, permisos
7. **Capacidad y Especificaciones**: Potencia, capacidad, accesorios
8. **Historial de Uso**: Actividades realizadas

## Servicios
- `MaquinariaService`: CRUD y gestión
- `UbicacionService`: Localización en tiempo real
- `DisponibilidadService`: Control de asignaciones

## Repositorios
- `MaquinariaRepository`
- `EstadoMaquinariaRepository`
- `AsignacionRepository`

## Requisitos Técnicos
- UUID para cada máquina
- Soft delete obligatorio
- Auditoría de cambios de estado
- Endpoint REST: `/api/v1/maquinaria/inventario`
- Disponible offline

## Integraciones Externas
- GPS/Telemetría (ubicación en vivo)
- IoT (sensores de máquinas)

## Dependencias
- Geolocalización (ubicación de máquinas)
- Operarios (asignaciones)
- Mantenimiento (estado operacional)
- Finanzas (costo de máquinas)
- Reportes (inventario y uso)
