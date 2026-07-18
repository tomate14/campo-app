package com.campoapp.ganaderia.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record TratamientoMedicamentoResponse(
        String id,
        String animalId,
        String animalCaravana,
        LocalDate fechaInicio,
        LocalDate fechaFin,
        String medicamento,
        String dosis,
        String viaAplicacion,
        String responsable,
        String responsableNombre,
        String motivo,
        BigDecimal costo,
        String observaciones,
        LocalDateTime createdAt
) {}
