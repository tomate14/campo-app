package com.campoapp.ganaderia.controller;

import com.campoapp.common.dto.ApiResponse;
import com.campoapp.ganaderia.dto.*;
import com.campoapp.ganaderia.service.AlimentacionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/ganaderia/alimentacion")
@RequiredArgsConstructor
public class AlimentacionController {
    private final AlimentacionService alimentacionService;

    @GetMapping
    @PreAuthorize("hasAuthority('read:animales')")
    public ResponseEntity<ApiResponse<AlimentacionResumenResponse>> resumen(
            @RequestParam(required = false) LocalDate desde,
            @RequestParam(required = false) LocalDate hasta
    ) {
        return ResponseEntity.ok(ApiResponse.ok(alimentacionService.getResumen(desde, hasta)));
    }

    @GetMapping("/dashboard")
    @PreAuthorize("hasAuthority('read:animales')")
    public ResponseEntity<ApiResponse<AlimentacionDashboardResponse>> dashboard(@RequestParam(required = false) LocalDate referencia) {
        return ResponseEntity.ok(ApiResponse.ok(alimentacionService.getDashboard(referencia)));
    }

    @GetMapping("/dietas")
    @PreAuthorize("hasAuthority('read:animales')")
    public ResponseEntity<ApiResponse<List<DietaResponse>>> listDietas() {
        return ResponseEntity.ok(ApiResponse.ok(alimentacionService.listDietas()));
    }

    @PostMapping("/dietas")
    @PreAuthorize("hasAuthority('update:animales')")
    public ResponseEntity<ApiResponse<DietaResponse>> createDieta(@Valid @RequestBody DietaRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(alimentacionService.createDieta(request)));
    }

    @GetMapping("/registros")
    @PreAuthorize("hasAuthority('read:animales')")
    public ResponseEntity<ApiResponse<List<RegistroAlimentacionResponse>>> listRegistros(
            @RequestParam(required = false) String animalId,
            @RequestParam(required = false) LocalDate desde,
            @RequestParam(required = false) LocalDate hasta
    ) {
        return ResponseEntity.ok(ApiResponse.ok(alimentacionService.listRegistros(animalId, desde, hasta)));
    }

    @PostMapping("/registros")
    @PreAuthorize("hasAuthority('update:animales')")
    public ResponseEntity<ApiResponse<RegistroAlimentacionResponse>> createRegistro(@Valid @RequestBody RegistroAlimentacionRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(alimentacionService.registrarAlimentacion(request)));
    }

    @GetMapping("/pesajes")
    @PreAuthorize("hasAuthority('read:animales')")
    public ResponseEntity<ApiResponse<List<PesajeResponse>>> listPesajes(
            @RequestParam(required = false) String animalId,
            @RequestParam(required = false) LocalDate desde,
            @RequestParam(required = false) LocalDate hasta
    ) {
        return ResponseEntity.ok(ApiResponse.ok(alimentacionService.listPesajes(animalId, desde, hasta)));
    }

    @PostMapping("/pesajes")
    @PreAuthorize("hasAuthority('update:animales')")
    public ResponseEntity<ApiResponse<PesajeResponse>> createPesaje(@Valid @RequestBody PesajeRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(alimentacionService.registrarPesaje(request)));
    }
}
