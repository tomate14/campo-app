package com.campoapp.agricultura.service;

import com.campoapp.agricultura.dto.plagas.*;
import com.campoapp.agricultura.entity.plagas.EstadoDeteccionPlaga;
import com.campoapp.agricultura.entity.plagas.SeveridadPlaga;
import org.springframework.data.domain.Page;

import java.util.List;

public interface PlagasService {
    List<CatalogoPlagaResponse> listarCatalogo(String tipo);
    Page<CatalogoPlagaResponse> listarCatalogoPaginado(String tipo, int page, int size);
    CatalogoPlagaResponse crearCatalogo(CatalogoPlagaRequest request);
    List<DeteccionPlagaResponse> listarDetecciones(String loteId, EstadoDeteccionPlaga estado, SeveridadPlaga severidad, String cultivo);
    Page<DeteccionPlagaResponse> listarDeteccionesPaginadas(String loteId, EstadoDeteccionPlaga estado, SeveridadPlaga severidad, String cultivo, int page, int size);
    DeteccionPlagaResponse obtenerDeteccion(String id);
    DeteccionPlagaResponse crearDeteccion(DeteccionPlagaRequest request);
    DeteccionPlagaResponse cambiarEstado(String id, EstadoDeteccionPlaga estado);
    SeguimientoPlagaResponse crearSeguimiento(String deteccionId, SeguimientoPlagaRequest request);
    AplicacionFitosanitariaResponse crearAplicacion(String deteccionId, AplicacionFitosanitariaRequest request);
    List<AplicacionFitosanitariaResponse> listarAplicaciones();
    Page<AplicacionFitosanitariaResponse> listarAplicacionesPaginadas(int page, int size);
    List<SeguimientoPlagaResponse> listarSeguimientos();
    Page<SeguimientoPlagaResponse> listarSeguimientosPaginados(int page, int size);
    PlagasDashboardResponse dashboard();
    List<DeteccionPlagaResponse> historialLote(String loteId);
    List<DeteccionPlagaResponse> mapaLote(String loteId);
    ResolverLoteResponse resolverLote(ResolverLoteRequest request);
}
