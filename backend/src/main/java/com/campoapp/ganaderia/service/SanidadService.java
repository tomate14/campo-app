package com.campoapp.ganaderia.service;

import com.campoapp.ganaderia.dto.*;

import java.time.LocalDate;
import java.util.List;

public interface SanidadService {
    List<VacunaCatalogoResponse> listVacunas(Boolean obligatoria);
    VacunaCatalogoResponse createVacuna(VacunaCatalogoRequest request);
    List<AplicacionVacunaResponse> listAplicaciones(String animalId, String vacunaId, LocalDate desde, LocalDate hasta);
    AplicacionVacunaResponse registrarAplicacion(AplicacionVacunaRequest request);
    List<TratamientoMedicamentoResponse> listTratamientos(String animalId, LocalDate desde, LocalDate hasta);
    TratamientoMedicamentoResponse registrarTratamiento(TratamientoMedicamentoRequest request);
    List<DiagnosticoSanitarioResponse> listDiagnosticos(String animalId, String estado);
    DiagnosticoSanitarioResponse registrarDiagnostico(DiagnosticoSanitarioRequest request);
    SanidadDashboardResponse getDashboard(LocalDate referencia);
    String exportarReporteSanitario(LocalDate desde, LocalDate hasta);
}
