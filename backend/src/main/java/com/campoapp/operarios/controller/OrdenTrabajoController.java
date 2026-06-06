package com.campoapp.operarios.controller;

import com.campoapp.common.dto.ApiResponse;
import com.campoapp.operarios.dto.OrdenTrabajoActividadRequest;
import com.campoapp.operarios.dto.OrdenTrabajoCierreRequest;
import com.campoapp.operarios.dto.OrdenTrabajoEstadoRequest;
import com.campoapp.operarios.dto.OrdenTrabajoRequest;
import com.campoapp.operarios.dto.OrdenTrabajoResponse;
import com.campoapp.operarios.dto.OrdenTrabajoResumenResponse;
import com.campoapp.operarios.service.OrdenTrabajoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/v1/operarios/ordenes")
@RequiredArgsConstructor
public class OrdenTrabajoController {

    private final OrdenTrabajoService ordenTrabajoService;

    @GetMapping("/resumen")
    @PreAuthorize("hasAuthority('read:ordenes')")
    public ResponseEntity<ApiResponse<OrdenTrabajoResumenResponse>> resumen(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) String operarioId,
            @RequestParam(required = false) String loteId,
            @RequestParam(required = false) String prioridad,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaFin
    ) {
        return ResponseEntity.ok(ApiResponse.ok(ordenTrabajoService.resumen(search, estado, operarioId, loteId, prioridad, fechaInicio, fechaFin)));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('read:ordenes')")
    public ResponseEntity<ApiResponse<List<OrdenTrabajoResponse>>> listar(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) String operarioId,
            @RequestParam(required = false) String loteId,
            @RequestParam(required = false) String prioridad,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaFin
    ) {
        return ResponseEntity.ok(ApiResponse.ok(ordenTrabajoService.listar(search, estado, operarioId, loteId, prioridad, fechaInicio, fechaFin)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('read:ordenes')")
    public ResponseEntity<ApiResponse<OrdenTrabajoResponse>> obtener(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.ok(ordenTrabajoService.buscarPorId(id)));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('create:ordenes')")
    public ResponseEntity<ApiResponse<OrdenTrabajoResponse>> crear(@Valid @RequestBody OrdenTrabajoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(ordenTrabajoService.crear(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('update:ordenes')")
    public ResponseEntity<ApiResponse<OrdenTrabajoResponse>> actualizar(@PathVariable String id, @Valid @RequestBody OrdenTrabajoRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(ordenTrabajoService.actualizar(id, request)));
    }

    @PatchMapping("/{id}/estado")
    @PreAuthorize("hasAuthority('update:ordenes')")
    public ResponseEntity<ApiResponse<OrdenTrabajoResponse>> estado(@PathVariable String id, @Valid @RequestBody OrdenTrabajoEstadoRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(ordenTrabajoService.cambiarEstado(id, request)));
    }

    @PostMapping("/{id}/actividades")
    @PreAuthorize("hasAuthority('update:ordenes')")
    public ResponseEntity<ApiResponse<OrdenTrabajoResponse>> actividad(@PathVariable String id, @Valid @RequestBody OrdenTrabajoActividadRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(ordenTrabajoService.agregarActividad(id, request)));
    }

    @PostMapping("/{id}/aceptar")
    @PreAuthorize("hasAuthority('update:ordenes')")
    public ResponseEntity<ApiResponse<OrdenTrabajoResponse>> aceptar(@PathVariable String id, @RequestBody OrdenTrabajoCierreRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(ordenTrabajoService.aceptar(id, request)));
    }

    @PostMapping("/{id}/rechazar")
    @PreAuthorize("hasAuthority('update:ordenes')")
    public ResponseEntity<ApiResponse<OrdenTrabajoResponse>> rechazar(@PathVariable String id, @RequestBody OrdenTrabajoCierreRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(ordenTrabajoService.rechazar(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('delete:ordenes')")
    public ResponseEntity<Void> eliminar(@PathVariable String id) {
        ordenTrabajoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
