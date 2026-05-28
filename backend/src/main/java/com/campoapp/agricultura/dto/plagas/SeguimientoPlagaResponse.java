package com.campoapp.agricultura.dto.plagas;

import com.campoapp.agricultura.entity.plagas.ResultadoSeguimientoPlaga;
import com.campoapp.agricultura.entity.plagas.SeveridadPlaga;
import java.time.LocalDateTime;

public record SeguimientoPlagaResponse(
        String id,
        String deteccionId,
        String plagaNombre,
        String loteNombre,
        LocalDateTime fecha,
        ResultadoSeguimientoPlaga resultado,
        SeveridadPlaga severidad,
        String observaciones,
        String responsable,
        LocalDateTime createdAt
) {}
