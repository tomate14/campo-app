package com.campoapp.ganaderia.dto;

import java.time.LocalDate;

public record AlertaReproductivaResponse(
        String tipo,
        String animalId,
        String animalCaravana,
        LocalDate fecha,
        String prioridad,
        String nivelRiesgoParto,
        String mensaje
) {}
