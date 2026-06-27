package com.campoapp.agricultura.dto.insumos;

import com.campoapp.agricultura.entity.insumos.TipoInsumoAgricola;
import com.campoapp.agricultura.entity.insumos.UnidadMedidaInsumo;

import java.math.BigDecimal;

public record InsumoAgricolaRequest(
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
        Boolean activo
) {}
