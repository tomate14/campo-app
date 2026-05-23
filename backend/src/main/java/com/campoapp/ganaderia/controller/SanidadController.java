package com.campoapp.ganaderia.controller;

import com.campoapp.common.dto.ApiResponse;
import com.campoapp.ganaderia.dto.*;
import com.campoapp.ganaderia.service.SanidadService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/ganaderia/sanidad")
@RequiredArgsConstructor
public class SanidadController {

    private final SanidadService sanidadService;

    @GetMapping("/dashboard")
    @PreAuthorize("hasAuthority('read:animales')")
    public ResponseEntity<ApiResponse<SanidadDashboardResponse>> dashboard(@RequestParam(required = false) LocalDate referencia) {
        return ResponseEntity.ok(ApiResponse.ok(sanidadService.getDashboard(referencia)));
    }

    @GetMapping("/vacunas")
    @PreAuthorize("hasAuthority('read:animales')")
    public ResponseEntity<ApiResponse<List<VacunaCatalogoResponse>>> listVacunas(@RequestParam(required = false) Boolean obligatoria) {
        return ResponseEntity.ok(ApiResponse.ok(sanidadService.listVacunas(obligatoria)));
    }

    @PostMapping("/vacunas")
    @PreAuthorize("hasAuthority('update:animales')")
    public ResponseEntity<ApiResponse<VacunaCatalogoResponse>> createVacuna(@Valid @RequestBody VacunaCatalogoRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(sanidadService.createVacuna(request)));
    }

    @GetMapping("/aplicaciones")
    @PreAuthorize("hasAuthority('read:animales')")
    public ResponseEntity<ApiResponse<List<AplicacionVacunaResponse>>> listAplicaciones(
            @RequestParam(required = false) String animalId,
            @RequestParam(required = false) String vacunaId,
            @RequestParam(required = false) LocalDate desde,
            @RequestParam(required = false) LocalDate hasta
    ) {
        return ResponseEntity.ok(ApiResponse.ok(sanidadService.listAplicaciones(animalId, vacunaId, desde, hasta)));
    }

    @PostMapping("/aplicaciones")
    @PreAuthorize("hasAuthority('update:animales')")
    public ResponseEntity<ApiResponse<AplicacionVacunaResponse>> createAplicacion(@Valid @RequestBody AplicacionVacunaRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(sanidadService.registrarAplicacion(request)));
    }

    @GetMapping("/tratamientos")
    @PreAuthorize("hasAuthority('read:animales')")
    public ResponseEntity<ApiResponse<List<TratamientoMedicamentoResponse>>> listTratamientos(
            @RequestParam(required = false) String animalId,
            @RequestParam(required = false) LocalDate desde,
            @RequestParam(required = false) LocalDate hasta
    ) {
        return ResponseEntity.ok(ApiResponse.ok(sanidadService.listTratamientos(animalId, desde, hasta)));
    }

    @PostMapping("/tratamientos")
    @PreAuthorize("hasAuthority('update:animales')")
    public ResponseEntity<ApiResponse<TratamientoMedicamentoResponse>> createTratamiento(@Valid @RequestBody TratamientoMedicamentoRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(sanidadService.registrarTratamiento(request)));
    }

    @GetMapping("/diagnosticos")
    @PreAuthorize("hasAuthority('read:animales')")
    public ResponseEntity<ApiResponse<List<DiagnosticoSanitarioResponse>>> listDiagnosticos(
            @RequestParam(required = false) String animalId,
            @RequestParam(required = false) String estado
    ) {
        return ResponseEntity.ok(ApiResponse.ok(sanidadService.listDiagnosticos(animalId, estado)));
    }

    @PostMapping("/diagnosticos")
    @PreAuthorize("hasAuthority('update:animales')")
    public ResponseEntity<ApiResponse<DiagnosticoSanitarioResponse>> createDiagnostico(@Valid @RequestBody DiagnosticoSanitarioRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(sanidadService.registrarDiagnostico(request)));
    }

    @GetMapping(value = "/reportes/auditoria", produces = "text/csv")
    @PreAuthorize("hasAuthority('read:animales')")
    public ResponseEntity<String> exportReporte(
            @RequestParam(required = false) LocalDate desde,
            @RequestParam(required = false) LocalDate hasta
    ) {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=sanidad-auditoria.csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(sanidadService.exportarReporteSanitario(desde, hasta));
    }
}
