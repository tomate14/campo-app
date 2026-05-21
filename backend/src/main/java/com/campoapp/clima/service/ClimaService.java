package com.campoapp.clima.service;

import com.campoapp.clima.dto.DatoClimaResponse;
import com.campoapp.clima.dto.PronosticoResponse;

import java.util.List;
import java.util.Optional;

public interface ClimaService {
    DatoClimaResponse sincronizarLote(String loteId);
    void sincronizarTodosLotes();
    Optional<DatoClimaResponse> obtenerActual(String loteId);
    List<PronosticoResponse> obtenerPronostico(String loteId);
    List<DatoClimaResponse> obtenerHistorico(String loteId, int dias);
}
