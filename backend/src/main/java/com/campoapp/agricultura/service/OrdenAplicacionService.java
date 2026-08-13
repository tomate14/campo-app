package com.campoapp.agricultura.service;

import com.campoapp.agricultura.dto.plagas.OrdenAplicacionRequest;
import com.campoapp.agricultura.dto.plagas.OrdenAplicacionResponse;
import com.campoapp.agricultura.entity.plagas.EstadoOrdenAplicacion;

import java.util.List;

// Feature 58: ordenes de aplicacion con flujo tercerizado (responsable -> operario).
public interface OrdenAplicacionService {
    List<OrdenAplicacionResponse> listar(EstadoOrdenAplicacion estado, String operarioId, String responsableId, String loteId);
    OrdenAplicacionResponse obtener(String id);
    OrdenAplicacionResponse crear(OrdenAplicacionRequest request);
    OrdenAplicacionResponse actualizar(String id, OrdenAplicacionRequest request);
    // El operario acepta la orden -> se genera el registro de aplicacion (idempotente).
    OrdenAplicacionResponse aceptar(String id);
    // El operario rechaza la orden (con motivo).
    OrdenAplicacionResponse rechazar(String id, String motivo);
    // Ordenes de un lote para el historico.
    List<OrdenAplicacionResponse> listarPorLote(String loteId);
}
