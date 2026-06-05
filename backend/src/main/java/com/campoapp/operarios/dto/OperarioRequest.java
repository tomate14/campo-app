package com.campoapp.operarios.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;
import java.time.LocalDate;

public record OperarioRequest(
        String userId,
        String legajo,
        @NotBlank String nombre,
        @NotBlank String apellido,
        String documentoTipo,
        @NotBlank String documentoNumero,
        String telefono,
        String direccion,
        LocalDate fechaNacimiento,
        @NotBlank String rolOperativo,
        String permisosOperativos,
        String estado,
        LocalDate fechaIngreso,
        @PositiveOrZero BigDecimal salarioBase,
        String contactoEmergencia,
        String telefonoEmergencia,
        String observaciones
) {
}
