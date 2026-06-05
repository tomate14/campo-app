package com.campoapp.clima.service;

import com.campoapp.clima.dto.DatoClimaResponse;
import com.campoapp.clima.dto.PrecipitacionDiariaResponse;
import com.campoapp.clima.dto.PronosticoResponse;

import java.util.List;
import java.util.Optional;

public interface ClimaService {
    DatoClimaResponse sincronizarLote(String loteId);
    void sincronizarTodosLotes();
    void sincronizarPrecipitacionesHistoricas(int dias);
    Optional<DatoClimaResponse> obtenerActual(String loteId);
    List<PronosticoResponse> obtenerPronostico(String loteId);
    List<DatoClimaResponse> obtenerHistorico(String loteId, int dias);
    List<PrecipitacionDiariaResponse> obtenerPrecipitacionesDiarias(String loteId, int dias);
}
