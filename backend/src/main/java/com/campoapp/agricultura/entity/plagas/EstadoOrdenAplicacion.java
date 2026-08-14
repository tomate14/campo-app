package com.campoapp.agricultura.entity.plagas;

// Estados de una orden de aplicacion (feature 58).
// PENDIENTE: creada por el responsable, esperando al operario asignado.
// ACEPTADA: el operario la acepto; vuelve al responsable/admins para validar (sin aplicacion aun).
// VALIDADA: el responsable o un admin la valido -> se genero el registro de aplicacion.
// RECHAZADA: el operario la rechazo (con motivo).
public enum EstadoOrdenAplicacion {
    PENDIENTE,
    ACEPTADA,
    VALIDADA,
    RECHAZADA
}
