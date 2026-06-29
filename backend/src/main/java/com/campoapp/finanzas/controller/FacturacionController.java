package com.campoapp.finanzas.controller;

import com.campoapp.common.dto.ApiResponse;
import com.campoapp.finanzas.dto.*;
import com.campoapp.finanzas.entity.EstadoFactura;
import com.campoapp.finanzas.service.FacturacionService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/finanzas/facturacion")
@RequiredArgsConstructor
@Tag(name = "Finanzas - Facturacion y ventas")
public class FacturacionController {
    private final FacturacionService service;

    @GetMapping("/dashboard")
    @PreAuthorize("hasAuthority('read:finanzas')")
    public ResponseEntity<ApiResponse<FacturacionDashboardResponse>> dashboard(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaDesde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaHasta) {
        return ResponseEntity.ok(ApiResponse.ok(service.dashboard(fechaDesde, fechaHasta)));
    }

    @GetMapping("/clientes")
    @PreAuthorize("hasAuthority('read:finanzas')")
    public ResponseEntity<ApiResponse<Page<ClienteResponse>>> clientes(@RequestParam(required = false) String search, @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) { return ResponseEntity.ok(ApiResponse.ok(service.listarClientes(search, page, size))); }

    @PostMapping("/clientes")
    @PreAuthorize("hasAuthority('create:finanzas')")
    public ResponseEntity<ApiResponse<ClienteResponse>> crearCliente(@RequestBody ClienteRequest request) { return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(service.crearCliente(request))); }

    @PutMapping("/clientes/{id}")
    @PreAuthorize("hasAuthority('update:finanzas')")
    public ResponseEntity<ApiResponse<ClienteResponse>> actualizarCliente(@PathVariable String id, @RequestBody ClienteRequest request) { return ResponseEntity.ok(ApiResponse.ok(service.actualizarCliente(id, request))); }

    @DeleteMapping("/clientes/{id}")
    @PreAuthorize("hasAuthority('delete:finanzas')")
    public ResponseEntity<Void> eliminarCliente(@PathVariable String id) { service.eliminarCliente(id); return ResponseEntity.noContent().build(); }

    @GetMapping("/facturas")
    @PreAuthorize("hasAuthority('read:finanzas')")
    public ResponseEntity<ApiResponse<Page<FacturaResponse>>> facturas(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) EstadoFactura estado,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaDesde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaHasta,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.ok(service.listarFacturas(search, estado, fechaDesde, fechaHasta, page, size)));
    }

    @PostMapping("/facturas")
    @PreAuthorize("hasAuthority('create:finanzas')")
    public ResponseEntity<ApiResponse<FacturaResponse>> crearFactura(@RequestBody FacturaRequest request) { return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(service.crearFactura(request))); }

    @GetMapping("/cobros")
    @PreAuthorize("hasAuthority('read:finanzas')")
    public ResponseEntity<ApiResponse<Page<CobroResponse>>> cobros(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) { return ResponseEntity.ok(ApiResponse.ok(service.listarCobros(page, size))); }

    @PostMapping("/cobros")
    @PreAuthorize("hasAuthority('create:finanzas')")
    public ResponseEntity<ApiResponse<CobroResponse>> registrarCobro(@RequestBody CobroRequest request) { return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(service.registrarCobro(request))); }

    @GetMapping("/notas-credito")
    @PreAuthorize("hasAuthority('read:finanzas')")
    public ResponseEntity<ApiResponse<Page<NotaCreditoResponse>>> notas(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) { return ResponseEntity.ok(ApiResponse.ok(service.listarNotasCredito(page, size))); }

    @PostMapping("/notas-credito")
    @PreAuthorize("hasAuthority('create:finanzas')")
    public ResponseEntity<ApiResponse<NotaCreditoResponse>> registrarNota(@RequestBody NotaCreditoRequest request) { return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(service.registrarNotaCredito(request))); }
}
