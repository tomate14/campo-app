package com.campoapp.operarios.service;

import com.campoapp.operarios.dto.OrdenTrabajoActividadRequest;
import com.campoapp.operarios.dto.OrdenTrabajoCierreRequest;
import com.campoapp.operarios.dto.OrdenTrabajoEstadoRequest;
import com.campoapp.operarios.dto.OrdenTrabajoRequest;
import com.campoapp.operarios.dto.OrdenTrabajoResponse;
import com.campoapp.operarios.dto.OrdenTrabajoResumenResponse;

import java.time.LocalDateTime;
import java.util.List;

public interface OrdenTrabajoService {
    OrdenTrabajoResumenResponse resumen(String search, String estado, String operarioId, String loteId, String prioridad);
    OrdenTrabajoResumenResponse resumen(String search, String estado, String operarioId, String loteId, String prioridad, LocalDateTime fechaInicio, LocalDateTime fechaFin);
    List<OrdenTrabajoResponse> listar(String search, String estado, String operarioId, String loteId, String prioridad);
    List<OrdenTrabajoResponse> listar(String search, String estado, String operarioId, String loteId, String prioridad, LocalDateTime fechaInicio, LocalDateTime fechaFin);
    OrdenTrabajoResponse buscarPorId(String id);
    OrdenTrabajoResponse crear(OrdenTrabajoRequest request);
    OrdenTrabajoResponse actualizar(String id, OrdenTrabajoRequest request);
    void eliminar(String id);
    OrdenTrabajoResponse cambiarEstado(String id, OrdenTrabajoEstadoRequest request);
    OrdenTrabajoResponse agregarActividad(String id, OrdenTrabajoActividadRequest request);
    OrdenTrabajoResponse aceptar(String id, OrdenTrabajoCierreRequest request);
    OrdenTrabajoResponse rechazar(String id, OrdenTrabajoCierreRequest request);
}
