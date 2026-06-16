package com.campoapp.ganaderia.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record RegistroAlimentacionResponse(
        String id,
        String animalId,
        String animalCaravana,
        String dietaId,
        String dietaNombre,
        LocalDate fecha,
        String alimento,
        BigDecimal cantidadKg,
        BigDecimal costoTotal,
        String potreroId,
        String potreroNombre,
        String potrero,
        String responsable,
        String observaciones,
        LocalDateTime createdAt
) {}
