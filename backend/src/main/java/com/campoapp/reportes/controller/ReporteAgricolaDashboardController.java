package com.campoapp.reportes.controller;

import com.campoapp.common.dto.ApiResponse;
import com.campoapp.reportes.dto.ReporteAgricolaDashboardResponse;
import com.campoapp.reportes.dto.ReporteCostosAgricolaResponse;
import com.campoapp.reportes.dto.ReporteGestionAgricolaResponse;
import com.campoapp.reportes.service.ReporteAgricolaDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/reportes/agricola")
@RequiredArgsConstructor
public class ReporteAgricolaDashboardController {
    private final ReporteAgricolaDashboardService service;

    @GetMapping("/dashboard")
    @PreAuthorize("hasAuthority('read:lotes')")
    public ResponseEntity<ApiResponse<ReporteAgricolaDashboardResponse>> dashboard() {
        return ResponseEntity.ok(ApiResponse.ok(service.dashboard()));
    }

    // Feature 84 - Parte 1: estadisticas de costo por hectarea filtradas por periodo/lotes/cultivos.
    @GetMapping("/costos")
    @PreAuthorize("hasAuthority('read:lotes')")
    public ResponseEntity<ApiResponse<ReporteCostosAgricolaResponse>> costos(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta,
            @RequestParam(required = false) List<String> loteIds,
            @RequestParam(required = false) List<String> cultivos) {
        return ResponseEntity.ok(ApiResponse.ok(service.costos(desde, hasta, loteIds, cultivos)));
    }

    // Feature 84 - Parte 2: gestion administrativa (sin filtro de periodo).
    @GetMapping("/gestion")
    @PreAuthorize("hasAuthority('read:lotes')")
    public ResponseEntity<ApiResponse<ReporteGestionAgricolaResponse>> gestion() {
        return ResponseEntity.ok(ApiResponse.ok(service.gestion()));
    }
}
