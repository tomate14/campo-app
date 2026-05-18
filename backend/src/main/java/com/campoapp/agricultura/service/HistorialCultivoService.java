package com.campoapp.agricultura.service;

import com.campoapp.agricultura.dto.HistoricoCultivoRequest;
import com.campoapp.agricultura.dto.HistoricoCultivoResponse;
import com.campoapp.agricultura.dto.RotacionRecomendacionResponse;

import java.util.List;

public interface HistorialCultivoService {
    List<HistoricoCultivoResponse> listarPorLote(String loteId);
    HistoricoCultivoResponse buscarPorId(String id);
    HistoricoCultivoResponse registrar(HistoricoCultivoRequest request);
    HistoricoCultivoResponse actualizar(String id, HistoricoCultivoRequest request);
    void eliminar(String id);
    RotacionRecomendacionResponse recomendarRotacion(String loteId);
}
