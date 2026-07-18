package com.campoapp.ganaderia.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record PesajeResponse(
        String id,
        String animalId,
        String animalCaravana,
        LocalDate fecha,
        BigDecimal pesoKg,
        BigDecimal condicionCorporal,
        String metodo,
        String responsable,
        String responsableNombre,
        String observaciones,
        LocalDateTime createdAt
) {}
