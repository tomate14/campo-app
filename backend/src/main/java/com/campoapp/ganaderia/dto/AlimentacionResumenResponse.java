package com.campoapp.ganaderia.dto;

import java.util.List;

public record AlimentacionResumenResponse(
        AlimentacionDashboardResponse dashboard,
        List<DietaResponse> dietas,
        List<RegistroAlimentacionResponse> registros,
        List<PesajeResponse> pesajes
) {}
