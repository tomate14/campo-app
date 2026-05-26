package com.campoapp.maquinaria.dto;

import java.time.LocalDate;

public record DocumentoMaquinariaResponse(
        String id,
        String maquinariaId,
        String maquinariaCodigo,
        String tipoDocumento,
        String numero,
        LocalDate vencimiento,
        String url,
        String observaciones
) {}
