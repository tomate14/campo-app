package com.campoapp.agricultura.service;

import com.campoapp.agricultura.dto.PropiedadSueloRequest;
import com.campoapp.agricultura.dto.PropiedadSueloResponse;

import java.util.List;
import java.util.Optional;

public interface SueloService {
    List<PropiedadSueloResponse> listarPorLote(String loteId);
    Optional<PropiedadSueloResponse> ultimoAnalisis(String loteId);
    PropiedadSueloResponse buscarPorId(String id);
    PropiedadSueloResponse registrar(PropiedadSueloRequest request);
    PropiedadSueloResponse actualizar(String id, PropiedadSueloRequest request);
    void eliminar(String id);
}
