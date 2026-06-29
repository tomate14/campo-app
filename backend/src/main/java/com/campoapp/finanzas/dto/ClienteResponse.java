package com.campoapp.finanzas.dto;

import com.campoapp.finanzas.entity.TipoClienteFiscal;

import java.time.LocalDateTime;

public record ClienteResponse(String id, String razonSocial, String cuit, TipoClienteFiscal condicionFiscal, String email, String telefono, String direccion, Boolean activo, LocalDateTime createdAt, LocalDateTime updatedAt) {}
