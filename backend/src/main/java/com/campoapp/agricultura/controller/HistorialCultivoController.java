package com.campoapp.agricultura.controller;

import com.campoapp.agricultura.dto.HistoricoCultivoRequest;
import com.campoapp.agricultura.dto.HistoricoCultivoResponse;
import com.campoapp.agricultura.dto.RotacionRecomendacionResponse;
import com.campoapp.agricultura.service.HistorialCultivoService;
import com.campoapp.common.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class HistorialCultivoController {

    private final HistorialCultivoService historialService;

    @GetMapping("/api/v1/agricola/lotes/{loteId}/historial")
    @PreAuthorize("hasAuthority('read:historial')")
    public ResponseEntity<ApiResponse<List<HistoricoCultivoResponse>>> listarPorLote(@PathVariable String loteId) {
        return ResponseEntity.ok(ApiResponse.ok(historialService.listarPorLote(loteId)));
    }

    @GetMapping("/api/v1/agricola/lotes/{loteId}/rotacion")
    @PreAuthorize("hasAuthority('read:historial')")
    public ResponseEntity<ApiResponse<RotacionRecomendacionResponse>> recomendarRotacion(@PathVariable String loteId) {
        return ResponseEntity.ok(ApiResponse.ok(historialService.recomendarRotacion(loteId)));
    }

    @GetMapping("/api/v1/agricola/historial/{id}")
    @PreAuthorize("hasAuthority('read:historial')")
    public ResponseEntity<ApiResponse<HistoricoCultivoResponse>> buscarPorId(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.ok(historialService.buscarPorId(id)));
    }

    @PostMapping("/api/v1/agricola/historial")
    @PreAuthorize("hasAuthority('create:historial')")
    public ResponseEntity<ApiResponse<HistoricoCultivoResponse>> registrar(@Valid @RequestBody HistoricoCultivoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(historialService.registrar(request)));
    }

    @PutMapping("/api/v1/agricola/historial/{id}")
    @PreAuthorize("hasAuthority('update:historial')")
    public ResponseEntity<ApiResponse<HistoricoCultivoResponse>> actualizar(
            @PathVariable String id,
            @Valid @RequestBody HistoricoCultivoRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(historialService.actualizar(id, request)));
    }

    @DeleteMapping("/api/v1/agricola/historial/{id}")
    @PreAuthorize("hasAuthority('delete:historial')")
    public ResponseEntity<Void> eliminar(@PathVariable String id) {
        historialService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
