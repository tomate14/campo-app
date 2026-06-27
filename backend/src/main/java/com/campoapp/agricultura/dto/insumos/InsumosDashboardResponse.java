package com.campoapp.agricultura.dto.insumos;

import java.math.BigDecimal;
import java.util.List;

public record InsumosDashboardResponse(
        long totalInsumos,
        long insumosActivos,
        long reordenPendiente,
        long lotesPorVencer,
        BigDecimal stockValorizado,
        List<InsumoAgricolaResponse> alertasReorden,
        List<StockInsumoResponse> vencimientosProximos,
        List<MovimientoInsumoResponse> ultimosMovimientos
) {}
