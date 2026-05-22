# 30 - Ganaderia: Integracion SENASA, RFID y Offline

## Descripcion
Continuacion de la Feature 04 para cerrar las capacidades que requieren integracion normativa real, hardware de lectura y sincronizacion offline-first en trazabilidad animal.

## Objetivo
Completar la trazabilidad ganadera con integracion externa efectiva, captura desde dispositivos de campo y sincronizacion resiliente sin conectividad.

## Tareas
1. **Integracion SENASA Real**: interoperabilidad con formato y flujo normativo definitivo.
2. **Lectura RFID**: captura desde lectores compatibles y asociacion directa al animal.
3. **Escaneo QR**: lectura desde camara o dispositivo handheld.
4. **Offline de Movimientos**: registro local y cola de sincronizacion.
5. **Conflictos de Sincronizacion**: estrategia de merge y auditoria.
6. **Validacion de Campo**: pruebas con flujo real de corrales y potreros.

## Requisitos Tecnicos
- Cola local para altas y movimientos.
- Reintentos de sincronizacion.
- Exportacion/importacion normativa versionada.
- Adaptadores para hardware de escaneo.

## Dependencias
- 04_ganaderia_trazabilidad_animal
- 24_sincronizacion_offline_first
