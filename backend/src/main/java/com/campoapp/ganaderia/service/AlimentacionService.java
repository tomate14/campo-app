package com.campoapp.ganaderia.service;

import com.campoapp.ganaderia.dto.*;

import java.time.LocalDate;
import java.util.List;

public interface AlimentacionService {
    AlimentacionResumenResponse getResumen(LocalDate desde, LocalDate hasta);
    AlimentacionDashboardResponse getDashboard(LocalDate referencia);
    List<DietaResponse> listDietas();
    DietaResponse createDieta(DietaRequest request);
    List<RegistroAlimentacionResponse> listRegistros(String animalId, LocalDate desde, LocalDate hasta);
    RegistroAlimentacionResponse registrarAlimentacion(RegistroAlimentacionRequest request);
    List<PesajeResponse> listPesajes(String animalId, LocalDate desde, LocalDate hasta);
    PesajeResponse registrarPesaje(PesajeRequest request);
}
