package com.campoapp.maquinaria.service;

import com.campoapp.maquinaria.dto.*;

import java.util.List;

public interface MaquinariaService {
    MaquinariaResumenResponse getResumen(String tipo, String estado, String ubicacion);
    MaquinariaDashboardResponse getDashboard();
    List<MaquinariaResponse> list(String tipo, String estado, String ubicacion);
    MaquinariaResponse getById(String id);
    MaquinariaResponse create(MaquinariaRequest request);
    MaquinariaResponse update(String id, MaquinariaRequest request);
    void delete(String id);
    MaquinariaResponse updateEstado(String id, EstadoMaquinariaRequest request);
    AsignacionMaquinariaResponse asignar(AsignacionMaquinariaRequest request);
    UsoMaquinariaResponse registrarUso(UsoMaquinariaRequest request);
    DocumentoMaquinariaResponse registrarDocumento(DocumentoMaquinariaRequest request);
    List<AsignacionMaquinariaResponse> asignaciones(String maquinariaId);
    List<UsoMaquinariaResponse> usos(String maquinariaId);
    List<DocumentoMaquinariaResponse> documentos(String maquinariaId);
    List<HistorialEstadoMaquinariaResponse> historialEstados(String maquinariaId);
}
