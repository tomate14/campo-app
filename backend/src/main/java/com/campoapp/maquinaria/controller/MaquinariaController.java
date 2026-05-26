package com.campoapp.maquinaria.controller;

import com.campoapp.common.dto.ApiResponse;
import com.campoapp.maquinaria.dto.*;
import com.campoapp.maquinaria.service.MaquinariaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/maquinaria/inventario")
@RequiredArgsConstructor
public class MaquinariaController {

    private final MaquinariaService maquinariaService;

    @GetMapping
    @PreAuthorize("hasAuthority('read:maquinaria')")
    public ResponseEntity<ApiResponse<MaquinariaResumenResponse>> resumen(
            @RequestParam(required = false) String tipo,
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) String ubicacion
    ) {
        return ResponseEntity.ok(ApiResponse.ok(maquinariaService.getResumen(tipo, estado, ubicacion)));
    }

    @GetMapping("/dashboard")
    @PreAuthorize("hasAuthority('read:maquinaria')")
    public ResponseEntity<ApiResponse<MaquinariaDashboardResponse>> dashboard() {
        return ResponseEntity.ok(ApiResponse.ok(maquinariaService.getDashboard()));
    }

    @GetMapping("/maquinas")
    @PreAuthorize("hasAuthority('read:maquinaria')")
    public ResponseEntity<ApiResponse<List<MaquinariaResponse>>> list(
            @RequestParam(required = false) String tipo,
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) String ubicacion
    ) {
        return ResponseEntity.ok(ApiResponse.ok(maquinariaService.list(tipo, estado, ubicacion)));
    }

    @GetMapping("/maquinas/{id}")
    @PreAuthorize("hasAuthority('read:maquinaria')")
    public ResponseEntity<ApiResponse<MaquinariaResponse>> getById(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.ok(maquinariaService.getById(id)));
    }

    @PostMapping("/maquinas")
    @PreAuthorize("hasAuthority('create:maquinaria')")
    public ResponseEntity<ApiResponse<MaquinariaResponse>> create(@Valid @RequestBody MaquinariaRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(maquinariaService.create(request)));
    }

    @PutMapping("/maquinas/{id}")
    @PreAuthorize("hasAuthority('update:maquinaria')")
    public ResponseEntity<ApiResponse<MaquinariaResponse>> update(@PathVariable String id, @Valid @RequestBody MaquinariaRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(maquinariaService.update(id, request)));
    }

    @DeleteMapping("/maquinas/{id}")
    @PreAuthorize("hasAuthority('delete:maquinaria')")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        maquinariaService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/maquinas/{id}/estado")
    @PreAuthorize("hasAuthority('update:maquinaria')")
    public ResponseEntity<ApiResponse<MaquinariaResponse>> updateEstado(@PathVariable String id, @Valid @RequestBody EstadoMaquinariaRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(maquinariaService.updateEstado(id, request)));
    }

    @GetMapping("/maquinas/{id}/asignaciones")
    @PreAuthorize("hasAuthority('read:maquinaria')")
    public ResponseEntity<ApiResponse<List<AsignacionMaquinariaResponse>>> asignaciones(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.ok(maquinariaService.asignaciones(id)));
    }

    @GetMapping("/maquinas/{id}/usos")
    @PreAuthorize("hasAuthority('read:maquinaria')")
    public ResponseEntity<ApiResponse<List<UsoMaquinariaResponse>>> usos(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.ok(maquinariaService.usos(id)));
    }

    @GetMapping("/maquinas/{id}/documentos")
    @PreAuthorize("hasAuthority('read:maquinaria')")
    public ResponseEntity<ApiResponse<List<DocumentoMaquinariaResponse>>> documentos(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.ok(maquinariaService.documentos(id)));
    }

    @GetMapping("/maquinas/{id}/historial-estados")
    @PreAuthorize("hasAuthority('read:maquinaria')")
    public ResponseEntity<ApiResponse<List<HistorialEstadoMaquinariaResponse>>> historialEstados(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.ok(maquinariaService.historialEstados(id)));
    }

    @PostMapping("/asignaciones")
    @PreAuthorize("hasAuthority('update:maquinaria')")
    public ResponseEntity<ApiResponse<AsignacionMaquinariaResponse>> asignar(@Valid @RequestBody AsignacionMaquinariaRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(maquinariaService.asignar(request)));
    }

    @PostMapping("/usos")
    @PreAuthorize("hasAuthority('update:maquinaria')")
    public ResponseEntity<ApiResponse<UsoMaquinariaResponse>> registrarUso(@Valid @RequestBody UsoMaquinariaRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(maquinariaService.registrarUso(request)));
    }

    @PostMapping("/documentos")
    @PreAuthorize("hasAuthority('update:maquinaria')")
    public ResponseEntity<ApiResponse<DocumentoMaquinariaResponse>> registrarDocumento(@Valid @RequestBody DocumentoMaquinariaRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(maquinariaService.registrarDocumento(request)));
    }
}
