package com.campoapp.utilidades.dto;

public record UtilidadOpcionResponse(
        String id,
        String categoria,
        String valor,
        boolean activo,
        int orden
) {}
