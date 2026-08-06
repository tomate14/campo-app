package com.campoapp.agricultura.controller;

import com.campoapp.agricultura.dto.plagas.PlagaReferenciaResponse;
import com.campoapp.agricultura.dto.plagas.SyncResumen;
import com.campoapp.agricultura.service.PlagaReferenciaSyncService;
import com.campoapp.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Catalogo de referencia de plagas por cultivo descargado desde GBIF (feature 73).
 */
@RestController
@RequestMapping("/api/v1/agricola/plagas")
@RequiredArgsConstructor
@Tag(name = "Catalogo de referencia de plagas", description = "Referencia por cultivo poblada desde GBIF")
public class PlagaReferenciaController {

    private final PlagaReferenciaSyncService syncService;

    @PostMapping("/catalogo-referencia/sync")
    @PreAuthorize("hasAuthority('create:lotes')")
    @Operation(summary = "Sincronizar el catalogo de referencia de plagas desde GBIF (on-demand)")
    public ResponseEntity<ApiResponse<SyncResumen>> sincronizar() {
        return ResponseEntity.ok(ApiResponse.ok(syncService.sincronizar()));
    }

    @GetMapping("/catalogo-referencia")
    @PreAuthorize("hasAuthority('read:lotes')")
    @Operation(summary = "Listar el catalogo de referencia de plagas (opcional filtro por cultivo)")
    public ResponseEntity<ApiResponse<List<PlagaReferenciaResponse>>> listar(
            @RequestParam(required = false) String cultivo) {
        return ResponseEntity.ok(ApiResponse.ok(syncService.listar(cultivo)));
    }
}
