package com.campoapp.operarios.dto;

import java.util.List;

public record OperarioResumenResponse(
        OperarioDashboardResponse dashboard,
        List<OperarioResponse> operarios,
        List<OperarioDocumentoResponse> documentos,
        List<OperarioHistorialRolResponse> historialRoles
) {
}
