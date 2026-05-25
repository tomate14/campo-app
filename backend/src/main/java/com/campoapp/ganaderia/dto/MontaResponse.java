package com.campoapp.ganaderia.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record MontaResponse(
        String id,
        String vacaId,
        String vacaCaravana,
        String toroId,
        String toroCaravana,
        LocalDate fecha,
        String resultado,
        String observaciones,
        LocalDateTime createdAt
) {}
