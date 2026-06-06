package com.campoapp.operarios.dto;

import java.time.LocalDateTime;

public record OrdenTrabajoHistorialResponse(
        String id,
        String ordenId,
        String estadoAnterior,
        String estadoNuevo,
        String accion,
        String responsable,
        String observaciones,
        LocalDateTime createdAt
) {
}
