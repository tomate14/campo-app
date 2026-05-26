package com.campoapp.maquinaria.dto;

import java.util.List;

public record MantenimientoResumenResponse(
        MantenimientoDashboardResponse dashboard,
        List<PlanMantenimientoResponse> planes,
        List<MantenimientoProgramadoResponse> programaciones,
        List<IntervencionMantenimientoResponse> intervenciones
) {}
