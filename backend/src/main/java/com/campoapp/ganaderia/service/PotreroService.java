package com.campoapp.ganaderia.service;

import com.campoapp.ganaderia.dto.PotreroRequest;
import com.campoapp.ganaderia.dto.PotreroResponse;

import java.math.BigDecimal;
import java.util.List;

public interface PotreroService {
    List<PotreroResponse> listar(String nombre, String estado, String tipoUso, BigDecimal superficieMin, BigDecimal superficieMax);
    List<PotreroResponse> listarMapa();
    PotreroResponse buscarPorId(String id);
    PotreroResponse crear(PotreroRequest request);
    PotreroResponse actualizar(String id, PotreroRequest request);
    void eliminar(String id);
}
