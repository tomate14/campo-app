package com.campoapp.ganaderia.dto;

import java.util.List;

public record AnimalDetalleResponse(
        AnimalResponse animal,
        List<MovimientoAnimalResponse> movimientos,
        List<HistorialMedicoAnimalResponse> historialMedico
) {}
