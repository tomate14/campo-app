package com.campoapp.agricultura.dto;

import java.util.List;

public record RotacionRecomendacionResponse(
        String loteId,
        String loteNombre,
        String ultimoCultivo,
        String ultimaTemporada,
        List<String> cultivosRecomendados,
        List<String> cultivosEvitar,
        String razon
) {}
