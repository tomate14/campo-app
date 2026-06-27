package com.campoapp.agricultura.dto.insumos;

import com.campoapp.agricultura.entity.insumos.TipoInsumoAgricola;
import com.campoapp.agricultura.entity.insumos.UnidadMedidaInsumo;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record InsumoAgricolaResponse(
        String id,
        String codigo,
        String nombre,
        TipoInsumoAgricola tipo,
        String marca,
        String presentacion,
        UnidadMedidaInsumo unidadMedida,
        String principioActivo,
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
