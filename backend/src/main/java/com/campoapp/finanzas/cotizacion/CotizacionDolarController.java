package com.campoapp.finanzas.cotizacion;

import com.campoapp.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// Feature 85: expone la cotizacion del Dolar BNA para el toggle ARS/USD de los dashboards.
@RestController
@RequestMapping("/api/v1/finanzas/cotizaciones")
@RequiredArgsConstructor
@Tag(name = "Cotizaciones", description = "Cotizacion del Dolar BNA para conversion ARS/USD")
public class CotizacionDolarController {

    private final CotizacionDolarService cotizacionDolarService;

    // Valor de referencia no sensible: solo requiere estar autenticado para no dar 403 al dashboard.
    @GetMapping("/dolar")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Obtener la ultima cotizacion del Dolar BNA (compra/venta/fecha/fuente)")
    public ResponseEntity<ApiResponse<CotizacionDolarResponse>> obtenerDolar() {
        CotizacionDolarResponse actual = cotizacionDolarService.obtenerActual();
        if (actual == null) {
            // Sin datos aun: 200 con campos en null (no 404), asi el frontend deshabilita USD.
            actual = new CotizacionDolarResponse(null, null, null, null);
        }
        return ResponseEntity.ok(ApiResponse.ok(actual));
    }
}
