package com.campoapp.operarios.dto;

import java.util.List;

public record OrdenTrabajoResumenResponse(
        OrdenTrabajoDashboardResponse dashboard,
        List<OrdenTrabajoResponse> ordenes
) {
}
