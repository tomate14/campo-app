package com.campoapp.ganaderia.service;

import com.campoapp.ganaderia.dto.*;

import java.time.LocalDate;
import java.util.List;

public interface ReproduccionService {
    ReproduccionResumenResponse getResumen(LocalDate desde, LocalDate hasta);
    ReproduccionDashboardResponse getDashboard(LocalDate referencia);
    List<MontaResponse> listMontas(LocalDate desde, LocalDate hasta);
    MontaResponse registrarMonta(MontaRequest request);
    List<InseminacionResponse> listInseminaciones(LocalDate desde, LocalDate hasta);
    InseminacionResponse registrarInseminacion(InseminacionRequest request);
    List<ControlPrenezResponse> listControlesPrenez(String estado);
    ControlPrenezResponse registrarControlPrenez(ControlPrenezRequest request);
    List<PartoResponse> listPartos(LocalDate desde, LocalDate hasta);
    PartoResponse registrarParto(PartoRequest request);
    List<IndiceGeneticoResponse> listIndices();
    IndiceGeneticoResponse registrarIndice(IndiceGeneticoRequest request);
    GenealogiaAnimalResponse getGenealogia(String animalId);
    List<RecomendacionCruzamientoResponse> getRecomendaciones();
}
