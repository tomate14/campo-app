package com.campoapp.agricultura.dto.plagas;

public record PlagasDashboardResponse(
        long casosAbiertos,
        long enTratamiento,
        long controlados,
        long alertasCriticas
) {}
