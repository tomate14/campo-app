package com.campoapp.ganaderia.service;

import com.campoapp.ganaderia.dto.*;
import org.springframework.data.domain.Page;

import java.time.LocalDate;
import java.util.List;

public interface SanidadService {
    List<VacunaCatalogoResponse> listVacunas(Boolean obligatoria);
    VacunaCatalogoResponse createVacuna(VacunaCatalogoRequest request);
    List<AplicacionVacunaResponse> listAplicaciones(String animalId, String vacunaId, LocalDate desde, LocalDate hasta);
    Page<AplicacionVacunaResponse> listAplicacionesPaginadas(String animalId, String vacunaId, LocalDate desde, LocalDate hasta, int page, int size);
    AplicacionVacunaResponse registrarAplicacion(AplicacionVacunaRequest request);
    List<TratamientoMedicamentoResponse> listTratamientos(String animalId, LocalDate desde, LocalDate hasta);
    Page<TratamientoMedicamentoResponse> listTratamientosPaginados(String animalId, LocalDate desde, LocalDate hasta, int page, int size);
    TratamientoMedicamentoResponse registrarTratamiento(TratamientoMedicamentoRequest request);
    List<DiagnosticoSanitarioResponse> listDiagnosticos(String animalId, String estado);
    Page<DiagnosticoSanitarioResponse> listDiagnosticosPaginados(String animalId, String estado, int page, int size);
    DiagnosticoSanitarioResponse registrarDiagnostico(DiagnosticoSanitarioRequest request);
    SanidadDashboardResponse getDashboard(LocalDate referencia);
    String exportarReporteSanitario(LocalDate desde, LocalDate hasta);
}
