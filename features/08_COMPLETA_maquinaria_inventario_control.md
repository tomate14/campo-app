# 08 - Maquinaria: Inventario y Control

## DescripciÃ³n
Registro y gestiÃ³n del parque de maquinaria agrÃ­cola con identificaciÃ³n, ubicaciÃ³n y estado operacional.

## Funcionalidades Principales
- Inventario completo de mÃ¡quinas
- Estado operacional en tiempo real
- Disponibilidad y asignaciÃ³n
- Historiales de uso
- Detalles tÃ©cnicos y especificaciones

## Tareas
1. **Registro de MÃ¡quinas**: Tipo, marca, modelo, serie, aÃ±o, caracterÃ­sticas tÃ©cnicas
2. **Estado Operacional**: Disponible, en reparaciÃ³n, inactiva, descartada
3. **UbicaciÃ³n Actual**: DÃ³nde estÃ¡ la mÃ¡quina
4. **AsignaciÃ³n a Operarios**: QuiÃ©n usa la mÃ¡quina
5. **Horometro/Kilometraje**: Registro de horas/km utilizadas
6. **DocumentaciÃ³n**: TÃ­tulos, seguros, permisos
7. **Capacidad y Especificaciones**: Potencia, capacidad, accesorios
8. **Historial de Uso**: Actividades realizadas

## Servicios
- `MaquinariaService`: CRUD y gestiÃ³n
- `UbicacionService`: LocalizaciÃ³n en tiempo real
- `DisponibilidadService`: Control de asignaciones

## Repositorios
- `MaquinariaRepository`
- `EstadoMaquinariaRepository`
- `AsignacionRepository`

## Requisitos TÃ©cnicos
- UUID para cada mÃ¡quina
- Soft delete obligatorio
- AuditorÃ­a de cambios de estado
- Endpoint REST: `/api/v1/maquinaria/inventario`
- Disponible offline

## Integraciones Externas
- GPS/TelemetrÃ­a (ubicaciÃ³n en vivo)
- IoT (sensores de mÃ¡quinas)

## Dependencias
- GeolocalizaciÃ³n (ubicaciÃ³n de mÃ¡quinas)
- Operarios (asignaciones)
- Mantenimiento (estado operacional)
- Finanzas (costo de mÃ¡quinas)
- Reportes (inventario y uso)

