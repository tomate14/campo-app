package com.campoapp.demo;

import com.campoapp.agricultura.entity.insumos.InsumoAgricola;
import com.campoapp.agricultura.entity.insumos.MovimientoInsumoAgricola;
import com.campoapp.agricultura.entity.insumos.StockInsumoAgricola;
import com.campoapp.agricultura.entity.insumos.TipoMovimientoInsumo;
import com.campoapp.agricultura.repository.insumos.InsumoAgricolaRepository;
import com.campoapp.agricultura.repository.insumos.MovimientoInsumoAgricolaRepository;
import com.campoapp.agricultura.repository.insumos.StockInsumoAgricolaRepository;
import com.campoapp.operarios.entity.Operario;
import com.campoapp.operarios.repository.OperarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Seeder de demo del dominio Insumos agricolas (feature 76, orden 30).
 *
 * Crea insumos, stock por deposito y movimientos de entrada/salida. Los tipos usan
 * ids del catalogo Utilidades (tins-*) y las unidades (unid-*). Idempotente por id
 * fijo demo-*.
 */
@Component
@RequiredArgsConstructor
public class InsumosDemoSeeder implements DemoSeeder {

    private final InsumoAgricolaRepository insumoRepo;
    private final StockInsumoAgricolaRepository stockRepo;
    private final MovimientoInsumoAgricolaRepository movimientoRepo;
    private final OperarioRepository operarioRepo;

    @Override
    public int orden() {
        return 30;
    }

    @Override
    public String nombre() {
        return "insumos";
    }

    @Override
    @Transactional
    public int sembrar() {
        int creados = 0;

        // 6 insumos representativos (semilla, fertilizantes, fitosanitarios).
        InsumoAgricola semilla = crearInsumo("demo-insumo-1", "DEMO-SEM-SOJA", "Semilla soja DM 46R18",
                "tins-semilla", "unid-bolsa", "Don Mario", "Bolsa 40 kg", null,
                new BigDecimal("98000.00"), new BigDecimal("10"), new BigDecimal("200"));
        creados += semilla != null ? 1 : 0;

        InsumoAgricola urea = crearInsumo("demo-insumo-2", "DEMO-FERT-UREA", "Urea granulada 46N",
                "tins-fertilizante", "unid-kg", "Profertil", "Big bag 1000 kg", "Urea 46%",
                new BigDecimal("850.00"), new BigDecimal("2000"), new BigDecimal("40000"));
        creados += urea != null ? 1 : 0;

        InsumoAgricola glifosato = crearInsumo("demo-insumo-3", "DEMO-HERB-GLIFO", "Glifosato 48% SL",
                "tins-herbicida", "unid-l", "Atanor", "Bidon 20 L", "Glifosato 48%",
                new BigDecimal("4200.00"), new BigDecimal("200"), new BigDecimal("4000"));
        creados += glifosato != null ? 1 : 0;

        InsumoAgricola fungicida = crearInsumo("demo-insumo-4", "DEMO-FUNG-AZOX", "Fungicida Amistar Xtra",
                "tins-fungicida", "unid-l", "Syngenta", "Bidon 5 L", "Azoxistrobina + Ciproconazol",
                new BigDecimal("15800.00"), new BigDecimal("40"), new BigDecimal("600"));
        creados += fungicida != null ? 1 : 0;

        InsumoAgricola insecticida = crearInsumo("demo-insumo-5", "DEMO-INSEC-CLORAN", "Insecticida Coragen",
                "tins-insecticida", "unid-l", "Corteva", "Bidon 5 L", "Clorantraniliprole",
                new BigDecimal("22000.00"), new BigDecimal("30"), new BigDecimal("400"));
        creados += insecticida != null ? 1 : 0;

        InsumoAgricola fda = crearInsumo("demo-insumo-6", "DEMO-FERT-FDA", "Fosfato diamonico (FDA)",
                "tins-fertilizante", "unid-kg", "Bunge", "Big bag 1000 kg", "Fosfato diamonico 18-46-0",
                new BigDecimal("1100.00"), new BigDecimal("1500"), new BigDecimal("30000"));
        creados += fda != null ? 1 : 0;

        LocalDate hoy = LocalDate.now();

        // Stock por deposito. Los fitosanitarios llevan vencimiento (uno proximo a vencer).
        creados += crearStock("demo-stock-1", "demo-insumo-1", "L-SOJA-2025", new BigDecimal("120"),
                null, "Deposito Central", "Estante A1", "demo-oper-1", "Semilla clasificada y curada.");
        creados += crearStock("demo-stock-2", "demo-insumo-2", "UREA-A", new BigDecimal("18000"),
                null, "Deposito Central", "Playon insumos secos", "demo-oper-2", null);
        creados += crearStock("demo-stock-3", "demo-insumo-3", "GLIFO-2025", new BigDecimal("1600"),
                hoy.plusMonths(10), "Deposito Fitosanitarios", "Rack 2", "demo-oper-2",
                "Almacenado en area ventilada.");
        creados += crearStock("demo-stock-4", "demo-insumo-4", "AMISTAR-01", new BigDecimal("180"),
                hoy.plusMonths(2), "Deposito Fitosanitarios", "Rack 3", "demo-oper-3",
                "Vencimiento proximo, priorizar uso.");
        creados += crearStock("demo-stock-5", "demo-insumo-5", "CORAGEN-01", new BigDecimal("140"),
                hoy.plusMonths(7), "Deposito Fitosanitarios", "Rack 3", "demo-oper-3", null);
        creados += crearStock("demo-stock-6", "demo-insumo-6", "FDA-A", new BigDecimal("9000"),
                null, "Deposito Central", "Playon insumos secos", "demo-oper-2", null);

        // Movimientos: ingresos de compra y salidas por uso a campo.
        creados += crearMovimiento("demo-mov-1", "demo-insumo-1", "demo-stock-1", null,
                TipoMovimientoInsumo.INGRESO, new BigDecimal("120"), new BigDecimal("98000.00"),
                "demo-oper-1", 40, "Compra campana", "Don Mario", null, null,
                "Ingreso de semilla para siembra de soja.");
        creados += crearMovimiento("demo-mov-2", "demo-insumo-1", "demo-stock-1", "demo-lote-1",
                TipoMovimientoInsumo.SALIDA, new BigDecimal("30"), new BigDecimal("98000.00"),
                "demo-oper-1", 6, "Siembra lote 1", null, "Deposito Central", "Lote 1",
                "Entrega para siembra.");

        creados += crearMovimiento("demo-mov-3", "demo-insumo-2", "demo-stock-2", null,
                TipoMovimientoInsumo.INGRESO, new BigDecimal("20000"), new BigDecimal("850.00"),
                "demo-oper-2", 35, "Compra fertilizante", "Profertil", null, null, null);
        creados += crearMovimiento("demo-mov-4", "demo-insumo-2", "demo-stock-2", "demo-lote-2",
                TipoMovimientoInsumo.SALIDA, new BigDecimal("2000"), new BigDecimal("850.00"),
                "demo-oper-2", 4, "Fertilizacion lote 2", null, "Deposito Central", "Lote 2", null);

        creados += crearMovimiento("demo-mov-5", "demo-insumo-3", "demo-stock-3", null,
                TipoMovimientoInsumo.INGRESO, new BigDecimal("2000"), new BigDecimal("4200.00"),
                "demo-oper-2", 30, "Compra herbicida", "Atanor", null, null, null);
        creados += crearMovimiento("demo-mov-6", "demo-insumo-3", "demo-stock-3", "demo-lote-2",
                TipoMovimientoInsumo.SALIDA, new BigDecimal("400"), new BigDecimal("4200.00"),
                "demo-oper-2", 20, "Control maleza lote 2", null, "Deposito Fitosanitarios", "Lote 2", null);

        creados += crearMovimiento("demo-mov-7", "demo-insumo-4", "demo-stock-4", "demo-lote-1",
                TipoMovimientoInsumo.SALIDA, new BigDecimal("20"), new BigDecimal("15800.00"),
                "demo-oper-3", 5, "Aplicacion fungicida lote 1", null, "Deposito Fitosanitarios",
                "Lote 1", "Salida para control de roya.");
        creados += crearMovimiento("demo-mov-8", "demo-insumo-5", "demo-stock-5", "demo-lote-2",
                TipoMovimientoInsumo.SALIDA, new BigDecimal("10"), new BigDecimal("22000.00"),
                "demo-oper-3", 7, "Aplicacion insecticida lote 2", null, "Deposito Fitosanitarios",
                "Lote 2", "Salida para control de oruga cogollera.");

        return creados;
    }

    private InsumoAgricola crearInsumo(String id, String codigo, String nombre, String tipo,
                                       String unidad, String marca, String presentacion,
                                       String principioActivo, BigDecimal precio,
                                       BigDecimal stockMin, BigDecimal stockMax) {
        // Ya existe: devolvemos null para NO contarlo como creado (idempotencia del conteo).
        // El stock referencia el insumo por id (string), no por esta entidad.
        if (insumoRepo.existsById(id)) {
            return null;
        }
        InsumoAgricola i = new InsumoAgricola();
        i.setId(id);
        i.setCodigo(codigo);
        i.setNombre(nombre);
        i.setTipo(tipo);
        i.setUnidadMedida(unidad);
        i.setMarca(marca);
        i.setPresentacion(presentacion);
        i.setPrincipioActivo(principioActivo);
        i.setPrecioUnitario(precio);
        i.setStockMinimo(stockMin);
        i.setStockMaximo(stockMax);
        i.setActivo(true);
        return insumoRepo.save(i);
    }

    private int crearStock(String id, String insumoId, String loteStock, BigDecimal cantidad,
                           LocalDate vencimiento, String deposito, String ubicacion,
                           String operarioId, String observaciones) {
        if (stockRepo.existsById(id)) {
            return 0;
        }
        InsumoAgricola insumo = insumoRepo.findById(insumoId).orElse(null);
        if (insumo == null) {
            return 0;
        }
        StockInsumoAgricola s = new StockInsumoAgricola();
        s.setId(id);
        s.setInsumo(insumo);
        s.setLoteStock(loteStock);
        s.setCantidadDisponible(cantidad);
        s.setFechaVencimiento(vencimiento);
        s.setDeposito(deposito);
        s.setUbicacionDeposito(ubicacion);
        s.setResponsable(operario(operarioId));
        s.setObservaciones(observaciones);
        stockRepo.save(s);
        return 1;
    }

    private int crearMovimiento(String id, String insumoId, String stockId, String loteId,
                                TipoMovimientoInsumo tipo, BigDecimal cantidad, BigDecimal costoUnitario,
                                String operarioId, int diasAtras, String tareaReferencia,
                                String proveedor, String origen, String destino, String observaciones) {
        if (movimientoRepo.existsById(id)) {
            return 0;
        }
        InsumoAgricola insumo = insumoRepo.findById(insumoId).orElse(null);
        if (insumo == null) {
            return 0;
        }
        MovimientoInsumoAgricola m = new MovimientoInsumoAgricola();
        m.setId(id);
        m.setInsumo(insumo);
        if (stockId != null) {
            stockRepo.findById(stockId).ifPresent(m::setStock);
        }
        m.setFecha(LocalDateTime.now().minusDays(diasAtras));
        m.setTipoMovimiento(tipo);
        m.setCantidad(cantidad);
        m.setCostoUnitario(costoUnitario);
        Operario op = operario(operarioId);
        m.setResponsableOperario(op);
        m.setResponsable(op != null ? (op.getNombre() + " " + op.getApellido()).trim() : operarioId);
        m.setTareaReferencia(tareaReferencia);
        m.setProveedor(proveedor);
        m.setOrigen(origen);
        m.setDestino(destino);
        m.setObservaciones(observaciones);
        movimientoRepo.save(m);
        return 1;
    }

    private Operario operario(String operarioId) {
        return operarioRepo.findById(operarioId).orElse(null);
    }
}
