package com.campoapp.ganaderia.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record AnimalResponse(
        String id,
        String caravana,
        String razaId,
        String raza,
        String sexo,
        LocalDate fechaNacimiento,
        LocalDate fechaCompra,
        BigDecimal pesoActualKg,
        String rfidCodigo,
        String qrCodigo,
        String estado,
        String potreroId,
        String potreroNombre,
        String madreId,
        String madreCaravana,
        String padreId,
        String padreCaravana,
        String observaciones,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
