package com.campoapp.agricultura.dto.plagas;

import com.campoapp.agricultura.entity.plagas.EstadoOrdenAplicacion;

import java.math.BigDecimal;
import java.time.LocalDateTime;

// Respuesta de una orden de aplicacion (feature 58). `numero` es el correlativo que vive
// en la tabla separada orden_aplicacion_numero; responsableNombre/operarioNombre se resuelven
// desde el catalogo de operarios.
public record OrdenAplicacionResponse(
        String id,
        Long numero,
        String loteId,
        String loteNombre,
        String deteccionId,
        String plagaNombre,
        LocalDateTime fechaAplicacion,
        String producto,
        String principioActivo,
        BigDecimal dosis,
        String unidadDosis,
        BigDecimal volumenCaldoLHa,
        BigDecimal superficieTratadaHa,
        String maquinariaId,
        String observaciones,
        String responsableId,
        String responsableNombre,
        String operarioId,
        String operarioNombre,
        EstadoOrdenAplicacion estado,
        String motivoRechazo,
        String aplicacionId,
        // Feature 84: insumo del catalogo aplicado (nombre resuelto del catalogo de insumos).
        String insumoId,
        String insumoNombre,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
