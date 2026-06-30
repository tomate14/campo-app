package com.campoapp.finanzas.service;

import com.campoapp.finanzas.dto.*;
import com.campoapp.finanzas.entity.EstadoCompra;
import org.springframework.data.domain.Page;

import java.time.LocalDate;

public interface ComprasProveedoresService {
    ComprasDashboardResponse dashboard(LocalDate fechaDesde, LocalDate fechaHasta);
    Page<ProveedorResponse> listarProveedores(String search, int page, int size);
    ProveedorResponse crearProveedor(ProveedorRequest request);
    ProveedorResponse actualizarProveedor(String id, ProveedorRequest request);
    void eliminarProveedor(String id);
    Page<CompraResponse> listarCompras(String search, EstadoCompra estado, LocalDate fechaDesde, LocalDate fechaHasta, int page, int size);
    CompraResponse crearCompra(CompraRequest request);
    Page<PagoProveedorResponse> listarPagos(int page, int size);
    PagoProveedorResponse registrarPago(PagoProveedorRequest request);
}
