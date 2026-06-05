package com.campoapp.operarios.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record OperarioDocumentoResponse(
        String id,
        String operarioId,
        String operarioNombre,
        String tipoDocumento,
        String numero,
        LocalDate fechaEmision,
        LocalDate fechaVencimiento,
        String estado,
        String url,
        String observaciones,
        boolean vencido,
        LocalDateTime createdAt
) {
}
