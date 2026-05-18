package com.campoapp.agricultura.dto;

import com.campoapp.agricultura.entity.EventoSiembra.TipoEvento;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record EventoSiembraResponse(
        String id,
        String loteId,
        String loteNombre,
        TipoEvento tipoEvento,
        String estadoFenologico,
        String descripcion,
        LocalDate fecha,
        LocalDateTime createdAt
) {}
