package com.campoapp.agricultura.service;

import com.campoapp.agricultura.dto.LoteRequest;
import com.campoapp.agricultura.dto.LoteReporteResponse;
import com.campoapp.agricultura.dto.LoteResponse;

import java.math.BigDecimal;
import java.util.List;

public interface LoteService {
    List<LoteResponse> listarTodos();
    List<LoteResponse> listarPorTemporada(String temporada);
    List<LoteResponse> listarPorCultivo(String cultivo);
    List<LoteResponse> buscarConFiltros(String temporada, String cultivo, BigDecimal areaMin, BigDecimal areaMax, BigDecimal phMin, BigDecimal phMax, Boolean tienePoligono);
    LoteResponse buscarPorId(String id);
    LoteResponse crear(LoteRequest request);
    LoteResponse actualizar(String id, LoteRequest request);
    String exportarGeoJson(String temporada, String cultivo, BigDecimal areaMin, BigDecimal areaMax, BigDecimal phMin, BigDecimal phMax, Boolean tienePoligono);
    List<LoteResponse> importarGeoJson(String geoJson);
    LoteReporteResponse generarReporte(String id);
    void eliminar(String id);
}
