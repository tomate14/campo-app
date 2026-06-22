package com.campoapp.agricultura.dto.plagas;

import com.campoapp.agricultura.entity.plagas.ResultadoSeguimientoPlaga;
import com.campoapp.agricultura.entity.plagas.SeveridadPlaga;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public record SeguimientoPlagaRequest(
        LocalDateTime fecha,
        @NotNull ResultadoSeguimientoPlaga resultado,
        @NotNull SeveridadPlaga severidad,
        String observaciones,
        String responsableId,
        String responsable
) {}
