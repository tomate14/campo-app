package com.campoapp.ganaderia.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Alta de alerta de potrero. No incluye usuarioId a proposito:
 * el service lo toma del token (SecurityContext) para que el cliente
 * no pueda crear alertas a nombre de otro usuario.
 */
public record AlertaPotreroRequest(
        @NotBlank String potreroId,
        @NotNull LocalDate fecha,
        @NotBlank String gravedad,
        @NotBlank String observacion,
        BigDecimal latitud,
        BigDecimal longitud
) {}
