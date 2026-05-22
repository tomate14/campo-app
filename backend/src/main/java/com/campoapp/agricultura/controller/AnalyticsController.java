package com.campoapp.agricultura.controller;

import com.campoapp.agricultura.dto.AgriculturaAnalyticsResponse;
import com.campoapp.agricultura.service.AnalyticsService;
import com.campoapp.agricultura.service.ReporteService;
import com.campoapp.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/agricola/analytics")
@RequiredArgsConstructor
@Tag(name = "Analytics", description = "Rendimiento y analytics agricola")
public class AnalyticsController {

    private final AnalyticsService analyticsService;
    private final ReporteService reporteService;

    @GetMapping
    @PreAuthorize("hasAuthority('read:reportes') or hasAuthority('read:cosecha')")
    @Operation(summary = "Obtener dashboard de analytics agricola")
    public ResponseEntity<ApiResponse<AgriculturaAnalyticsResponse>> obtener(
            @RequestParam(required = false) String loteId,
            @RequestParam(required = false) String cultivo,
            @RequestParam(required = false) String temporada,
            @RequestParam(required = false) LocalDate desde,
            @RequestParam(required = false) LocalDate hasta,
            @RequestParam(required = false, defaultValue = "MENSUAL") String granularidad
    ) {
        return ResponseEntity.ok(ApiResponse.ok(
                analyticsService.obtenerAnalytics(loteId, cultivo, temporada, desde, hasta, granularidad)
        ));
    }

    @GetMapping(value = "/reporte.pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    @PreAuthorize("hasAuthority('read:reportes') or hasAuthority('read:cosecha')")
    @Operation(summary = "Exportar reporte PDF de analytics agricola")
    public ResponseEntity<byte[]> exportarPdf(
            @RequestParam(required = false) String loteId,
            @RequestParam(required = false) String cultivo,
            @RequestParam(required = false) String temporada,
            @RequestParam(required = false) LocalDate desde,
            @RequestParam(required = false) LocalDate hasta,
            @RequestParam(required = false, defaultValue = "MENSUAL") String granularidad
    ) {
        AgriculturaAnalyticsResponse analytics = analyticsService.obtenerAnalytics(loteId, cultivo, temporada, desde, hasta, granularidad);
        byte[] pdf = reporteService.generarReporteAnalyticsPdf(analytics);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=analytics-agricola.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }
}
