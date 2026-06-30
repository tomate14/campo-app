package com.campoapp.finanzas.dto;

import java.math.BigDecimal;

public record ComprasDashboardResponse(
        long proveedoresActivos,
        long comprasRegistradas,
        BigDecimal comprasPeriodo,
        BigDecimal cuentasPorPagar,
        BigDecimal pagadoPeriodo,
        long comprasVencidas
) {}
