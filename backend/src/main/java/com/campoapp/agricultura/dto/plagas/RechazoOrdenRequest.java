package com.campoapp.agricultura.dto.plagas;

// Motivo del rechazo de una orden de aplicacion (feature 58).
public record RechazoOrdenRequest(
        String motivo
) {}
