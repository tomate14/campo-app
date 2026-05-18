package com.campoapp.agricultura.controller;

import com.campoapp.agricultura.dto.EventoSiembraRequest;
import com.campoapp.agricultura.dto.EventoSiembraResponse;
import com.campoapp.agricultura.entity.EventoSiembra.TipoEvento;
import com.campoapp.agricultura.service.SiembraService;
import com.campoapp.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/agricola/siembra")
@RequiredArgsConstructor
@Tag(name = "Siembra y Monitoreo", description = "Registro de eventos de siembra y seguimiento fenológico")
public class SiembraController {

    private final SiembraService siembraService;

    @GetMapping("/lote/{loteId}")
    @PreAuthorize("hasAuthority('read:siembra')")
    @Operation(summary = "Listar eventos de siembra de un lote")
    public ResponseEntity<ApiResponse<List<EventoSiembraResponse>>> listarPorLote(
            @PathVariable String loteId,
            @RequestParam(required = false) TipoEvento tipo) {

        List<EventoSiembraResponse> eventos = tipo != null
                ? siembraService.listarPorLoteYTipo(loteId, tipo)
                : siembraService.listarPorLote(loteId);

        return ResponseEntity.ok(ApiResponse.ok(eventos));
    }

    @GetMapping("/rango")
    @PreAuthorize("hasAuthority('read:siembra')")
    @Operation(summary = "Listar eventos por rango de fechas")
    public ResponseEntity<ApiResponse<List<EventoSiembraResponse>>> listarPorRango(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta) {
        return ResponseEntity.ok(ApiResponse.ok(siembraService.listarPorRangoDeFechas(desde, hasta)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('read:siembra')")
    @Operation(summary = "Obtener un evento de siembra por ID")
    public ResponseEntity<ApiResponse<EventoSiembraResponse>> obtener(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.ok(siembraService.buscarPorId(id)));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('create:siembra')")
    @Operation(summary = "Registrar un evento de siembra o monitoreo")
    public ResponseEntity<ApiResponse<EventoSiembraResponse>> registrar(@Valid @RequestBody EventoSiembraRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(siembraService.registrar(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('update:siembra')")
    @Operation(summary = "Actualizar un evento de siembra")
    public ResponseEntity<ApiResponse<EventoSiembraResponse>> actualizar(
            @PathVariable String id,
            @Valid @RequestBody EventoSiembraRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(siembraService.actualizar(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('delete:siembra')")
    @Operation(summary = "Eliminar (soft delete) un evento de siembra")
    public ResponseEntity<Void> eliminar(@PathVariable String id) {
        siembraService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
