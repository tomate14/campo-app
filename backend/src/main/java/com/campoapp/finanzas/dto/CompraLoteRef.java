package com.campoapp.finanzas.dto;

import java.math.BigDecimal;

// Feature 84: referencia a un lote atribuido a una compra (para el prorrateo por hectarea).
public record CompraLoteRef(
        String loteId,
        String loteNombre,
        BigDecimal area
) {}
