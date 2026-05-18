package com.campoapp.agricultura.service;

import com.campoapp.agricultura.dto.RegistroCosechaRequest;
import com.campoapp.agricultura.dto.RegistroCosechaResponse;

import java.util.List;

public interface CosechaService {
    List<RegistroCosechaResponse> listarPorLote(String loteId);
    RegistroCosechaResponse buscarPorId(String id);
    RegistroCosechaResponse registrar(RegistroCosechaRequest request);
    RegistroCosechaResponse actualizar(String id, RegistroCosechaRequest request);
    void eliminar(String id);
    Double calcularRendimientoPromedio(String loteId);
}
