package com.campoapp.ganaderia.dto;

import java.util.List;

public record ReproduccionResumenResponse(
        ReproduccionDashboardResponse dashboard,
        List<MontaResponse> montas,
        List<InseminacionResponse> inseminaciones,
        List<ControlPrenezResponse> controlesPrenez,
        List<PartoResponse> partos,
        List<IndiceGeneticoResponse> indices
) {}
