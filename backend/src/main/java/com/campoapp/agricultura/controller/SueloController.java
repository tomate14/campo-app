package com.campoapp.agricultura.controller;

import com.campoapp.agricultura.dto.PropiedadSueloRequest;
import com.campoapp.agricultura.dto.PropiedadSueloResponse;
import com.campoapp.agricultura.service.SueloService;
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
public class SueloController {

    private final SueloService sueloService;

    @GetMapping("/api/v1/agricola/lotes/{loteId}/suelo")
    @PreAuthorize("hasAuthority('read:suelo')")
    public ResponseEntity<ApiResponse<List<PropiedadSueloResponse>>> listarPorLote(@PathVariable String loteId) {
        return ResponseEntity.ok(ApiResponse.ok(sueloService.listarPorLote(loteId)));
    }

    @GetMapping("/api/v1/agricola/lotes/{loteId}/suelo/ultimo")
    @PreAuthorize("hasAuthority('read:suelo')")
    public ResponseEntity<ApiResponse<PropiedadSueloResponse>> ultimoAnalisis(@PathVariable String loteId) {
        return sueloService.ultimoAnalisis(loteId)
                .map(r -> ResponseEntity.ok(ApiResponse.ok(r)))
                .orElseGet(() -> ResponseEntity.ok(ApiResponse.ok(null)));
    }

    @GetMapping("/api/v1/agricola/suelo/{id}")
    @PreAuthorize("hasAuthority('read:suelo')")
    public ResponseEntity<ApiResponse<PropiedadSueloResponse>> buscarPorId(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.ok(sueloService.buscarPorId(id)));
    }

    @PostMapping("/api/v1/agricola/suelo")
    @PreAuthorize("hasAuthority('create:suelo')")
    public ResponseEntity<ApiResponse<PropiedadSueloResponse>> registrar(@Valid @RequestBody PropiedadSueloRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(sueloService.registrar(request)));
    }

    @PutMapping("/api/v1/agricola/suelo/{id}")
    @PreAuthorize("hasAuthority('update:suelo')")
    public ResponseEntity<ApiResponse<PropiedadSueloResponse>> actualizar(
            @PathVariable String id,
            @Valid @RequestBody PropiedadSueloRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(sueloService.actualizar(id, request)));
    }

    @DeleteMapping("/api/v1/agricola/suelo/{id}")
    @PreAuthorize("hasAuthority('delete:suelo')")
    public ResponseEntity<Void> eliminar(@PathVariable String id) {
        sueloService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
