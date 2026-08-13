package com.campoapp.agricultura.entity.plagas;

// Estados de una orden de aplicacion (feature 58).
// PENDIENTE: creada por el responsable, esperando al operario asignado.
// ACEPTADA: el operario la acepto -> se genero el registro de aplicacion.
// RECHAZADA: el operario la rechazo (con motivo).
public enum EstadoOrdenAplicacion {
    PENDIENTE,
    ACEPTADA,
    RECHAZADA
}
