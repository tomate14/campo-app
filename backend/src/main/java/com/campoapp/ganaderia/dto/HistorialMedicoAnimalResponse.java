package com.campoapp.ganaderia.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record HistorialMedicoAnimalResponse(
        String id,
        String animalId,
        String animalCaravana,
        LocalDate fecha,
        String diagnostico,
        String tratamiento,
        String veterinario,
        String observaciones,
        LocalDateTime createdAt
) {}
