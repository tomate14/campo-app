package com.campoapp.utilidades.controller;

import com.campoapp.common.dto.ApiResponse;
import com.campoapp.utilidades.dto.UtilidadOpcionRequest;
import com.campoapp.utilidades.dto.UtilidadOpcionResponse;
import com.campoapp.utilidades.service.UtilidadOpcionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/utilidades/opciones")
@RequiredArgsConstructor
@Tag(name = "Utilidades", description = "Catálogos configurables que alimentan dropdowns del sistema")
public class UtilidadController {

    private final UtilidadOpcionService utilidadOpcionService;

    @GetMapping
    @PreAuthorize("hasAuthority('read:utilidades')")
    @Operation(summary = "Listar opciones activas de una categoría")
    public ResponseEntity<ApiResponse<List<UtilidadOpcionResponse>>> listar(@RequestParam String categoria) {
        return ResponseEntity.ok(ApiResponse.ok(utilidadOpcionService.listarPorCategoria(categoria)));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('write:utilidades')")
    @Operation(summary = "Dar de alta una opción en un catálogo")
    public ResponseEntity<ApiResponse<UtilidadOpcionResponse>> crear(@Valid @RequestBody UtilidadOpcionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(utilidadOpcionService.crear(request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('write:utilidades')")
    @Operation(summary = "Eliminar (soft delete) una opción de catálogo")
    public ResponseEntity<Void> eliminar(@PathVariable String id) {
        utilidadOpcionService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
