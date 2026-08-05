package com.campoapp.agricultura.service;

import com.campoapp.agricultura.dto.insumos.*;
import org.springframework.data.domain.Page;

import java.util.List;

public interface InsumoService {
    InsumosDashboardResponse dashboard();
    Page<InsumoAgricolaResponse> listarInsumos(String search, String tipo, Boolean activo, int page, int size);
    List<InsumoAgricolaResponse> listarInsumosActivos();
    InsumoAgricolaResponse obtenerInsumo(String id);
    InsumoAgricolaResponse crearInsumo(InsumoAgricolaRequest request);
    InsumoAgricolaResponse actualizarInsumo(String id, InsumoAgricolaRequest request);
    void eliminarInsumo(String id);
    Page<StockInsumoResponse> listarStock(int page, int size);
    Page<InsumoAgricolaResponse> listarAlertasReorden(int page, int size);
    Page<StockInsumoResponse> listarVencimientosProximos(int page, int size);
    List<StockInsumoResponse> stockPorInsumo(String insumoId);
    StockInsumoResponse registrarStock(StockInsumoRequest request);
    MovimientoInsumoResponse registrarMovimiento(MovimientoInsumoRequest request);
    Page<MovimientoInsumoResponse> listarMovimientos(int page, int size);
}
