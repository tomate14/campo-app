package com.campoapp.agricultura.dto;

import com.campoapp.agricultura.entity.EventoSiembra.TipoEvento;
import jakarta.validation.constraints.*;
import java.time.LocalDate;

public record EventoSiembraRequest(
        @NotBlank(message = "El lote es requerido")
        String loteId,

        @NotNull(message = "El tipo de evento es requerido")
        TipoEvento tipoEvento,

        @Size(max = 20, message = "El estado fenológico no puede superar 20 caracteres")
        String estadoFenologico,

        String descripcion,

        @NotNull(message = "La fecha es requerida")
        LocalDate fecha
) {}
