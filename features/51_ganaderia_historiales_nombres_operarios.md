# 51 - Ganaderia: Mostrar Nombres de Operarios en Historiales

## Estado
Pendiente.

## Origen
Detectado durante la verificacion en navegador de la feature [50](50_ganaderia_mobile_animales_ficha_historiales.md): en los historiales del animal (movimientos, vacunas, tratamientos, pesajes), los campos `responsable`/`operario` muestran el **UUID crudo** del operario (ej. `91000000-0000-0000-0000-000000000005`) en vez de su nombre. Los DTOs del backend devuelven el id tal como se persistio (los formularios de las features 45/46 guardan el id del operario seleccionado), y ni el backend ni mobile lo resuelven a nombre al listar.

## Alcance
Elegir e implementar una de las dos vias (preferir la primera):
1. **Backend**: los responses de listado (`MovimientoAnimalResponse`, `AplicacionVacunaResponse`, `TratamientoMedicamentoResponse`, `PesajeResponse`, `HistorialMedicoAnimalResponse`) resuelven el nombre del operario (lookup batch contra `operarios`, fallback al valor crudo si no matchea — el campo historicamente tambien acepto texto libre) y lo exponen como campo `<campo>Nombre` o reemplazando el valor mostrado.
2. **Mobile/Web**: resolver client-side contra la lista de operarios replicada (como ya hace `animal-historial.tsx` con los potreros de movimientos).

Aplicar de forma consistente en la pantalla de historiales mobile (feature 50) y en las tablas web equivalentes de sanidad/alimentacion si muestran el mismo id crudo.

## Referencias Tecnicas
- `mobile/app/ganaderia/animal-historial.tsx` (ya resuelve potreros por id contra la replica: mismo patron aplicable a operarios con `useOperarios`).
- Backend: DTOs en `com.campoapp.ganaderia.dto`, `OperarioRepository`.

## Validacion Tecnica (al implementar)
- Gates estandar (mvn compile, tsc) + verificacion en navegador contra el stack Docker.
