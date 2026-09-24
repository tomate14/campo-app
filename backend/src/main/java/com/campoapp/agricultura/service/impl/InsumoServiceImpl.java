package com.campoapp.agricultura.service.impl;

import com.campoapp.agricultura.dto.insumos.*;
import com.campoapp.agricultura.entity.Lote;
import com.campoapp.agricultura.entity.insumos.*;
import com.campoapp.agricultura.entity.plagas.OrdenAplicacion;
import com.campoapp.agricultura.repository.LoteRepository;
import com.campoapp.agricultura.repository.insumos.InsumoAgricolaRepository;
import com.campoapp.agricultura.repository.insumos.MovimientoInsumoAgricolaRepository;
import com.campoapp.agricultura.repository.insumos.StockInsumoAgricolaRepository;
import com.campoapp.agricultura.service.InsumoService;
import com.campoapp.common.exception.BusinessException;
import com.campoapp.common.exception.ResourceNotFoundException;
import com.campoapp.finanzas.entity.ProveedorFinanciero;
import com.campoapp.finanzas.repository.ProveedorFinancieroRepository;
import com.campoapp.operarios.entity.Operario;
import com.campoapp.operarios.repository.OperarioRepository;
import com.campoapp.utilidades.service.CatalogoUtilidadRegistry;
import com.campoapp.utilidades.service.UtilidadNombreResolver;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
public class InsumoServiceImpl implements InsumoService {

    private static final int DIAS_ALERTA_VENCIMIENTO = 30;

    private final InsumoAgricolaRepository insumoRepository;
    private final StockInsumoAgricolaRepository stockRepository;
    private final MovimientoInsumoAgricolaRepository movimientoRepository;
    private final LoteRepository loteRepository;
    private final OperarioRepository operarioRepository;
    private final ProveedorFinancieroRepository proveedorRepository;
    private final UtilidadNombreResolver utilidadNombreResolver;

    @Override
    @Transactional(readOnly = true)
    public InsumosDashboardResponse dashboard() {
        List<InsumoAgricola> activos = insumoRepository.findAllActive();
        Map<String, String> tipos = tiposDe(activos);
        Map<String, String> unidades = unidadesDe(activos);
        List<InsumoAgricolaResponse> insumos = activos.stream()
                .map(i -> toInsumoResponse(i, tipos, unidades))
                .toList();
        List<StockInsumoResponse> vencimientos = stockRepository.vencimientosHasta(LocalDate.now().plusDays(DIAS_ALERTA_VENCIMIENTO)).stream()
                .map(this::toStockResponse)
                .toList();
        List<MovimientoInsumoResponse> movimientos = movimientoRepository.findTop8ByDeletedAtIsNullOrderByFechaDesc().stream()
                .map(this::toMovimientoResponse)
                .toList();
        BigDecimal valorizado = insumos.stream()
                .map(InsumoAgricolaResponse::valorStock)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return new InsumosDashboardResponse(
                insumoRepository.findFiltered(null, null, null, PageRequest.of(0, 1)).getTotalElements(),
                insumos.size(),
                insumos.stream().filter(InsumoAgricolaResponse::requiereReorden).count(),
                vencimientos.size(),
                valorizado,
                insumos.stream().filter(InsumoAgricolaResponse::requiereReorden).limit(8).toList(),
                vencimientos.stream().limit(8).toList(),
                movimientos
        );
    }

    @Override
    @Transactional(readOnly = true)
    public Page<InsumoAgricolaResponse> listarInsumos(String search, String tipo, Boolean activo, int page, int size) {
        Page<InsumoAgricola> pagina = insumoRepository.findFiltered(search, tipo, activo, PageRequest.of(page, size));
        Map<String, String> tipos = tiposDe(pagina.getContent());
        Map<String, String> unidades = unidadesDe(pagina.getContent());
        return pagina.map(i -> toInsumoResponse(i, tipos, unidades));
    }

    @Override
    @Transactional(readOnly = true)
    public List<InsumoAgricolaResponse> listarInsumosActivos() {
        List<InsumoAgricola> activos = insumoRepository.findAllActive();
        Map<String, String> tipos = tiposDe(activos);
        Map<String, String> unidades = unidadesDe(activos);
        return activos.stream().map(i -> toInsumoResponse(i, tipos, unidades)).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public InsumoAgricolaResponse obtenerInsumo(String id) {
        return toInsumoResponse(getInsumo(id));
    }

    @Override
    public InsumoAgricolaResponse crearInsumo(InsumoAgricolaRequest request) {
        validateInsumo(request, null);
        ProveedorFinanciero proveedor = resolveProveedor(request.proveedorId());
        InsumoAgricola insumo = InsumoAgricola.builder()
                .codigo(request.codigo().trim())
                .nombre(request.nombre().trim())
                .tipo(request.tipo())
                .marca(request.marca())
                .presentacion(request.presentacion())
                .unidadMedida(request.unidadMedida())
                .principioActivo(request.principioActivo())
                .proveedor(proveedor != null ? proveedor.getRazonSocial() : request.proveedor())
                .proveedorFinanciero(proveedor)
                .origen(request.origen())
                .descripcion(request.descripcion())
                .precioUnitario(request.precioUnitario())
                .stockMinimo(defaultZero(request.stockMinimo()))
                .stockMaximo(request.stockMaximo())
                .activo(request.activo() == null || request.activo())
                .build();
        return toInsumoResponse(insumoRepository.save(insumo));
    }

    @Override
    public InsumoAgricolaResponse actualizarInsumo(String id, InsumoAgricolaRequest request) {
        InsumoAgricola insumo = getInsumo(id);
        validateInsumo(request, id);
        ProveedorFinanciero proveedor = resolveProveedor(request.proveedorId());
        insumo.setCodigo(request.codigo().trim());
        insumo.setNombre(request.nombre().trim());
        insumo.setTipo(request.tipo());
        insumo.setMarca(request.marca());
        insumo.setPresentacion(request.presentacion());
        insumo.setUnidadMedida(request.unidadMedida());
        insumo.setPrincipioActivo(request.principioActivo());
        insumo.setProveedor(proveedor != null ? proveedor.getRazonSocial() : request.proveedor());
        insumo.setProveedorFinanciero(proveedor);
        insumo.setOrigen(request.origen());
        insumo.setDescripcion(request.descripcion());
        insumo.setPrecioUnitario(request.precioUnitario());
        insumo.setStockMinimo(defaultZero(request.stockMinimo()));
        insumo.setStockMaximo(request.stockMaximo());
        insumo.setActivo(request.activo() == null || request.activo());
        return toInsumoResponse(insumoRepository.save(insumo));
    }

    @Override
    public void eliminarInsumo(String id) {
        InsumoAgricola insumo = getInsumo(id);
        insumo.softDelete();
        insumoRepository.save(insumo);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<StockInsumoResponse> listarStock(int page, int size) {
        return stockRepository.findByDeletedAtIsNullOrderByFechaVencimientoAsc(PageRequest.of(page, size))
                .map(this::toStockResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<InsumoAgricolaResponse> listarAlertasReorden(int page, int size) {
        Page<InsumoAgricola> pagina = insumoRepository.findReordenPendiente(PageRequest.of(page, size));
        Map<String, String> tipos = tiposDe(pagina.getContent());
        Map<String, String> unidades = unidadesDe(pagina.getContent());
        return pagina.map(i -> toInsumoResponse(i, tipos, unidades));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<StockInsumoResponse> listarVencimientosProximos(int page, int size) {
        return stockRepository.vencimientosHasta(LocalDate.now().plusDays(DIAS_ALERTA_VENCIMIENTO), PageRequest.of(page, size))
                .map(this::toStockResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public List<StockInsumoResponse> stockPorInsumo(String insumoId) {
        return stockRepository.findByInsumoIdAndDeletedAtIsNullOrderByFechaVencimientoAsc(insumoId).stream()
                .map(this::toStockResponse)
                .toList();
    }

    @Override
    public StockInsumoResponse registrarStock(StockInsumoRequest request) {
        InsumoAgricola insumo = getInsumo(request.insumoId());
        Operario responsable = resolveOperario(request.responsableId());
        StockInsumoAgricola stock = StockInsumoAgricola.builder()
                .insumo(insumo)
                .loteStock(request.loteStock())
                .cantidadDisponible(defaultZero(request.cantidadDisponible()))
                .fechaVencimiento(request.fechaVencimiento())
                .ubicacionDeposito(request.ubicacionDeposito())
                .deposito(request.deposito())
                .responsable(responsable)
                .observaciones(request.observaciones())
                .build();
        return toStockResponse(stockRepository.save(stock));
    }

    @Override
    public MovimientoInsumoResponse registrarMovimiento(MovimientoInsumoRequest request) {
        validateMovimiento(request);
        InsumoAgricola insumo = getInsumo(request.insumoId());
        StockInsumoAgricola stock = resolveStock(request.stockId());
        Lote lote = resolveLote(request.loteId());
        Operario responsable = resolveOperario(request.responsableId());
        TipoMovimientoInsumo tipo = request.tipoMovimiento();
        BigDecimal cantidad = request.cantidad();

        if ((tipo == TipoMovimientoInsumo.SALIDA || tipo == TipoMovimientoInsumo.USO) && stock == null) {
            throw new BusinessException("Debe seleccionar un lote de stock para registrar salida o uso");
        }
        if (tipo == TipoMovimientoInsumo.INGRESO && stock != null) {
            stock.setCantidadDisponible(stock.getCantidadDisponible().add(cantidad));
            stockRepository.save(stock);
        }
        if (tipo == TipoMovimientoInsumo.SALIDA || tipo == TipoMovimientoInsumo.USO) {
            descontarStock(stock, cantidad);
        }
        if (tipo == TipoMovimientoInsumo.AJUSTE && stock != null) {
            stock.setCantidadDisponible(cantidad);
            stockRepository.save(stock);
        }

        MovimientoInsumoAgricola movimiento = MovimientoInsumoAgricola.builder()
                .insumo(insumo)
                .stock(stock)
                .lote(lote)
                .fecha(request.fecha() == null ? LocalDateTime.now() : request.fecha())
                .tipoMovimiento(tipo)
                .cantidad(cantidad)
                .costoUnitario(request.costoUnitario())
                .responsableOperario(responsable)
                .responsable(responsable == null ? null : nombreCompleto(responsable))
                .tareaReferencia(request.tareaReferencia())
                .proveedor(request.proveedor())
                .origen(request.origen())
                .destino(request.destino())
                .observaciones(request.observaciones())
                .build();
        return toMovimientoResponse(movimientoRepository.save(movimiento));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<MovimientoInsumoResponse> listarMovimientos(int page, int size) {
        return movimientoRepository.findByDeletedAtIsNullOrderByFechaDesc(PageRequest.of(page, size))
                .map(this::toMovimientoResponse);
    }

    // Feature 84: al validar la orden se genera un movimiento de salida que descuenta stock y
    // toma el costo del insumo. Idempotente: si ya existe un movimiento para la orden, lo devuelve.
    @Override
    public MovimientoInsumoResponse generarSalidaPorOrden(OrdenAplicacion orden, Long numero) {
        InsumoAgricola insumo = orden.getInsumo();
        if (insumo == null) {
            throw new BusinessException("La orden no tiene insumo asociado");
        }
        MovimientoInsumoAgricola existente = movimientoRepository.findFirstByOrdenAplicacionIdAndDeletedAtIsNull(orden.getId());
        if (existente != null) {
            return toMovimientoResponse(existente);
        }
        // cantidad = dosis x superficie tratada; si no hay superficie se usa la dosis.
        BigDecimal cantidad = orden.getDosis() == null ? BigDecimal.ZERO : orden.getDosis();
        if (orden.getSuperficieTratadaHa() != null) {
            cantidad = cantidad.multiply(orden.getSuperficieTratadaHa());
        }
        // costo del insumo del catalogo; si es null se guarda null (el calculo lo trata como 0).
        BigDecimal costoUnitario = insumo.getPrecioUnitario();

        // Se descuenta del stock FEFO (vencimiento mas proximo con disponibilidad) reutilizando la
        // logica de descuento. Si el inventario no tiene stock cargado, se guarda el movimiento sin
        // stock para no bloquear la validacion (el costo igual se contabiliza).
        StockInsumoAgricola stock = stockRepository.findByInsumoIdAndDeletedAtIsNullOrderByFechaVencimientoAsc(insumo.getId()).stream()
                .filter(s -> s.getCantidadDisponible() != null && s.getCantidadDisponible().compareTo(BigDecimal.ZERO) > 0)
                .findFirst()
                .orElse(null);
        if (stock != null) {
            descontarStock(stock, cantidad);
        }

        MovimientoInsumoAgricola movimiento = MovimientoInsumoAgricola.builder()
                .insumo(insumo)
                .stock(stock)
                .lote(orden.getLote())
                .fecha(orden.getFechaAplicacion() == null ? LocalDateTime.now() : orden.getFechaAplicacion())
                .tipoMovimiento(TipoMovimientoInsumo.SALIDA)
                .cantidad(cantidad)
                .costoUnitario(costoUnitario)
                .tareaReferencia("Orden OA-" + (numero == null ? "" : numero))
                .ordenAplicacion(orden)
                .build();
        return toMovimientoResponse(movimientoRepository.save(movimiento));
    }

    // Feature 84: descuento de stock reutilizado por movimientos manuales y por ordenes.
    private void descontarStock(StockInsumoAgricola stock, BigDecimal cantidad) {
        if (stock.getCantidadDisponible().compareTo(cantidad) < 0) {
            throw new BusinessException("Stock insuficiente para el movimiento solicitado");
        }
        stock.setCantidadDisponible(stock.getCantidadDisponible().subtract(cantidad));
        stockRepository.save(stock);
    }

    private void validateInsumo(InsumoAgricolaRequest request, String currentId) {
        if (request.codigo() == null || request.codigo().isBlank()) {
            throw new BusinessException("El codigo del insumo es obligatorio");
        }
        if (request.nombre() == null || request.nombre().isBlank()) {
            throw new BusinessException("El nombre del insumo es obligatorio");
        }
        if (request.tipo() == null) {
            throw new BusinessException("El tipo del insumo es obligatorio");
        }
        if (request.unidadMedida() == null) {
            throw new BusinessException("La unidad de medida es obligatoria");
        }
        boolean duplicated = currentId == null
                ? insumoRepository.existsByCodigoAndDeletedAtIsNull(request.codigo().trim())
                : insumoRepository.existsByCodigoAndIdNotAndDeletedAtIsNull(request.codigo().trim(), currentId);
        if (duplicated) {
            throw new BusinessException("Ya existe un insumo con ese codigo");
        }
    }

    private void validateMovimiento(MovimientoInsumoRequest request) {
        if (request.insumoId() == null || request.insumoId().isBlank()) {
            throw new BusinessException("El insumo es obligatorio");
        }
        if (request.tipoMovimiento() == null) {
            throw new BusinessException("El tipo de movimiento es obligatorio");
        }
        if (request.cantidad() == null || request.cantidad().compareTo(BigDecimal.ZERO) < 0) {
            throw new BusinessException("La cantidad debe ser mayor o igual a cero");
        }
    }

    private InsumoAgricola getInsumo(String id) {
        return insumoRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("Insumo no encontrado"));
    }

    private StockInsumoAgricola resolveStock(String id) {
        if (id == null || id.isBlank()) {
            return null;
        }
        return stockRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("Stock no encontrado"));
    }

    private Lote resolveLote(String id) {
        if (id == null || id.isBlank()) {
            return null;
        }
        return loteRepository.findActiveById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lote no encontrado"));
    }

    private Operario resolveOperario(String id) {
        if (id == null || id.isBlank()) {
            return null;
        }
        return operarioRepository.findActiveById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Operario responsable no encontrado"));
    }

    private ProveedorFinanciero resolveProveedor(String id) {
        if (id == null || id.isBlank()) {
            return null;
        }
        return proveedorRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("Proveedor no encontrado"));
    }

    // Batch id -> valor de los catalogos TIPO_INSUMO y UNIDAD_INSUMO para una lista de insumos.
    private Map<String, String> tiposDe(List<InsumoAgricola> insumos) {
        return utilidadNombreResolver.resolverNombres(
                CatalogoUtilidadRegistry.TIPO_INSUMO,
                insumos.stream().map(InsumoAgricola::getTipo).toList());
    }

    private Map<String, String> unidadesDe(List<InsumoAgricola> insumos) {
        return utilidadNombreResolver.resolverNombres(
                CatalogoUtilidadRegistry.UNIDAD_INSUMO,
                insumos.stream().map(InsumoAgricola::getUnidadMedida).toList());
    }

    // Usa el mapa batch si el id esta presente; si no, hace el lookup individual (paths de un solo insumo).
    private String resolverInsumo(String categoria, String id, Map<String, String> nombres) {
        if (id != null && nombres.containsKey(id)) {
            return nombres.get(id);
        }
        return utilidadNombreResolver.resolver(categoria, id);
    }

    private InsumoAgricolaResponse toInsumoResponse(InsumoAgricola insumo) {
        return toInsumoResponse(insumo, Map.of(), Map.of());
    }

    private InsumoAgricolaResponse toInsumoResponse(InsumoAgricola insumo, Map<String, String> tipoNombres, Map<String, String> unidadNombres) {
        BigDecimal stockTotal = stockRepository.totalByInsumoId(insumo.getId());
        BigDecimal precio = insumo.getPrecioUnitario() == null ? BigDecimal.ZERO : insumo.getPrecioUnitario();
        List<StockInsumoAgricola> stocks = stockRepository.findByInsumoIdAndDeletedAtIsNullOrderByFechaVencimientoAsc(insumo.getId());
        LocalDate proximoVencimiento = stocks.stream()
                .filter(stock -> stock.getCantidadDisponible().compareTo(BigDecimal.ZERO) > 0)
                .map(StockInsumoAgricola::getFechaVencimiento)
                .filter(fecha -> fecha != null)
                .findFirst()
                .orElse(null);
        boolean vence = proximoVencimiento != null && !proximoVencimiento.isAfter(LocalDate.now().plusDays(DIAS_ALERTA_VENCIMIENTO));
        return new InsumoAgricolaResponse(
                insumo.getId(),
                insumo.getCodigo(),
                insumo.getNombre(),
                insumo.getTipo(),
                resolverInsumo(CatalogoUtilidadRegistry.TIPO_INSUMO, insumo.getTipo(), tipoNombres),
                insumo.getMarca(),
                insumo.getPresentacion(),
                insumo.getUnidadMedida(),
                resolverInsumo(CatalogoUtilidadRegistry.UNIDAD_INSUMO, insumo.getUnidadMedida(), unidadNombres),
                insumo.getPrincipioActivo(),
                insumo.getProveedorFinanciero() != null ? insumo.getProveedorFinanciero().getId() : null,
                insumo.getProveedorFinanciero() != null ? insumo.getProveedorFinanciero().getRazonSocial() : insumo.getProveedor(),
                insumo.getOrigen(),
                insumo.getDescripcion(),
                insumo.getPrecioUnitario(),
                insumo.getStockMinimo(),
                insumo.getStockMaximo(),
                insumo.getActivo(),
                stockTotal,
                stockTotal.multiply(precio),
                proximoVencimiento,
                stockTotal.compareTo(defaultZero(insumo.getStockMinimo())) <= 0,
                vence,
                insumo.getCreatedAt(),
                insumo.getUpdatedAt()
        );
    }

    private StockInsumoResponse toStockResponse(StockInsumoAgricola stock) {
        LocalDate today = LocalDate.now();
        boolean vencido = stock.getFechaVencimiento() != null && stock.getFechaVencimiento().isBefore(today);
        boolean proximo = stock.getFechaVencimiento() != null && !stock.getFechaVencimiento().isAfter(today.plusDays(DIAS_ALERTA_VENCIMIENTO));
        return new StockInsumoResponse(
                stock.getId(),
                stock.getInsumo().getId(),
                stock.getInsumo().getNombre(),
                stock.getInsumo().getCodigo(),
                stock.getLoteStock(),
                stock.getCantidadDisponible(),
                stock.getFechaVencimiento(),
                stock.getUbicacionDeposito(),
                stock.getDeposito(),
                stock.getResponsable() != null ? stock.getResponsable().getId() : null,
                stock.getResponsable() != null ? nombreCompleto(stock.getResponsable()) : null,
                stock.getObservaciones(),
                vencido,
                proximo,
                stock.getCreatedAt(),
                stock.getUpdatedAt()
        );
    }

    private MovimientoInsumoResponse toMovimientoResponse(MovimientoInsumoAgricola movimiento) {
        BigDecimal costoUnitario = movimiento.getCostoUnitario();
        BigDecimal costoTotal = costoUnitario == null ? null : costoUnitario.multiply(movimiento.getCantidad());
        return new MovimientoInsumoResponse(
                movimiento.getId(),
                movimiento.getInsumo().getId(),
                movimiento.getInsumo().getNombre(),
                movimiento.getStock() != null ? movimiento.getStock().getId() : null,
                movimiento.getLote() != null ? movimiento.getLote().getId() : null,
                movimiento.getLote() != null ? movimiento.getLote().getNombre() : null,
                movimiento.getFecha(),
                movimiento.getTipoMovimiento(),
                movimiento.getCantidad(),
                costoUnitario,
                costoTotal,
                movimiento.getResponsableOperario() != null ? movimiento.getResponsableOperario().getId() : null,
                movimiento.getResponsableOperario() != null ? nombreCompleto(movimiento.getResponsableOperario()) : movimiento.getResponsable(),
                movimiento.getTareaReferencia(),
                movimiento.getProveedor(),
                movimiento.getOrigen(),
                movimiento.getDestino(),
                movimiento.getObservaciones(),
                movimiento.getCreatedAt()
        );
    }

    private BigDecimal defaultZero(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private String nombreCompleto(Operario operario) {
        return (operario.getNombre() + " " + operario.getApellido()).trim();
    }
}
