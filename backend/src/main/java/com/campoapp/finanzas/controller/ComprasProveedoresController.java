package com.campoapp.finanzas.controller;

import com.campoapp.common.dto.ApiResponse;
import com.campoapp.finanzas.dto.*;
import com.campoapp.finanzas.entity.EstadoCompra;
import com.campoapp.finanzas.service.ComprasProveedoresService;
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
@RequestMapping("/api/v1/finanzas/compras-proveedores")
@RequiredArgsConstructor
@Tag(name = "Finanzas - Compras y proveedores")
public class ComprasProveedoresController {
    private final ComprasProveedoresService service;

    @GetMapping("/dashboard")
    @PreAuthorize("hasAuthority('read:finanzas')")
    public ResponseEntity<ApiResponse<ComprasDashboardResponse>> dashboard(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaDesde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaHasta) {
        return ResponseEntity.ok(ApiResponse.ok(service.dashboard(fechaDesde, fechaHasta)));
    }

    @GetMapping("/proveedores")
    @PreAuthorize("hasAuthority('read:finanzas')")
    public ResponseEntity<ApiResponse<Page<ProveedorResponse>>> proveedores(@RequestParam(required = false) String search, @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.ok(service.listarProveedores(search, page, size)));
    }

    @PostMapping("/proveedores")
    @PreAuthorize("hasAuthority('create:finanzas')")
    public ResponseEntity<ApiResponse<ProveedorResponse>> crearProveedor(@RequestBody ProveedorRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(service.crearProveedor(request)));
    }

    @PutMapping("/proveedores/{id}")
    @PreAuthorize("hasAuthority('update:finanzas')")
    public ResponseEntity<ApiResponse<ProveedorResponse>> actualizarProveedor(@PathVariable String id, @RequestBody ProveedorRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(service.actualizarProveedor(id, request)));
    }

    @DeleteMapping("/proveedores/{id}")
    @PreAuthorize("hasAuthority('delete:finanzas')")
    public ResponseEntity<Void> eliminarProveedor(@PathVariable String id) {
        service.eliminarProveedor(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/compras")
    @PreAuthorize("hasAuthority('read:finanzas')")
    public ResponseEntity<ApiResponse<Page<CompraResponse>>> compras(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) EstadoCompra estado,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaDesde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaHasta,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.ok(service.listarCompras(search, estado, fechaDesde, fechaHasta, page, size)));
    }

    @PostMapping("/compras")
    @PreAuthorize("hasAuthority('create:finanzas')")
    public ResponseEntity<ApiResponse<CompraResponse>> crearCompra(@RequestBody CompraRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(service.crearCompra(request)));
    }

    @GetMapping("/pagos")
    @PreAuthorize("hasAuthority('read:finanzas')")
    public ResponseEntity<ApiResponse<Page<PagoProveedorResponse>>> pagos(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.ok(service.listarPagos(page, size)));
    }

    @PostMapping("/pagos")
    @PreAuthorize("hasAuthority('create:finanzas')")
    public ResponseEntity<ApiResponse<PagoProveedorResponse>> registrarPago(@RequestBody PagoProveedorRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(service.registrarPago(request)));
    }
}
