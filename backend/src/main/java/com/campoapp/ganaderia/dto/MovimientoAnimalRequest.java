package com.campoapp.ganaderia.dto;

import com.campoapp.ganaderia.entity.MovimientoAnimal;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record MovimientoAnimalRequest(
        @NotBlank String animalId,
        @NotNull LocalDateTime fecha,
        @NotNull MovimientoAnimal.TipoMovimiento tipoMovimiento,
        String ubicacionOrigen,
        String ubicacionDestino,
        String motivo,
        String responsable,
        String observaciones
) {}
