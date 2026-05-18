package com.campoapp.agricultura.controller;

import com.campoapp.agricultura.dto.RegistroCosechaRequest;
import com.campoapp.agricultura.dto.RegistroCosechaResponse;
import com.campoapp.agricultura.service.CosechaService;
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
import java.util.Map;

@RestController
@RequestMapping("/api/v1/agricola/cosecha")
@RequiredArgsConstructor
@Tag(name = "Cosecha", description = "Registro y análisis de cosechas por lote")
public class CosechaController {

    private final CosechaService cosechaService;

    @GetMapping("/lote/{loteId}")
    @PreAuthorize("hasAuthority('read:cosecha')")
    @Operation(summary = "Listar registros de cosecha de un lote")
    public ResponseEntity<ApiResponse<List<RegistroCosechaResponse>>> listarPorLote(@PathVariable String loteId) {
        return ResponseEntity.ok(ApiResponse.ok(cosechaService.listarPorLote(loteId)));
    }

    @GetMapping("/lote/{loteId}/rendimiento-promedio")
    @PreAuthorize("hasAuthority('read:cosecha')")
    @Operation(summary = "Calcular rendimiento promedio de un lote en todas sus cosechas")
    public ResponseEntity<ApiResponse<Map<String, Object>>> rendimientoPromedio(@PathVariable String loteId) {
        Double promedio = cosechaService.calcularRendimientoPromedio(loteId);
        return ResponseEntity.ok(ApiResponse.ok(Map.of("loteId", loteId, "rendimientoPromedioKgHa", promedio != null ? promedio : 0.0)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('read:cosecha')")
    @Operation(summary = "Obtener un registro de cosecha por ID")
    public ResponseEntity<ApiResponse<RegistroCosechaResponse>> obtener(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.ok(cosechaService.buscarPorId(id)));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('create:cosecha')")
    @Operation(summary = "Registrar una nueva cosecha")
    public ResponseEntity<ApiResponse<RegistroCosechaResponse>> registrar(@Valid @RequestBody RegistroCosechaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(cosechaService.registrar(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('update:cosecha')")
    @Operation(summary = "Actualizar un registro de cosecha")
    public ResponseEntity<ApiResponse<RegistroCosechaResponse>> actualizar(
            @PathVariable String id,
            @Valid @RequestBody RegistroCosechaRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(cosechaService.actualizar(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('delete:cosecha')")
    @Operation(summary = "Eliminar (soft delete) un registro de cosecha")
    public ResponseEntity<Void> eliminar(@PathVariable String id) {
        cosechaService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
