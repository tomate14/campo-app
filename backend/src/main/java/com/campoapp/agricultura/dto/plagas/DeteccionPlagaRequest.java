package com.campoapp.agricultura.dto.plagas;

import com.campoapp.agricultura.entity.plagas.EstadoDeteccionPlaga;
import com.campoapp.agricultura.entity.plagas.OrigenGeolocalizacion;
import com.campoapp.agricultura.entity.plagas.SeveridadPlaga;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record DeteccionPlagaRequest(
        @NotBlank String loteId,
        @NotBlank String catalogoPlagaId,
        LocalDateTime fechaDeteccion,
        String cultivo,
        @NotNull SeveridadPlaga severidad,
        BigDecimal areaAfectadaHa,
        BigDecimal porcentajeAfectado,
        EstadoDeteccionPlaga estado,
        BigDecimal latitud,
        BigDecimal longitud,
        BigDecimal precisionMetros,
        OrigenGeolocalizacion origenGeolocalizacion,
        String fotoUrl,
        String fotoNombre,
        String fotoContentType,
        Long fotoTamanioBytes,
        String descripcion,
        String responsable
) {}
