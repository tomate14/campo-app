package com.campoapp.operarios.dto;

public record OrdenTrabajoCierreRequest(
        String responsable,
        String resultado,
        String motivo,
        Integer duracionRealMin
) {
}
