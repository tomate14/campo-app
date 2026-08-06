package com.campoapp.agricultura.controller;

import com.campoapp.agricultura.dto.plagas.EspecieSimilarResponse;
import com.campoapp.agricultura.dto.plagas.PlagaReferenciaResponse;
import com.campoapp.agricultura.dto.plagas.SimilarSyncResumen;
import com.campoapp.agricultura.dto.plagas.SyncResumen;
import com.campoapp.agricultura.service.PlagaReferenciaSyncService;
import com.campoapp.agricultura.service.PlagaSimilarSyncService;
import com.campoapp.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Catalogo de referencia de plagas por cultivo (feature 73) y especies similares (feature 75),
 * ambos poblados desde GBIF.
 */
@RestController
@RequestMapping("/api/v1/agricola/plagas")
@RequiredArgsConstructor
@Tag(name = "Catalogo de referencia de plagas", description = "Referencia por cultivo y especies similares desde GBIF")
public class PlagaReferenciaController {

    private final PlagaReferenciaSyncService syncService;
    private final PlagaSimilarSyncService similarSyncService;

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

    @PostMapping("/gbif/similares/sync")
    @PreAuthorize("hasAuthority('create:lotes')")
    @Operation(summary = "Sincronizar el cache de especies similares desde GBIF (on-demand, feature 75)")
    public ResponseEntity<ApiResponse<SimilarSyncResumen>> sincronizarSimilares() {
        return ResponseEntity.ok(ApiResponse.ok(similarSyncService.sincronizarSimilares()));
    }

    @GetMapping("/catalogo/{id}/similares")
    @PreAuthorize("hasAuthority('read:lotes')")
    @Operation(summary = "Especies similares de una plaga (desde el cache; imagenUrl relativa /uploads/...)")
    public ResponseEntity<ApiResponse<List<EspecieSimilarResponse>>> similaresDeCatalogo(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.ok(similarSyncService.similaresDeCatalogo(id)));
    }

    @GetMapping("/gbif/similares")
    @PreAuthorize("hasAuthority('read:lotes')")
    @Operation(summary = "Descubrir especies similares en vivo por nombre cientifico (imagenUrl remota o local)")
    public ResponseEntity<ApiResponse<List<EspecieSimilarResponse>>> descubrirSimilares(
            @RequestParam String nombreCientifico) {
        return ResponseEntity.ok(ApiResponse.ok(similarSyncService.descubrirEnVivo(nombreCientifico)));
    }
}
