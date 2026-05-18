package com.campoapp.agricultura.service;

import com.campoapp.agricultura.dto.LoteRequest;
import com.campoapp.agricultura.dto.LoteResponse;

import java.util.List;

public interface LoteService {
    List<LoteResponse> listarTodos();
    List<LoteResponse> listarPorTemporada(String temporada);
    List<LoteResponse> listarPorCultivo(String cultivo);
    LoteResponse buscarPorId(String id);
    LoteResponse crear(LoteRequest request);
    LoteResponse actualizar(String id, LoteRequest request);
    void eliminar(String id);
}
