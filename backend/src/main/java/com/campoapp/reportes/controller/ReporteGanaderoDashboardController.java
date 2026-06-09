package com.campoapp.reportes.controller;

import com.campoapp.common.dto.ApiResponse;
import com.campoapp.reportes.dto.ReporteGanaderoDashboardResponse;
import com.campoapp.reportes.service.ReporteGanaderoDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/reportes/ganaderia")
@RequiredArgsConstructor
public class ReporteGanaderoDashboardController {
    private final ReporteGanaderoDashboardService service;

    @GetMapping("/dashboard")
    @PreAuthorize("hasAuthority('read:animales')")
    public ResponseEntity<ApiResponse<ReporteGanaderoDashboardResponse>> dashboard() {
        return ResponseEntity.ok(ApiResponse.ok(service.dashboard()));
    }
}
