# 46 - Ganaderia Mobile: Trazabilidad, Sanidad y Alimentacion

## Estado
Pendiente.

## Origen
Al implementar la feature [45](45_ganaderia_mobile_menu_potreros_alta_edicion.md) (menu de ganaderia mobile), el usuario decidio acotar el alcance de 45 a Potreros (alta/edicion) y a la burbuja "Agregar Reproduccion". El resto de las burbujas del mapa de potreros (Trazabilidad, Sanidad, Alimentacion) y la activacion de esos mismos 3 items en el menu Drawer (`mobile/app/(tabs)/_layout.tsx`) quedan derivados a esta feature nueva.

## Alcance
### 1. Activar en el menu Drawer
Dar ruta real a los 3 items hoy deshabilitados en `mobile/app/(tabs)/_layout.tsx` (sin `route`, icono gris): **Trazabilidad**, **Sanidad**, **Alimentacion**. Definir con el usuario si cada uno abre directo la pantalla de "nueva actividad" o si primero muestra un listado/consulta (como Potreros hoy).

### 2. Burbujas de "nueva actividad" en el mapa de potreros
Agregar a la rail de burbujas de `mobile/app/(tabs)/potreros.tsx` (donde la feature 45 ya deja la burbuja "Agregar Reproduccion" funcional) las 3 restantes, siguiendo el mismo patron visual de "Registrar evento" (`mobile/app/agricola/nueva-siembra.tsx`: pantalla completa, chips de seleccion, `CardGrid`/`SelectableCard` de tipos, formulario condicional):

- **Agregar Trazabilidad**: alta de un nuevo animal. Portar el formulario equivalente de `frontend/src/app/pages/ganaderia-trazabilidad-page/`.
- **Sanidad**: nueva actividad con opciones **Nueva vacuna**, **Nuevo tratamiento**, **Nueva aplicacion**, **Nuevo diagnostico**. Portar de los modales de `frontend/src/app/pages/ganaderia-sanidad-page/` (`vacunaModalOpen`, `tratamientoModalOpen`, `aplicacionModalOpen`, `diagnosticoModalOpen`). Hay overlap con la feature [32](32_ganaderia_sanidad_notificaciones_offline_mobile.md) (pantallas mobile de sanidad, ya pendiente) — evaluar si esta feature la absorbe o si 32 se mantiene separada.
- **Agregar Alimentacion**: nueva actividad con opciones **Nuevo pesaje**, **Registrar suministro**, **Nueva dieta**. Portar de `frontend/src/app/pages/ganaderia-alimentacion-page/`.

## Referencias Tecnicas
- Patron de picker de animal por chips + API `GET /api/v1/ganaderia/trazabilidad/animales` (`AnimalResponse`: `id`, `caravana`, `sexo`, `raza`, `potreroId`, `potreroNombre`, `estado`) — ya agregado como parte de la feature 45 para el picker de Reproduccion, reutilizable aca.
- Backend: `backend/src/main/java/com/campoapp/ganaderia/controller/TrazabilidadAnimalController.java`, `SanidadController.java`, `AlimentacionController.java`.
- Mobile: `mobile/app/(tabs)/_layout.tsx` (menu Drawer), `mobile/app/(tabs)/potreros.tsx` (rail de burbujas).

## Validacion Tecnica (a definir segun alcance final)
- Type-check mobile.
- Prueba manual de cada nueva actividad y de la navegacion del menu.
