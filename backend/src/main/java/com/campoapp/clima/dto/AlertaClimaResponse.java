package com.campoapp.clima.dto;

import com.campoapp.clima.entity.AlertaClima.TipoAlerta;
import com.campoapp.clima.entity.AlertaClima.Severidad;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record AlertaClimaResponse(
        String id,
        String loteId,
        String loteNombre,
        TipoAlerta tipoAlerta,
        Severidad severidad,
        String mensaje,
        BigDecimal valorMedido,
        boolean activa,
        boolean leida,
        LocalDateTime fecha,
        LocalDateTime createdAt
) {}
