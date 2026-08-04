package com.campoapp.agricultura.dto.insumos;

import java.math.BigDecimal;

public record InsumoAgricolaRequest(
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
        Boolean activo
) {}
