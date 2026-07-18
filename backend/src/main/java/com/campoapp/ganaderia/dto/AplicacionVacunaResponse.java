package com.campoapp.ganaderia.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record AplicacionVacunaResponse(
        String id,
        String animalId,
        String animalCaravana,
        String vacunaId,
        String vacunaNombre,
        Boolean vacunaObligatoria,
        LocalDate fechaAplicacion,
        LocalDate proximaDosisFecha,
        String operario,
        String operarioNombre,
        String loteMarca,
        BigDecimal costoAplicado,
        String observaciones,
        LocalDateTime createdAt
) {}
