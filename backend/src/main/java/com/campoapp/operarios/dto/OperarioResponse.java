package com.campoapp.operarios.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record OperarioResponse(
        String id,
        String userId,
        String username,
        String legajo,
        String nombre,
        String apellido,
        String nombreCompleto,
        String documentoTipo,
        String documentoNumero,
        String telefono,
        String direccion,
        LocalDate fechaNacimiento,
        String rolOperativo,
        String permisosOperativos,
        String estado,
        LocalDate fechaIngreso,
        BigDecimal salarioBase,
        String contactoEmergencia,
        String telefonoEmergencia,
        String observaciones,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
