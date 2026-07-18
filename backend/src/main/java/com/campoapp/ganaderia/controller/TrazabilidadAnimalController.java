package com.campoapp.ganaderia.controller;

import com.campoapp.common.dto.ApiResponse;
import com.campoapp.ganaderia.dto.*;
import com.campoapp.ganaderia.service.AnimalService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/ganaderia/trazabilidad")
@RequiredArgsConstructor
@Tag(name = "Ganaderia - Trazabilidad", description = "Gestion de animales, movimientos e historial medico")
public class TrazabilidadAnimalController {

    private final AnimalService animalService;

    @GetMapping("/animales")
    @PreAuthorize("hasAuthority('read:animales')")
    @Operation(summary = "Listar animales")
    public ResponseEntity<ApiResponse<List<AnimalResponse>>> listAnimales(
            @RequestParam(required = false) String caravana,
            @RequestParam(required = false) String raza,
            @RequestParam(required = false) String ubicacion,
            @RequestParam(required = false) String estado
    ) {
        return ResponseEntity.ok(ApiResponse.ok(animalService.listAnimales(caravana, raza, ubicacion, estado)));
    }

    @GetMapping("/animales/page")
    @PreAuthorize("hasAuthority('read:animales')")
    @Operation(summary = "Listar animales paginados con filtros por caravana, potrero y estado")
    public ResponseEntity<ApiResponse<Page<AnimalResponse>>> listAnimalesPaginados(
            @RequestParam(required = false) String caravana,
            @RequestParam(required = false) String potreroId,
            @RequestParam(required = false) String estado,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(ApiResponse.ok(animalService.listAnimalesPaginados(caravana, potreroId, estado, page, size)));
    }

    @GetMapping("/razas-bovinas")
    @PreAuthorize("hasAuthority('read:animales')")
    @Operation(summary = "Listar catalogo de razas bovinas")
    public ResponseEntity<ApiResponse<List<CatalogoRazaBovinaResponse>>> listRazasBovinas(
            @RequestParam(required = false) String search
    ) {
        return ResponseEntity.ok(ApiResponse.ok(animalService.listRazasBovinas(search)));
    }

    @GetMapping("/animales/{id}")
    @PreAuthorize("hasAuthority('read:animales')")
    public ResponseEntity<ApiResponse<AnimalDetalleResponse>> getAnimal(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.ok(animalService.getAnimal(id)));
    }

    @PostMapping("/animales")
    @PreAuthorize("hasAuthority('create:animales')")
    public ResponseEntity<ApiResponse<AnimalResponse>> createAnimal(@Valid @RequestBody AnimalRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(animalService.createAnimal(request)));
    }

    @PutMapping("/animales/{id}")
    @PreAuthorize("hasAuthority('update:animales')")
    public ResponseEntity<ApiResponse<AnimalResponse>> updateAnimal(@PathVariable String id, @Valid @RequestBody AnimalRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(animalService.updateAnimal(id, request)));
    }

    @DeleteMapping("/animales/{id}")
    @PreAuthorize("hasAuthority('delete:animales')")
    public ResponseEntity<Void> deleteAnimal(@PathVariable String id) {
        animalService.deleteAnimal(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/animales/{id}/movimientos")
    @PreAuthorize("hasAuthority('read:animales')")
    public ResponseEntity<ApiResponse<List<MovimientoAnimalResponse>>> getMovimientos(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.ok(animalService.getMovimientos(id)));
    }

    @GetMapping("/movimientos")
    @PreAuthorize("hasAuthority('read:animales')")
    @Operation(summary = "Listar movimientos de todos los animales, con filtro opcional por animal (replica offline)")
    public ResponseEntity<ApiResponse<List<MovimientoAnimalResponse>>> listMovimientos(
            @RequestParam(required = false) String animalId
    ) {
        return ResponseEntity.ok(ApiResponse.ok(animalService.listMovimientos(animalId)));
    }

    @PostMapping("/movimientos")
    @PreAuthorize("hasAuthority('update:animales')")
    public ResponseEntity<ApiResponse<MovimientoAnimalResponse>> createMovimiento(@Valid @RequestBody MovimientoAnimalRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(animalService.registrarMovimiento(request)));
    }

    @GetMapping("/animales/{id}/historial-medico")
    @PreAuthorize("hasAuthority('read:animales')")
    public ResponseEntity<ApiResponse<List<HistorialMedicoAnimalResponse>>> getHistorialMedico(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.ok(animalService.getHistorialMedico(id)));
    }

    @GetMapping("/historial-medico")
    @PreAuthorize("hasAuthority('read:animales')")
    @Operation(summary = "Listar historial medico de todos los animales, con filtro opcional por animal (replica offline)")
    public ResponseEntity<ApiResponse<List<HistorialMedicoAnimalResponse>>> listHistorialMedico(
            @RequestParam(required = false) String animalId
    ) {
        return ResponseEntity.ok(ApiResponse.ok(animalService.listHistorialMedico(animalId)));
    }

    @PostMapping("/historial-medico")
    @PreAuthorize("hasAuthority('update:animales')")
    public ResponseEntity<ApiResponse<HistorialMedicoAnimalResponse>> createHistorial(@Valid @RequestBody HistorialMedicoAnimalRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(animalService.registrarHistorialMedico(request)));
    }

    @GetMapping(value = "/export/senasa", produces = "text/csv")
    @PreAuthorize("hasAuthority('read:animales')")
    public ResponseEntity<String> exportSenasa(@RequestParam(required = false) String estado) {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=trazabilidad-senasa.csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(animalService.exportarSenasaCsv(estado));
    }
}
