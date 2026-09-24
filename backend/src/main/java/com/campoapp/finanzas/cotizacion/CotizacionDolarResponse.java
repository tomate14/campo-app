package com.campoapp.finanzas.cotizacion;

import java.math.BigDecimal;
import java.time.LocalDateTime;

// Feature 85: contrato congelado del endpoint GET /api/v1/finanzas/cotizaciones/dolar.
// Todos los campos pueden venir en null si todavia no se poblo ninguna cotizacion.
public record CotizacionDolarResponse(
        BigDecimal compra,
        BigDecimal venta,
        LocalDateTime fecha,
        String fuente) {
}
