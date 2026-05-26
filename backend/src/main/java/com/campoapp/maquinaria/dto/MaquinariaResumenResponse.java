package com.campoapp.maquinaria.dto;

import java.util.List;

public record MaquinariaResumenResponse(
        MaquinariaDashboardResponse dashboard,
        List<MaquinariaResponse> maquinas,
        List<AsignacionMaquinariaResponse> asignacionesActivas,
        List<UsoMaquinariaResponse> usosRecientes,
        List<DocumentoMaquinariaResponse> documentos
) {}
