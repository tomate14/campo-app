package com.campoapp.ganaderia.dto;

import com.campoapp.ganaderia.entity.MovimientoAnimal;

import java.time.LocalDateTime;

public record MovimientoAnimalResponse(
        String id,
        String animalId,
        String animalCaravana,
        LocalDateTime fecha,
        MovimientoAnimal.TipoMovimiento tipoMovimiento,
        String potreroOrigenId,
        String potreroDestinoId,
        String potreroOrigenNombre,
        String potreroDestinoNombre,
        String ubicacionOrigen,
        String ubicacionDestino,
        String motivo,
        String responsable,
        String responsableNombre,
        String observaciones,
        LocalDateTime createdAt
) {}
