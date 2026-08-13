package com.campoapp.agricultura.controller;

import com.campoapp.agricultura.dto.plagas.OrdenAplicacionRequest;
import com.campoapp.agricultura.dto.plagas.OrdenAplicacionResponse;
import com.campoapp.agricultura.dto.plagas.RechazoOrdenRequest;
import com.campoapp.agricultura.entity.plagas.EstadoOrdenAplicacion;
import com.campoapp.agricultura.service.OrdenAplicacionService;
import com.campoapp.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// Feature 58: ordenes de aplicacion (flujo responsable -> operario tercerizado).
// Reutiliza los permisos del modulo de plagas/lotes (read/create/update:lotes).
@RestController
@RequestMapping("/api/v1/agricola/plagas/ordenes")
@RequiredArgsConstructor
@Tag(name = "Ordenes de aplicacion", description = "Alta, asignacion y aceptacion de ordenes de aplicacion fitosanitaria")
public class OrdenAplicacionController {
    private final OrdenAplicacionService ordenAplicacionService;

    @GetMapping
    @PreAuthorize("hasAuthority('read:lotes')")
    @Operation(summary = "Listar ordenes de aplicacion con filtros")
    public ResponseEntity<ApiResponse<List<OrdenAplicacionResponse>>> listar(
            @RequestParam(required = false) EstadoOrdenAplicacion estado,
            @RequestParam(required = false) String operarioId,
            @RequestParam(required = false) String responsableId,
            @RequestParam(required = false) String loteId) {
        return ResponseEntity.ok(ApiResponse.ok(ordenAplicacionService.listar(estado, operarioId, responsableId, loteId)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('read:lotes')")
    @Operation(summary = "Obtener una orden de aplicacion")
    public ResponseEntity<ApiResponse<OrdenAplicacionResponse>> obtener(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.ok(ordenAplicacionService.obtener(id)));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('create:lotes')")
    @Operation(summary = "Crear orden de aplicacion (responsable = usuario logueado)")
    public ResponseEntity<ApiResponse<OrdenAplicacionResponse>> crear(@Valid @RequestBody OrdenAplicacionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(ordenAplicacionService.crear(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('update:lotes')")
    @Operation(summary = "Editar orden de aplicacion pendiente")
    public ResponseEntity<ApiResponse<OrdenAplicacionResponse>> actualizar(@PathVariable String id, @Valid @RequestBody OrdenAplicacionRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(ordenAplicacionService.actualizar(id, request)));
    }

    @PostMapping("/{id}/aceptar")
    @PreAuthorize("hasAuthority('create:lotes')")
    @Operation(summary = "El operario acepta la orden -> genera el registro de aplicacion")
    public ResponseEntity<ApiResponse<OrdenAplicacionResponse>> aceptar(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.ok(ordenAplicacionService.aceptar(id)));
    }

    @PostMapping("/{id}/rechazar")
    @PreAuthorize("hasAuthority('update:lotes')")
    @Operation(summary = "El operario rechaza la orden (con motivo)")
    public ResponseEntity<ApiResponse<OrdenAplicacionResponse>> rechazar(@PathVariable String id, @RequestBody(required = false) RechazoOrdenRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(ordenAplicacionService.rechazar(id, request != null ? request.motivo() : null)));
    }
}
