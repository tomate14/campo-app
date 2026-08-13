package com.campoapp.agricultura.dto.plagas;

// Feature 58: operario asignable a una orden de aplicacion (lista minima).
// Se expone bajo el permiso read:lotes para que los propios operarios (que NO tienen
// read:usuarios) puedan operar el modulo de ordenes de aplicacion.
public record OperarioAsignableResponse(
        String id,
        String nombre,
        String apellido,
        String userId
) {}
