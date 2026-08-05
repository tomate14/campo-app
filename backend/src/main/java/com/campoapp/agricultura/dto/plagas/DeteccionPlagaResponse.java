package com.campoapp.agricultura.dto.plagas;

import com.campoapp.agricultura.entity.plagas.EstadoDeteccionPlaga;
import com.campoapp.agricultura.entity.plagas.OrigenGeolocalizacion;
import com.campoapp.agricultura.entity.plagas.SeveridadPlaga;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record DeteccionPlagaResponse(
        String id,
        String loteId,
        String loteNombre,
        String catalogoPlagaId,
        String plagaNombre,
        String tipo,
        // Feature 72: valor resuelto del catalogo TIPO_PLAGA (tipo sigue siendo el id).
        String tipoNombre,
        LocalDateTime fechaDeteccion,
        String cultivo,
        // Feature 72: valor resuelto del catalogo CULTIVO (cultivo sigue siendo el id).
        String cultivoNombre,
        SeveridadPlaga severidad,
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
        String responsableId,
        String responsable,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
