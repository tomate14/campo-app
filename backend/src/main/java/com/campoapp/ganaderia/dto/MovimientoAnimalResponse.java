package com.campoapp.ganaderia.dto;

import com.campoapp.ganaderia.entity.MovimientoAnimal;

import java.time.LocalDateTime;

public record MovimientoAnimalResponse(
        String id,
        String animalId,
        String animalCaravana,
        LocalDateTime fecha,
        MovimientoAnimal.TipoMovimiento tipoMovimiento,
        String ubicacionOrigen,
        String ubicacionDestino,
        String motivo,
        String responsable,
        String observaciones,
        LocalDateTime createdAt
) {}
