package com.campoapp.finanzas.service;

import com.campoapp.finanzas.dto.ReportesFinancierosDashboardResponse;

import java.time.LocalDate;

public interface ReportesFinancierosService {
    ReportesFinancierosDashboardResponse dashboard(LocalDate fechaDesde, LocalDate fechaHasta, Integer topClientesLimit, Integer topProveedoresLimit);
}
