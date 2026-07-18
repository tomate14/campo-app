package com.campoapp.ganaderia.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record DiagnosticoSanitarioResponse(
        String id,
        String animalId,
        String animalCaravana,
        LocalDate fechaDiagnostico,
        String enfermedad,
        String severidad,
        String estado,
        String veterinario,
        String veterinarioNombre,
        String tratamientoIndicado,
        String observaciones,
        LocalDateTime createdAt
) {}
