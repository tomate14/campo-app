package com.campoapp.reportes.service;

import com.campoapp.reportes.dto.ReporteAgricolaDashboardResponse;
import com.campoapp.reportes.dto.ReporteCostosAgricolaResponse;
import com.campoapp.reportes.dto.ReporteGestionAgricolaResponse;

import java.time.LocalDate;
import java.util.List;

public interface ReporteAgricolaDashboardService {
    ReporteAgricolaDashboardResponse dashboard();

    // Feature 84 - Parte 1: costo total por hectarea filtrado por periodo, lotes y cultivos.
    ReporteCostosAgricolaResponse costos(LocalDate desde, LocalDate hasta, List<String> loteIds, List<String> cultivos);

    // Feature 84 - Parte 2: gestion administrativa (sin filtro de periodo).
    ReporteGestionAgricolaResponse gestion();
}
