package com.campoapp.operarios.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;
import java.time.LocalDate;

public record OperarioRequest(
        String userId,
        String legajo,
        // Email de login opcional: si viene, se usa como email del usuario; si no, se autogenera
        @Email String email,
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
