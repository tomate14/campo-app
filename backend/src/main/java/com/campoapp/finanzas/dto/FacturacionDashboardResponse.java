package com.campoapp.finanzas.dto;

import java.math.BigDecimal;

public record FacturacionDashboardResponse(long clientesActivos, long facturasEmitidas, BigDecimal ventasMes, BigDecimal cuentasPorCobrar, BigDecimal cobradoMes, long vencidas) {}
