package com.campoapp.reportes.dto;

import com.campoapp.operarios.dto.OrdenTrabajoDashboardResponse;
import com.campoapp.reportes.dto.ReporteAgricolaDashboardResponse.TareaResumen;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

// Feature 84 - Parte 2 (gestion administrativa): sin filtro de periodo.
public record ReporteGestionAgricolaResponse(
        List<AlertaGestion> alertas,
        List<OrdenPorValidar> ordenesPorValidar,
        OrdenTrabajoDashboardResponse ordenesTrabajo,
        List<TareaResumen> tareasRecomendadas
) {
    public record AlertaGestion(
            String tipo,
            String titulo,
            String detalle,
            String severidad,
            LocalDateTime fecha,
            String origen
    ) {}

    public record OrdenPorValidar(
            String id,
            Long numero,
            String loteNombre,
            String insumoNombre,
            BigDecimal dosis,
            String unidadDosis,
            BigDecimal superficieTratadaHa,
            String operarioNombre
    ) {}
}
