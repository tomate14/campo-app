package com.campoapp.agricultura.dto.insumos;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record InsumoAgricolaResponse(
        String id,
        String codigo,
        String nombre,
        String tipo,
        String marca,
        String presentacion,
        String unidadMedida,
        String principioActivo,
        String proveedorId,
        String proveedor,
        String origen,
        String descripcion,
        BigDecimal precioUnitario,
        BigDecimal stockMinimo,
        BigDecimal stockMaximo,
        Boolean activo,
        BigDecimal stockTotal,
        BigDecimal valorStock,
        LocalDate proximoVencimiento,
        Boolean requiereReorden,
        Boolean tieneVencimientoProximo,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
