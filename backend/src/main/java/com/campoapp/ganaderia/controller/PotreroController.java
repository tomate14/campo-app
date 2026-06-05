package com.campoapp.ganaderia.controller;

import com.campoapp.common.dto.ApiResponse;
import com.campoapp.ganaderia.dto.PotreroRequest;
import com.campoapp.ganaderia.dto.PotreroResponse;
import com.campoapp.ganaderia.service.PotreroService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/ganaderia/potreros")
@RequiredArgsConstructor
public class PotreroController {

    private final PotreroService potreroService;

    @GetMapping
    @PreAuthorize("hasAuthority('read:animales')")
    public ResponseEntity<ApiResponse<List<PotreroResponse>>> listar(
            @RequestParam(required = false) String nombre,
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) String tipoUso,
            @RequestParam(required = false) BigDecimal superficieMin,
            @RequestParam(required = false) BigDecimal superficieMax
    ) {
        return ResponseEntity.ok(ApiResponse.ok(potreroService.listar(nombre, estado, tipoUso, superficieMin, superficieMax)));
    }

    @GetMapping("/mapa")
    @PreAuthorize("hasAuthority('read:animales')")
    public ResponseEntity<ApiResponse<List<PotreroResponse>>> mapa() {
        return ResponseEntity.ok(ApiResponse.ok(potreroService.listarMapa()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('read:animales')")
    public ResponseEntity<ApiResponse<PotreroResponse>> obtener(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.ok(potreroService.buscarPorId(id)));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('create:animales')")
    public ResponseEntity<ApiResponse<PotreroResponse>> crear(@Valid @RequestBody PotreroRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(potreroService.crear(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('update:animales')")
    public ResponseEntity<ApiResponse<PotreroResponse>> actualizar(@PathVariable String id, @Valid @RequestBody PotreroRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(potreroService.actualizar(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('delete:animales')")
    public ResponseEntity<Void> eliminar(@PathVariable String id) {
        potreroService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
