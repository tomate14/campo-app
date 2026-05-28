package com.campoapp.agricultura.service;

import com.campoapp.agricultura.dto.plagas.*;
import com.campoapp.agricultura.entity.plagas.EstadoDeteccionPlaga;
import com.campoapp.agricultura.entity.plagas.SeveridadPlaga;
import com.campoapp.agricultura.entity.plagas.TipoPlaga;

import java.util.List;

public interface PlagasService {
    List<CatalogoPlagaResponse> listarCatalogo(TipoPlaga tipo);
    CatalogoPlagaResponse crearCatalogo(CatalogoPlagaRequest request);
    List<DeteccionPlagaResponse> listarDetecciones(String loteId, EstadoDeteccionPlaga estado, SeveridadPlaga severidad, String cultivo);
    DeteccionPlagaResponse obtenerDeteccion(String id);
    DeteccionPlagaResponse crearDeteccion(DeteccionPlagaRequest request);
    DeteccionPlagaResponse cambiarEstado(String id, EstadoDeteccionPlaga estado);
    SeguimientoPlagaResponse crearSeguimiento(String deteccionId, SeguimientoPlagaRequest request);
    AplicacionFitosanitariaResponse crearAplicacion(String deteccionId, AplicacionFitosanitariaRequest request);
    List<AplicacionFitosanitariaResponse> listarAplicaciones();
    List<SeguimientoPlagaResponse> listarSeguimientos();
    PlagasDashboardResponse dashboard();
    List<DeteccionPlagaResponse> historialLote(String loteId);
    List<DeteccionPlagaResponse> mapaLote(String loteId);
    ResolverLoteResponse resolverLote(ResolverLoteRequest request);
}
