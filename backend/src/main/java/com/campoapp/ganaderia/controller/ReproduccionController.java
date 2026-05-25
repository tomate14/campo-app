package com.campoapp.ganaderia.controller;

import com.campoapp.common.dto.ApiResponse;
import com.campoapp.ganaderia.dto.*;
import com.campoapp.ganaderia.service.ReproduccionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/ganaderia/reproduccion")
@RequiredArgsConstructor
public class ReproduccionController {
    private final ReproduccionService reproduccionService;

    @GetMapping
    @PreAuthorize("hasAuthority('read:animales')")
    public ResponseEntity<ApiResponse<ReproduccionResumenResponse>> resumen(
            @RequestParam(required = false) LocalDate desde,
            @RequestParam(required = false) LocalDate hasta
    ) {
        return ResponseEntity.ok(ApiResponse.ok(reproduccionService.getResumen(desde, hasta)));
    }

    @GetMapping("/dashboard")
    @PreAuthorize("hasAuthority('read:animales')")
    public ResponseEntity<ApiResponse<ReproduccionDashboardResponse>> dashboard(@RequestParam(required = false) LocalDate referencia) {
        return ResponseEntity.ok(ApiResponse.ok(reproduccionService.getDashboard(referencia)));
    }

    @GetMapping("/montas")
    @PreAuthorize("hasAuthority('read:animales')")
    public ResponseEntity<ApiResponse<List<MontaResponse>>> listMontas(
            @RequestParam(required = false) LocalDate desde,
            @RequestParam(required = false) LocalDate hasta
    ) {
        return ResponseEntity.ok(ApiResponse.ok(reproduccionService.listMontas(desde, hasta)));
    }

    @PostMapping("/montas")
    @PreAuthorize("hasAuthority('update:animales')")
    public ResponseEntity<ApiResponse<MontaResponse>> createMonta(@Valid @RequestBody MontaRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(reproduccionService.registrarMonta(request)));
    }

    @GetMapping("/inseminaciones")
    @PreAuthorize("hasAuthority('read:animales')")
    public ResponseEntity<ApiResponse<List<InseminacionResponse>>> listInseminaciones(
            @RequestParam(required = false) LocalDate desde,
            @RequestParam(required = false) LocalDate hasta
    ) {
        return ResponseEntity.ok(ApiResponse.ok(reproduccionService.listInseminaciones(desde, hasta)));
    }

    @PostMapping("/inseminaciones")
    @PreAuthorize("hasAuthority('update:animales')")
    public ResponseEntity<ApiResponse<InseminacionResponse>> createInseminacion(@Valid @RequestBody InseminacionRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(reproduccionService.registrarInseminacion(request)));
    }

    @GetMapping("/prenez")
    @PreAuthorize("hasAuthority('read:animales')")
    public ResponseEntity<ApiResponse<List<ControlPrenezResponse>>> listControlesPrenez(@RequestParam(required = false) String estado) {
        return ResponseEntity.ok(ApiResponse.ok(reproduccionService.listControlesPrenez(estado)));
    }

    @PostMapping("/prenez")
    @PreAuthorize("hasAuthority('update:animales')")
    public ResponseEntity<ApiResponse<ControlPrenezResponse>> createControlPrenez(@Valid @RequestBody ControlPrenezRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(reproduccionService.registrarControlPrenez(request)));
    }

    @GetMapping("/partos")
    @PreAuthorize("hasAuthority('read:animales')")
    public ResponseEntity<ApiResponse<List<PartoResponse>>> listPartos(
            @RequestParam(required = false) LocalDate desde,
            @RequestParam(required = false) LocalDate hasta
    ) {
        return ResponseEntity.ok(ApiResponse.ok(reproduccionService.listPartos(desde, hasta)));
    }

    @PostMapping("/partos")
    @PreAuthorize("hasAuthority('update:animales')")
    public ResponseEntity<ApiResponse<PartoResponse>> createParto(@Valid @RequestBody PartoRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(reproduccionService.registrarParto(request)));
    }

    @GetMapping("/indices")
    @PreAuthorize("hasAuthority('read:animales')")
    public ResponseEntity<ApiResponse<List<IndiceGeneticoResponse>>> listIndices() {
        return ResponseEntity.ok(ApiResponse.ok(reproduccionService.listIndices()));
    }

    @PostMapping("/indices")
    @PreAuthorize("hasAuthority('update:animales')")
    public ResponseEntity<ApiResponse<IndiceGeneticoResponse>> createIndice(@Valid @RequestBody IndiceGeneticoRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(reproduccionService.registrarIndice(request)));
    }

    @GetMapping("/genealogia/{animalId}")
    @PreAuthorize("hasAuthority('read:animales')")
    public ResponseEntity<ApiResponse<GenealogiaAnimalResponse>> genealogia(@PathVariable String animalId) {
        return ResponseEntity.ok(ApiResponse.ok(reproduccionService.getGenealogia(animalId)));
    }

    @GetMapping("/recomendaciones")
    @PreAuthorize("hasAuthority('read:animales')")
    public ResponseEntity<ApiResponse<List<RecomendacionCruzamientoResponse>>> recomendaciones() {
        return ResponseEntity.ok(ApiResponse.ok(reproduccionService.getRecomendaciones()));
    }
}
