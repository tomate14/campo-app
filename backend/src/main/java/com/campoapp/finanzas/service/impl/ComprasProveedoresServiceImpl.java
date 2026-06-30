package com.campoapp.finanzas.service.impl;

import com.campoapp.agricultura.entity.insumos.InsumoAgricola;
import com.campoapp.agricultura.repository.insumos.InsumoAgricolaRepository;
import com.campoapp.common.exception.BusinessException;
import com.campoapp.common.exception.ResourceNotFoundException;
import com.campoapp.finanzas.dto.*;
import com.campoapp.finanzas.entity.*;
import com.campoapp.finanzas.repository.*;
import com.campoapp.finanzas.service.ComprasProveedoresService;
import com.campoapp.operarios.entity.Operario;
import com.campoapp.operarios.repository.OperarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;

@Service
@RequiredArgsConstructor
@Transactional
public class ComprasProveedoresServiceImpl implements ComprasProveedoresService {
    private final ProveedorFinancieroRepository proveedorRepository;
    private final CompraProveedorRepository compraRepository;
    private final PagoProveedorRepository pagoRepository;
    private final InsumoAgricolaRepository insumoRepository;
    private final OperarioRepository operarioRepository;

    @Override
    @Transactional(readOnly = true)
    public ComprasDashboardResponse dashboard(LocalDate fechaDesde, LocalDate fechaHasta) {
        LocalDate desde = defaultDesde(fechaDesde);
        LocalDate hasta = defaultHasta(fechaHasta);
        validateRange(desde, hasta);
        return new ComprasDashboardResponse(
                proveedorRepository.countByDeletedAtIsNullAndActivoTrue(),
                compraRepository.countByDeletedAtIsNull(),
                compraRepository.comprasEntre(desde, hasta),
                compraRepository.cuentasPorPagarEntre(desde, hasta),
                pagoRepository.pagosEntre(desde, hasta),
                compraRepository.countByDeletedAtIsNullAndEstado(EstadoCompra.VENCIDA)
        );
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProveedorResponse> listarProveedores(String search, int page, int size) {
        return proveedorRepository.findFiltered(search, pageRequest(page, size)).map(this::toProveedorResponse);
    }

    @Override
    public ProveedorResponse crearProveedor(ProveedorRequest request) {
        validateProveedor(request);
        String cuit = request.cuit().trim();
        if (proveedorRepository.existsByCuitAndDeletedAtIsNull(cuit)) {
            throw new BusinessException("Ya existe un proveedor con ese CUIT");
        }
        ProveedorFinanciero proveedor = ProveedorFinanciero.builder()
                .razonSocial(request.razonSocial().trim())
                .cuit(cuit)
                .condicionFiscal(request.condicionFiscal())
                .email(blankToNull(request.email()))
                .telefono(blankToNull(request.telefono()))
                .direccion(blankToNull(request.direccion()))
                .categoria(blankToNull(request.categoria()))
                .activo(request.activo() == null || request.activo())
                .build();
        return toProveedorResponse(proveedorRepository.save(proveedor));
    }

    @Override
    public ProveedorResponse actualizarProveedor(String id, ProveedorRequest request) {
        validateProveedor(request);
        ProveedorFinanciero proveedor = getProveedor(id);
        proveedor.setRazonSocial(request.razonSocial().trim());
        proveedor.setCuit(request.cuit().trim());
        proveedor.setCondicionFiscal(request.condicionFiscal());
        proveedor.setEmail(blankToNull(request.email()));
        proveedor.setTelefono(blankToNull(request.telefono()));
        proveedor.setDireccion(blankToNull(request.direccion()));
        proveedor.setCategoria(blankToNull(request.categoria()));
        proveedor.setActivo(request.activo() == null || request.activo());
        return toProveedorResponse(proveedorRepository.save(proveedor));
    }

    @Override
    public void eliminarProveedor(String id) {
        ProveedorFinanciero proveedor = getProveedor(id);
        proveedor.softDelete();
        proveedorRepository.save(proveedor);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CompraResponse> listarCompras(String search, EstadoCompra estado, LocalDate fechaDesde, LocalDate fechaHasta, int page, int size) {
        LocalDate desde = defaultDesde(fechaDesde);
        LocalDate hasta = defaultHasta(fechaHasta);
        validateRange(desde, hasta);
        return compraRepository.findFiltered(search, estado, desde, hasta, pageRequest(page, size)).map(this::toCompraResponse);
    }

    @Override
    public CompraResponse crearCompra(CompraRequest request) {
        if (request.items() == null || request.items().isEmpty()) {
            throw new BusinessException("La compra debe tener al menos un item");
        }
        ProveedorFinanciero proveedor = getProveedor(request.proveedorId());
        Operario operario = resolveOperario(request.operarioId());
        CompraProveedor compra = CompraProveedor.builder()
                .proveedor(proveedor)
                .operario(operario)
                .tipoComprobante(request.tipoComprobante() == null ? TipoComprobanteCompra.FACTURA_A : request.tipoComprobante())
                .numeroComprobante(request.numeroComprobante() == null || request.numeroComprobante().isBlank() ? "SIN-NUMERO" : request.numeroComprobante().trim())
                .fechaEmision(request.fechaEmision() == null ? LocalDate.now() : request.fechaEmision())
                .fechaVencimiento(request.fechaVencimiento() == null ? LocalDate.now().plusDays(15) : request.fechaVencimiento())
                .estado(EstadoCompra.REGISTRADA)
                .observaciones(blankToNull(request.observaciones()))
                .build();
        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal iva = BigDecimal.ZERO;
        for (CompraItemRequest itemRequest : request.items()) {
            CompraProveedorItem item = buildItem(compra, itemRequest);
            compra.getItems().add(item);
            subtotal = subtotal.add(item.getSubtotal());
            iva = iva.add(item.getSubtotal().multiply(item.getIvaPorcentaje()).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP));
        }
        compra.setSubtotal(subtotal);
        compra.setIva(iva);
        compra.setTotal(subtotal.add(iva));
        compra.setSaldoPendiente(compra.getTotal());
        return toCompraResponse(compraRepository.save(compra));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PagoProveedorResponse> listarPagos(int page, int size) {
        return pagoRepository.findByDeletedAtIsNullOrderByFechaDesc(pageRequest(page, size)).map(this::toPagoResponse);
    }

    @Override
    public PagoProveedorResponse registrarPago(PagoProveedorRequest request) {
        CompraProveedor compra = getCompra(request.compraId());
        if (request.importe() == null || request.importe().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("El importe del pago debe ser mayor a cero");
        }
        Operario operario = resolveOperario(request.operarioId());
        PagoProveedor pago = PagoProveedor.builder()
                .compra(compra)
                .operario(operario)
                .fecha(request.fecha() == null ? LocalDate.now() : request.fecha())
                .metodoPago(request.metodoPago() == null ? MetodoPago.TRANSFERENCIA : request.metodoPago())
                .importe(request.importe())
                .referencia(blankToNull(request.referencia()))
                .observaciones(blankToNull(request.observaciones()))
                .build();
        compra.setSaldoPendiente(compra.getSaldoPendiente().subtract(request.importe()).max(BigDecimal.ZERO));
        compra.setEstado(compra.getSaldoPendiente().compareTo(BigDecimal.ZERO) == 0 ? EstadoCompra.PAGADA : EstadoCompra.PARCIAL);
        compraRepository.save(compra);
        return toPagoResponse(pagoRepository.save(pago));
    }

    private CompraProveedorItem buildItem(CompraProveedor compra, CompraItemRequest request) {
        if (request.descripcion() == null || request.descripcion().isBlank()) throw new BusinessException("La descripcion del item es obligatoria");
        BigDecimal cantidad = request.cantidad() == null ? BigDecimal.ZERO : request.cantidad();
        BigDecimal precio = request.precioUnitario() == null ? BigDecimal.ZERO : request.precioUnitario();
        if (cantidad.compareTo(BigDecimal.ZERO) <= 0 || precio.compareTo(BigDecimal.ZERO) < 0) throw new BusinessException("Cantidad o precio invalido");
        InsumoAgricola insumo = request.insumoId() == null || request.insumoId().isBlank() ? null : insumoRepository.findByIdAndDeletedAtIsNull(request.insumoId()).orElseThrow(() -> new ResourceNotFoundException("Insumo no encontrado"));
        BigDecimal iva = request.ivaPorcentaje() == null ? BigDecimal.valueOf(21) : request.ivaPorcentaje();
        return CompraProveedorItem.builder()
                .compra(compra)
                .insumo(insumo)
                .descripcion(request.descripcion().trim())
                .cantidad(cantidad)
                .unidad(request.unidad() == null || request.unidad().isBlank() ? "UN" : request.unidad().trim())
                .precioUnitario(precio)
                .ivaPorcentaje(iva)
                .subtotal(cantidad.multiply(precio).setScale(2, RoundingMode.HALF_UP))
                .build();
    }

    private void validateProveedor(ProveedorRequest request) {
        if (request.razonSocial() == null || request.razonSocial().isBlank()) throw new BusinessException("La razon social es obligatoria");
        if (request.cuit() == null || request.cuit().isBlank()) throw new BusinessException("El CUIT es obligatorio");
        if (request.condicionFiscal() == null) throw new BusinessException("La condicion fiscal es obligatoria");
    }

    private ProveedorFinanciero getProveedor(String id) { return proveedorRepository.findByIdAndDeletedAtIsNull(id).orElseThrow(() -> new ResourceNotFoundException("Proveedor no encontrado")); }
    private CompraProveedor getCompra(String id) { return compraRepository.findByIdAndDeletedAtIsNull(id).orElseThrow(() -> new ResourceNotFoundException("Compra no encontrada")); }
    private Operario resolveOperario(String id) { return id == null || id.isBlank() ? null : operarioRepository.findActiveById(id).orElseThrow(() -> new ResourceNotFoundException("Operario no encontrado")); }
    private PageRequest pageRequest(int page, int size) { return PageRequest.of(Math.max(0, page), Math.max(1, Math.min(size, 100))); }
    private void validateRange(LocalDate desde, LocalDate hasta) { if (hasta.isBefore(desde)) throw new BusinessException("La fecha hasta no puede ser anterior a la fecha desde"); }
    private LocalDate defaultDesde(LocalDate value) { return value == null ? LocalDate.now().withDayOfMonth(1) : value; }
    private LocalDate defaultHasta(LocalDate value) { return value == null ? LocalDate.now() : value; }
    private String blankToNull(String value) { return value == null || value.isBlank() ? null : value.trim(); }
    private String nombreCompleto(Operario o) { return o == null ? null : (o.getNombre() + " " + o.getApellido()).trim(); }

    private ProveedorResponse toProveedorResponse(ProveedorFinanciero p) { return new ProveedorResponse(p.getId(), p.getRazonSocial(), p.getCuit(), p.getCondicionFiscal(), p.getEmail(), p.getTelefono(), p.getDireccion(), p.getCategoria(), p.getActivo(), p.getCreatedAt(), p.getUpdatedAt()); }
    private CompraItemResponse toItemResponse(CompraProveedorItem i) { return new CompraItemResponse(i.getId(), i.getInsumo() == null ? null : i.getInsumo().getId(), i.getInsumo() == null ? null : i.getInsumo().getNombre(), i.getDescripcion(), i.getCantidad(), i.getUnidad(), i.getPrecioUnitario(), i.getIvaPorcentaje(), i.getSubtotal()); }
    private CompraResponse toCompraResponse(CompraProveedor c) { return new CompraResponse(c.getId(), c.getProveedor().getId(), c.getProveedor().getRazonSocial(), c.getProveedor().getCuit(), c.getOperario() == null ? null : c.getOperario().getId(), nombreCompleto(c.getOperario()), c.getTipoComprobante(), c.getNumeroComprobante(), c.getFechaEmision(), c.getFechaVencimiento(), c.getEstado(), c.getSubtotal(), c.getIva(), c.getTotal(), c.getSaldoPendiente(), c.getObservaciones(), c.getItems().stream().map(this::toItemResponse).toList(), c.getCreatedAt()); }
    private PagoProveedorResponse toPagoResponse(PagoProveedor p) { return new PagoProveedorResponse(p.getId(), p.getCompra().getId(), p.getCompra().getNumeroComprobante(), p.getCompra().getProveedor().getRazonSocial(), p.getOperario() == null ? null : p.getOperario().getId(), nombreCompleto(p.getOperario()), p.getFecha(), p.getMetodoPago(), p.getImporte(), p.getReferencia(), p.getObservaciones(), p.getCreatedAt()); }
}
