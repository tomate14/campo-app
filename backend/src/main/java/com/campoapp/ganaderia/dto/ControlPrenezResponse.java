package com.campoapp.ganaderia.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record ControlPrenezResponse(
        String id,
        String vacaId,
        String vacaCaravana,
        LocalDate fechaDiagnostico,
        String estado,
        LocalDate fechaEstimadaParto,
        String nivelRiesgoParto,
        String veterinario,
        String observaciones,
        LocalDateTime createdAt
) {}
