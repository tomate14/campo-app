package com.campoapp.reportes.controller;

import com.campoapp.common.dto.ApiResponse;
import com.campoapp.reportes.dto.ReporteAgricolaDashboardResponse;
import com.campoapp.reportes.service.ReporteAgricolaDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}
