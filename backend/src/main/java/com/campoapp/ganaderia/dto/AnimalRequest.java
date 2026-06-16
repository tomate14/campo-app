package com.campoapp.ganaderia.dto;

import jakarta.validation.constraints.NotBlank;

import java.math.BigDecimal;
import java.time.LocalDate;

public record AnimalRequest(
        @NotBlank String caravana,
        @NotBlank String raza,
        String sexo,
        LocalDate fechaNacimiento,
        LocalDate fechaCompra,
        BigDecimal pesoActualKg,
        String rfidCodigo,
        String qrCodigo,
        String estado,
        String potreroId,
        String ubicacionActual,
        String madreId,
        String padreId,
        String observaciones
) {}
