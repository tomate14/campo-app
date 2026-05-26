package com.campoapp.maquinaria.controller;

import com.campoapp.common.dto.ApiResponse;
import com.campoapp.maquinaria.dto.*;
import com.campoapp.maquinaria.service.MantenimientoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/maquinaria/mantenimiento")
@RequiredArgsConstructor
public class MantenimientoController {
    private final MantenimientoService mantenimientoService;

    @GetMapping
    @PreAuthorize("hasAuthority('read:maquinaria')")
    public ResponseEntity<ApiResponse<MantenimientoResumenResponse>> resumen(
            @RequestParam(required = false) String maquinariaId,
            @RequestParam(required = false) String estado
    ) {
        return ResponseEntity.ok(ApiResponse.ok(mantenimientoService.getResumen(maquinariaId, estado)));
    }

    @GetMapping("/dashboard")
    @PreAuthorize("hasAuthority('read:maquinaria')")
    public ResponseEntity<ApiResponse<MantenimientoDashboardResponse>> dashboard() {
        return ResponseEntity.ok(ApiResponse.ok(mantenimientoService.getDashboard()));
    }

    @GetMapping("/planes")
    @PreAuthorize("hasAuthority('read:maquinaria')")
    public ResponseEntity<ApiResponse<List<PlanMantenimientoResponse>>> listPlanes() {
        return ResponseEntity.ok(ApiResponse.ok(mantenimientoService.listPlanes()));
    }

    @PostMapping("/planes")
    @PreAuthorize("hasAuthority('update:maquinaria')")
    public ResponseEntity<ApiResponse<PlanMantenimientoResponse>> createPlan(@Valid @RequestBody PlanMantenimientoRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(mantenimientoService.createPlan(request)));
    }

    @GetMapping("/programaciones")
    @PreAuthorize("hasAuthority('read:maquinaria')")
    public ResponseEntity<ApiResponse<List<MantenimientoProgramadoResponse>>> listProgramaciones(
            @RequestParam(required = false) String maquinariaId,
            @RequestParam(required = false) String estado
    ) {
        return ResponseEntity.ok(ApiResponse.ok(mantenimientoService.listProgramaciones(maquinariaId, estado)));
    }

    @PostMapping("/programaciones")
    @PreAuthorize("hasAuthority('update:maquinaria')")
    public ResponseEntity<ApiResponse<MantenimientoProgramadoResponse>> createProgramacion(@Valid @RequestBody MantenimientoProgramadoRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(mantenimientoService.createProgramacion(request)));
    }

    @PatchMapping("/programaciones/{id}/estado")
    @PreAuthorize("hasAuthority('update:maquinaria')")
    public ResponseEntity<ApiResponse<MantenimientoProgramadoResponse>> updateProgramacionEstado(@PathVariable String id, @RequestParam String estado) {
        return ResponseEntity.ok(ApiResponse.ok(mantenimientoService.updateProgramacionEstado(id, estado)));
    }

    @GetMapping("/intervenciones")
    @PreAuthorize("hasAuthority('read:maquinaria')")
    public ResponseEntity<ApiResponse<List<IntervencionMantenimientoResponse>>> listIntervenciones(
            @RequestParam(required = false) String maquinariaId,
            @RequestParam(required = false) String tipo
    ) {
        return ResponseEntity.ok(ApiResponse.ok(mantenimientoService.listIntervenciones(maquinariaId, tipo)));
    }

    @PostMapping("/intervenciones")
    @PreAuthorize("hasAuthority('update:maquinaria')")
    public ResponseEntity<ApiResponse<IntervencionMantenimientoResponse>> createIntervencion(@Valid @RequestBody IntervencionMantenimientoRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(mantenimientoService.createIntervencion(request)));
    }

    @GetMapping("/intervenciones/{id}/repuestos")
    @PreAuthorize("hasAuthority('read:maquinaria')")
    public ResponseEntity<ApiResponse<List<RepuestoUtilizadoResponse>>> listRepuestos(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.ok(mantenimientoService.listRepuestos(id)));
    }
}
