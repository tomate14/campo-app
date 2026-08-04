package com.campoapp.utilidades.service;

import com.campoapp.utilidades.dto.UtilidadOpcionRequest;
import com.campoapp.utilidades.dto.UtilidadOpcionResponse;

import java.util.List;

public interface UtilidadOpcionService {
    List<UtilidadOpcionResponse> listarPorCategoria(String categoria);
    UtilidadOpcionResponse crear(UtilidadOpcionRequest request);
    void eliminar(String id);
}
