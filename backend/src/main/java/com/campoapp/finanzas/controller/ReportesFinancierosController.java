package com.campoapp.finanzas.controller;

import com.campoapp.common.dto.ApiResponse;
import com.campoapp.finanzas.dto.ReportesFinancierosDashboardResponse;
import com.campoapp.finanzas.service.ReportesFinancierosService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/finanzas/reportes")
@RequiredArgsConstructor
@Tag(name = "Finanzas - Reportes financieros")
public class ReportesFinancierosController {
    private final ReportesFinancierosService service;

    @GetMapping("/dashboard")
    @PreAuthorize("hasAuthority('read:finanzas')")
    public ResponseEntity<ApiResponse<ReportesFinancierosDashboardResponse>> dashboard(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaDesde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaHasta,
            @RequestParam(required = false) Integer topClientesLimit,
            @RequestParam(required = false) Integer topProveedoresLimit) {
        return ResponseEntity.ok(ApiResponse.ok(service.dashboard(fechaDesde, fechaHasta, topClientesLimit, topProveedoresLimit)));
    }
}
