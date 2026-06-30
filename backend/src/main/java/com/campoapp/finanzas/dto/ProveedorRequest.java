package com.campoapp.finanzas.dto;

import com.campoapp.finanzas.entity.TipoClienteFiscal;

public record ProveedorRequest(
        String razonSocial,
        String cuit,
        TipoClienteFiscal condicionFiscal,
        String email,
        String telefono,
        String direccion,
        String categoria,
        Boolean activo
) {}
