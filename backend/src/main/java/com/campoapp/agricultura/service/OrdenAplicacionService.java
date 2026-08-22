package com.campoapp.agricultura.service;

import com.campoapp.agricultura.dto.plagas.OperarioAsignableResponse;
import com.campoapp.agricultura.dto.plagas.OrdenAplicacionRequest;
import com.campoapp.agricultura.dto.plagas.OrdenAplicacionResponse;
import com.campoapp.agricultura.entity.plagas.EstadoOrdenAplicacion;

import java.util.List;

// Feature 58: ordenes de aplicacion con flujo tercerizado (responsable -> operario).
public interface OrdenAplicacionService {
    // Operarios asignables (lista minima) accesible con read:lotes.
    List<OperarioAsignableResponse> listarOperariosAsignables();
    List<OrdenAplicacionResponse> listar(EstadoOrdenAplicacion estado, String operarioId, String responsableId, String loteId);
    OrdenAplicacionResponse obtener(String id);
    OrdenAplicacionResponse crear(OrdenAplicacionRequest request);
    OrdenAplicacionResponse actualizar(String id, OrdenAplicacionRequest request);
    // El operario asignado acepta la orden (pasa a ACEPTADA, vuelve al responsable/admins).
    OrdenAplicacionResponse aceptar(String id);
    // El responsable o un admin valida la orden -> genera el registro de aplicacion (idempotente).
    OrdenAplicacionResponse validar(String id);
    // El operario asignado rechaza la orden (con motivo).
    OrdenAplicacionResponse rechazar(String id, String motivo);
    // Ordenes de un lote para el historico.
    List<OrdenAplicacionResponse> listarPorLote(String loteId);
}
