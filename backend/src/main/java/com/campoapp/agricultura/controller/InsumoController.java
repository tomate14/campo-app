package com.campoapp.agricultura.controller;

import com.campoapp.agricultura.dto.insumos.*;
import com.campoapp.agricultura.entity.insumos.TipoInsumoAgricola;
import com.campoapp.agricultura.service.InsumoService;
import com.campoapp.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/inventario/insumos")
@RequiredArgsConstructor
@Tag(name = "Inventario - Insumos agricolas", description = "Catalogo, stock, movimientos y alertas de insumos agricolas")
public class InsumoController {

    private final InsumoService insumoService;

    @GetMapping("/dashboard")
    @PreAuthorize("hasAuthority('read:inventario')")
    @Operation(summary = "Obtener resumen ejecutivo de inventario agricola")
    public ResponseEntity<ApiResponse<InsumosDashboardResponse>> dashboard() {
        return ResponseEntity.ok(ApiResponse.ok(insumoService.dashboard()));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('read:inventario')")
    @Operation(summary = "Listar catalogo de insumos paginado")
    public ResponseEntity<ApiResponse<Page<InsumoAgricolaResponse>>> listar(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) TipoInsumoAgricola tipo,
            @RequestParam(required = false) Boolean activo,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.ok(insumoService.listarInsumos(search, tipo, activo, page, size)));
    }

    @GetMapping("/activos")
    @PreAuthorize("hasAuthority('read:inventario')")
    public ResponseEntity<ApiResponse<List<InsumoAgricolaResponse>>> activos() {
        return ResponseEntity.ok(ApiResponse.ok(insumoService.listarInsumosActivos()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('read:inventario')")
    public ResponseEntity<ApiResponse<InsumoAgricolaResponse>> obtener(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.ok(insumoService.obtenerInsumo(id)));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('create:inventario')")
    public ResponseEntity<ApiResponse<InsumoAgricolaResponse>> crear(@RequestBody InsumoAgricolaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(insumoService.crearInsumo(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('update:inventario')")
    public ResponseEntity<ApiResponse<InsumoAgricolaResponse>> actualizar(@PathVariable String id, @RequestBody InsumoAgricolaRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(insumoService.actualizarInsumo(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('delete:inventario')")
    public ResponseEntity<Void> eliminar(@PathVariable String id) {
        insumoService.eliminarInsumo(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/stock")
    @PreAuthorize("hasAuthority('read:inventario')")
    public ResponseEntity<ApiResponse<Page<StockInsumoResponse>>> stock(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.ok(insumoService.listarStock(page, size)));
    }

    @GetMapping("/alertas/reorden")
    @PreAuthorize("hasAuthority('read:inventario')")
    public ResponseEntity<ApiResponse<Page<InsumoAgricolaResponse>>> alertasReorden(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.ok(insumoService.listarAlertasReorden(page, size)));
    }

    @GetMapping("/alertas/vencimientos")
    @PreAuthorize("hasAuthority('read:inventario')")
    public ResponseEntity<ApiResponse<Page<StockInsumoResponse>>> vencimientosProximos(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.ok(insumoService.listarVencimientosProximos(page, size)));
    }

    @GetMapping("/{id}/stock")
    @PreAuthorize("hasAuthority('read:inventario')")
    public ResponseEntity<ApiResponse<List<StockInsumoResponse>>> stockPorInsumo(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.ok(insumoService.stockPorInsumo(id)));
    }

    @PostMapping("/stock")
    @PreAuthorize("hasAuthority('create:inventario')")
    public ResponseEntity<ApiResponse<StockInsumoResponse>> registrarStock(@RequestBody StockInsumoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(insumoService.registrarStock(request)));
    }

    @GetMapping("/movimientos")
    @PreAuthorize("hasAuthority('read:inventario')")
    public ResponseEntity<ApiResponse<Page<MovimientoInsumoResponse>>> movimientos(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.ok(insumoService.listarMovimientos(page, size)));
    }

    @PostMapping("/movimientos")
    @PreAuthorize("hasAuthority('create:inventario')")
    public ResponseEntity<ApiResponse<MovimientoInsumoResponse>> registrarMovimiento(@RequestBody MovimientoInsumoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(insumoService.registrarMovimiento(request)));
    }
}
