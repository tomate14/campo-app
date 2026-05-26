package com.campoapp.ganaderia.dto;

import java.math.BigDecimal;
import java.util.List;

public record AlimentacionDashboardResponse(
        int dietasActivas,
        BigDecimal kgSuministradosMes,
        BigDecimal costoMes,
        BigDecimal gananciaPromedioKg,
        BigDecimal conversionAlimenticia,
        List<AlertaNutricionalResponse> alertas
) {
    public record AlertaNutricionalResponse(
            String animalId,
            String animalCaravana,
            String tipo,
            String prioridad,
            String mensaje
    ) {}
}
