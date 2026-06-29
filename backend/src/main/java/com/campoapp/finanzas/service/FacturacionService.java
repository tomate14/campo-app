package com.campoapp.finanzas.service;

import com.campoapp.finanzas.dto.*;
import com.campoapp.finanzas.entity.EstadoFactura;
import org.springframework.data.domain.Page;

import java.time.LocalDate;

public interface FacturacionService {
    FacturacionDashboardResponse dashboard(LocalDate fechaDesde, LocalDate fechaHasta);
    Page<ClienteResponse> listarClientes(String search, int page, int size);
    ClienteResponse crearCliente(ClienteRequest request);
    ClienteResponse actualizarCliente(String id, ClienteRequest request);
    void eliminarCliente(String id);
    Page<FacturaResponse> listarFacturas(String search, EstadoFactura estado, LocalDate fechaDesde, LocalDate fechaHasta, int page, int size);
    FacturaResponse crearFactura(FacturaRequest request);
    Page<CobroResponse> listarCobros(int page, int size);
    CobroResponse registrarCobro(CobroRequest request);
    Page<NotaCreditoResponse> listarNotasCredito(int page, int size);
    NotaCreditoResponse registrarNotaCredito(NotaCreditoRequest request);
}
