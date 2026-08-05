package com.campoapp.utilidades.service;

import com.campoapp.utilidades.dto.UtilidadOpcionRequest;
import com.campoapp.utilidades.dto.UtilidadOpcionResponse;

import java.util.List;

public interface UtilidadOpcionService {
    List<UtilidadOpcionResponse> listarPorCategoria(String categoria);
    UtilidadOpcionResponse crear(UtilidadOpcionRequest request);
    // La baja necesita la categoria para saber en que tabla-catalogo operar.
    void eliminar(String categoria, String id);
}
