package com.campoapp.operarios.service;

import com.campoapp.operarios.dto.OperarioDocumentoRequest;
import com.campoapp.operarios.dto.OperarioDocumentoResponse;
import com.campoapp.operarios.dto.OperarioHistorialRolRequest;
import com.campoapp.operarios.dto.OperarioHistorialRolResponse;
import com.campoapp.operarios.dto.OperarioRequest;
import com.campoapp.operarios.dto.OperarioResponse;
import com.campoapp.operarios.dto.OperarioResumenResponse;

import java.util.List;

public interface OperarioService {
    OperarioResumenResponse resumen(String search, String estado, String rol);
    List<OperarioResponse> listar(String search, String estado, String rol);
    OperarioResponse buscarPorId(String id);
    OperarioResponse crear(OperarioRequest request);
    OperarioResponse actualizar(String id, OperarioRequest request);
    void eliminar(String id);
    OperarioDocumentoResponse agregarDocumento(OperarioDocumentoRequest request);
    OperarioHistorialRolResponse cambiarRol(OperarioHistorialRolRequest request);
}
