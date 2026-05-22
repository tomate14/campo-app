package com.campoapp.agricultura.controller;

import com.campoapp.agricultura.dto.GeoJsonImportRequest;
import com.campoapp.agricultura.dto.LoteRequest;
import com.campoapp.agricultura.dto.LoteReporteResponse;
import com.campoapp.agricultura.dto.LoteResponse;
import com.campoapp.agricultura.service.LoteService;
import com.campoapp.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/agricola/lotes")
@RequiredArgsConstructor
@Tag(name = "Lotes", description = "Gestión de lotes agrícolas")
public class LoteController {

    private final LoteService loteService;

    @GetMapping
    @PreAuthorize("hasAuthority('read:lotes')")
    @Operation(summary = "Listar todos los lotes activos")
    public ResponseEntity<ApiResponse<List<LoteResponse>>> listar(
            @RequestParam(required = false) String temporada,
            @RequestParam(required = false) String cultivo,
            @RequestParam(required = false) BigDecimal areaMin,
            @RequestParam(required = false) BigDecimal areaMax,
            @RequestParam(required = false) BigDecimal phMin,
            @RequestParam(required = false) BigDecimal phMax,
            @RequestParam(required = false) Boolean tienePoligono) {

        return ResponseEntity.ok(ApiResponse.ok(
                loteService.buscarConFiltros(temporada, cultivo, areaMin, areaMax, phMin, phMax, tienePoligono)
        ));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('read:lotes')")
    @Operation(summary = "Obtener un lote por ID")
    public ResponseEntity<ApiResponse<LoteResponse>> obtener(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.ok(loteService.buscarPorId(id)));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('create:lotes')")
    @Operation(summary = "Crear un nuevo lote")
    public ResponseEntity<ApiResponse<LoteResponse>> crear(@Valid @RequestBody LoteRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(loteService.crear(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('update:lotes')")
    @Operation(summary = "Actualizar un lote existente")
    public ResponseEntity<ApiResponse<LoteResponse>> actualizar(
            @PathVariable String id,
            @Valid @RequestBody LoteRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(loteService.actualizar(id, request)));
    }

    @GetMapping("/export/geojson")
    @PreAuthorize("hasAuthority('read:lotes')")
    @Operation(summary = "Exportar lotes filtrados en formato GeoJSON")
    public ResponseEntity<ApiResponse<String>> exportarGeoJson(
            @RequestParam(required = false) String temporada,
            @RequestParam(required = false) String cultivo,
            @RequestParam(required = false) BigDecimal areaMin,
            @RequestParam(required = false) BigDecimal areaMax,
            @RequestParam(required = false) BigDecimal phMin,
            @RequestParam(required = false) BigDecimal phMax,
            @RequestParam(required = false) Boolean tienePoligono) {
        return ResponseEntity.ok(ApiResponse.ok(
                loteService.exportarGeoJson(temporada, cultivo, areaMin, areaMax, phMin, phMax, tienePoligono)
        ));
    }

    @PostMapping("/import/geojson")
    @PreAuthorize("hasAuthority('create:lotes')")
    @Operation(summary = "Importar lotes desde un FeatureCollection GeoJSON")
    public ResponseEntity<ApiResponse<List<LoteResponse>>> importarGeoJson(@Valid @RequestBody GeoJsonImportRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(loteService.importarGeoJson(request.geoJson())));
    }

    @GetMapping("/{id}/reporte")
    @PreAuthorize("hasAuthority('read:lotes')")
    @Operation(summary = "Obtener reporte resumido de un lote")
    public ResponseEntity<ApiResponse<LoteReporteResponse>> reporte(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.ok(loteService.generarReporte(id)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('delete:lotes')")
    @Operation(summary = "Eliminar (soft delete) un lote")
    public ResponseEntity<Void> eliminar(@PathVariable String id) {
        loteService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
