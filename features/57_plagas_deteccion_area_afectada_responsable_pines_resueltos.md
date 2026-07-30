# 57 - Plagas: área afectada georreferenciada, responsable automático y pines resueltos

## Descripción
Mejoras de UX y georreferenciación en la detección de plagas: dibujar en el mapa
un círculo proporcional al área afectada, calcular el porcentaje afectado del lote
automáticamente, precargar el responsable con el usuario logueado, y sacar del
mapa los pines resueltos manteniéndolos en un histórico con opción de mostrarlos.

## Alcance
1. **Círculo de área afectada en el pin**: al ingresar el área afectada (ha),
   dibujar sobre el mapa (web y mobile) un círculo centrado en el pin cuyo radio
   represente esa superficie (radio = sqrt(áreaHa·10000/π) en metros). Se
   actualiza al cambiar el valor.
2. **% afectado automático**: el porcentaje del campo afectado se calcula solo
   como `areaAfectadaHa / superficieTotalDelLote · 100` (usando el área del lote).
   Dejar el campo de % como derivado (solo lectura) en vez de carga manual.
3. **Responsable automático**: el select con buscador de responsable se precarga
   por defecto con el **usuario logueado** (token), sin dejar de permitir cambiarlo.
   Aplica a los formularios de detección/seguimiento (y aplicación, ver feature 58).
4. **Pines resueltos → histórico del mapa**: cuando una detección/alerta queda
   resuelta, su pin se **quita del mapa** por defecto, pero permanece en el
   histórico; agregar un toggle "Mostrar resueltos" para volver a verlos.

## Requisitos Técnicos
- Web: círculo con MapLibre (layer circle o GeoJSON); mobile: `Circle` de
  react-native-maps.
- % derivado del área del lote (ya disponible en `Lote.area`).
- Usuario logueado desde el token (backend ya resuelve el usuario; en cliente,
  precargar el operario correspondiente en el selector).
- Filtro de estado (resuelto/abierto) en las capas del mapa y en la card de capas.

## Dependencias
- Feature 37 (plagas), 38/47 (mapas y alertas), 31 (selector con buscador).

## Estado
Pendiente.
