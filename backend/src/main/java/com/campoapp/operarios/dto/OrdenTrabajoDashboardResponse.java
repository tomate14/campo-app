package com.campoapp.operarios.dto;

public record OrdenTrabajoDashboardResponse(
        long total,
        long pendientes,
        long enProgreso,
        long completadas,
        long canceladas,
        long rechazadas,
        long vencidas,
        long actividadesRegistradas
) {
}
