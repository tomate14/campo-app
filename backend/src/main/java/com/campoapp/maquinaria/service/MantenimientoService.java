package com.campoapp.maquinaria.service;

import com.campoapp.maquinaria.dto.*;

import java.util.List;

public interface MantenimientoService {
    MantenimientoResumenResponse getResumen(String maquinariaId, String estado);
    MantenimientoDashboardResponse getDashboard();
    List<PlanMantenimientoResponse> listPlanes();
    PlanMantenimientoResponse createPlan(PlanMantenimientoRequest request);
    List<MantenimientoProgramadoResponse> listProgramaciones(String maquinariaId, String estado);
    MantenimientoProgramadoResponse createProgramacion(MantenimientoProgramadoRequest request);
    MantenimientoProgramadoResponse updateProgramacionEstado(String id, String estado);
    List<IntervencionMantenimientoResponse> listIntervenciones(String maquinariaId, String tipo);
    IntervencionMantenimientoResponse createIntervencion(IntervencionMantenimientoRequest request);
    List<RepuestoUtilizadoResponse> listRepuestos(String intervencionId);
}
