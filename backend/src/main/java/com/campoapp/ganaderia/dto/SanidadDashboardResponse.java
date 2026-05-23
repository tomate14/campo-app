package com.campoapp.ganaderia.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record SanidadDashboardResponse(
        long vacunasCatalogadas,
        long aplicacionesMesActual,
        long diagnosticosAbiertos,
        long tratamientosActivos,
        BigDecimal costoSanitarioMes,
        List<AlertaVacunaResponse> alertasVacunas,
        List<DiagnosticoSanitarioResponse> diagnosticosRecientes,
        List<TratamientoMedicamentoResponse> tratamientosRecientes
) {
    public record AlertaVacunaResponse(
            String aplicacionId,
            String animalId,
            String animalCaravana,
            String vacunaNombre,
            LocalDate proximaDosisFecha,
            long diasRestantes,
            String estado
    ) {}
}
