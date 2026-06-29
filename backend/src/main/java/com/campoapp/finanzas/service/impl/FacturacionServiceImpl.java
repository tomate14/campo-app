package com.campoapp.finanzas.service.impl;

import com.campoapp.agricultura.entity.insumos.InsumoAgricola;
import com.campoapp.agricultura.repository.insumos.InsumoAgricolaRepository;
import com.campoapp.common.exception.BusinessException;
import com.campoapp.common.exception.ResourceNotFoundException;
import com.campoapp.finanzas.dto.*;
import com.campoapp.finanzas.entity.*;
import com.campoapp.finanzas.repository.*;
import com.campoapp.finanzas.service.FacturacionService;
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
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class FacturacionServiceImpl implements FacturacionService {
    private final ClienteFinancieroRepository clienteRepository;
    private final FacturaVentaRepository facturaRepository;
    private final CobroVentaRepository cobroRepository;
    private final NotaCreditoVentaRepository notaRepository;
    private final InsumoAgricolaRepository insumoRepository;
    private final OperarioRepository operarioRepository;

    @Override
    @Transactional(readOnly = true)
    public FacturacionDashboardResponse dashboard(LocalDate fechaDesde, LocalDate fechaHasta) {
        LocalDate desde = defaultDesde(fechaDesde);
        LocalDate hasta = defaultHasta(fechaHasta);
        if (hasta.isBefore(desde)) {
            throw new BusinessException("La fecha hasta no puede ser anterior a la fecha desde");
        }
        return new FacturacionDashboardResponse(
                clienteRepository.countByDeletedAtIsNullAndActivoTrue(),
                facturaRepository.countByDeletedAtIsNull(),
                facturaRepository.ventasEntre(desde, hasta),
                facturaRepository.cuentasPorCobrarEntre(desde, hasta),
                cobroRepository.cobrosEntre(desde, hasta),
                facturaRepository.countByDeletedAtIsNullAndEstado(EstadoFactura.VENCIDA)
        );
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ClienteResponse> listarClientes(String search, int page, int size) {
        return clienteRepository.findFiltered(search, PageRequest.of(page, size)).map(this::toClienteResponse);
    }

    @Override
    public ClienteResponse crearCliente(ClienteRequest request) {
        validateCliente(request);
        if (clienteRepository.existsByCuitAndDeletedAtIsNull(request.cuit().trim())) {
            throw new BusinessException("Ya existe un cliente con ese CUIT");
        }
        ClienteFinanciero cliente = ClienteFinanciero.builder()
                .razonSocial(request.razonSocial().trim())
                .cuit(request.cuit().trim())
                .condicionFiscal(request.condicionFiscal())
                .email(blankToNull(request.email()))
                .telefono(blankToNull(request.telefono()))
                .direccion(blankToNull(request.direccion()))
                .activo(request.activo() == null || request.activo())
                .build();
        return toClienteResponse(clienteRepository.save(cliente));
    }

    @Override
    public ClienteResponse actualizarCliente(String id, ClienteRequest request) {
        validateCliente(request);
        ClienteFinanciero cliente = getCliente(id);
        cliente.setRazonSocial(request.razonSocial().trim());
        cliente.setCuit(request.cuit().trim());
        cliente.setCondicionFiscal(request.condicionFiscal());
        cliente.setEmail(blankToNull(request.email()));
        cliente.setTelefono(blankToNull(request.telefono()));
        cliente.setDireccion(blankToNull(request.direccion()));
        cliente.setActivo(request.activo() == null || request.activo());
        return toClienteResponse(clienteRepository.save(cliente));
    }

    @Override
    public void eliminarCliente(String id) {
        ClienteFinanciero cliente = getCliente(id);
        cliente.softDelete();
        clienteRepository.save(cliente);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<FacturaResponse> listarFacturas(String search, EstadoFactura estado, LocalDate fechaDesde, LocalDate fechaHasta, int page, int size) {
        LocalDate desde = defaultDesde(fechaDesde);
        LocalDate hasta = defaultHasta(fechaHasta);
        if (hasta.isBefore(desde)) {
            throw new BusinessException("La fecha hasta no puede ser anterior a la fecha desde");
        }
        return facturaRepository.findFiltered(search, estado, desde, hasta, PageRequest.of(page, size)).map(this::toFacturaResponse);
    }

    @Override
    public FacturaResponse crearFactura(FacturaRequest request) {
        if (request.items() == null || request.items().isEmpty()) {
            throw new BusinessException("La factura debe tener al menos un item");
        }
        ClienteFinanciero cliente = getCliente(request.clienteId());
        Operario operario = resolveOperario(request.operarioId());
        String puntoVenta = request.puntoVenta() == null || request.puntoVenta().isBlank() ? "0001" : request.puntoVenta().trim();
        String numero = String.format("%08d", facturaRepository.maxNumeroByPuntoVenta(puntoVenta) + 1);
        FacturaVenta factura = FacturaVenta.builder()
                .cliente(cliente)
                .operario(operario)
                .tipoComprobante(request.tipoComprobante() == null ? TipoComprobante.FACTURA_B : request.tipoComprobante())
                .puntoVenta(puntoVenta)
                .numeroComprobante(numero)
                .fechaEmision(request.fechaEmision() == null ? LocalDate.now() : request.fechaEmision())
                .fechaVencimiento(request.fechaVencimiento() == null ? LocalDate.now().plusDays(15) : request.fechaVencimiento())
                .estado(EstadoFactura.EMITIDA)
                .estadoFiscal(EstadoFiscalAfip.CAE_SIMULADO)
                .cae(generarCae())
                .caeVencimiento(LocalDate.now().plusDays(10))
                .observaciones(blankToNull(request.observaciones()))
                .build();
        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal iva = BigDecimal.ZERO;
        for (FacturaItemRequest itemRequest : request.items()) {
            FacturaVentaItem item = buildItem(factura, itemRequest);
            factura.getItems().add(item);
            subtotal = subtotal.add(item.getSubtotal());
            iva = iva.add(item.getSubtotal().multiply(item.getIvaPorcentaje()).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP));
        }
        factura.setSubtotal(subtotal);
        factura.setIva(iva);
        factura.setTotal(subtotal.add(iva));
        factura.setSaldoPendiente(factura.getTotal());
        return toFacturaResponse(facturaRepository.save(factura));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CobroResponse> listarCobros(int page, int size) {
        return cobroRepository.findByDeletedAtIsNullOrderByFechaDesc(PageRequest.of(page, size)).map(this::toCobroResponse);
    }

    @Override
    public CobroResponse registrarCobro(CobroRequest request) {
        FacturaVenta factura = getFactura(request.facturaId());
        if (request.importe() == null || request.importe().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("El importe del cobro debe ser mayor a cero");
        }
        Operario operario = resolveOperario(request.operarioId());
        CobroVenta cobro = CobroVenta.builder()
                .factura(factura)
                .operario(operario)
                .fecha(request.fecha() == null ? LocalDate.now() : request.fecha())
                .metodoPago(request.metodoPago() == null ? MetodoPago.TRANSFERENCIA : request.metodoPago())
                .importe(request.importe())
                .referencia(blankToNull(request.referencia()))
                .observaciones(blankToNull(request.observaciones()))
                .build();
        factura.setSaldoPendiente(factura.getSaldoPendiente().subtract(request.importe()).max(BigDecimal.ZERO));
        factura.setEstado(factura.getSaldoPendiente().compareTo(BigDecimal.ZERO) == 0 ? EstadoFactura.COBRADA : EstadoFactura.PARCIAL);
        facturaRepository.save(factura);
        return toCobroResponse(cobroRepository.save(cobro));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<NotaCreditoResponse> listarNotasCredito(int page, int size) {
        return notaRepository.findByDeletedAtIsNullOrderByFechaDesc(PageRequest.of(page, size)).map(this::toNotaResponse);
    }

    @Override
    public NotaCreditoResponse registrarNotaCredito(NotaCreditoRequest request) {
        FacturaVenta factura = getFactura(request.facturaId());
        if (request.importe() == null || request.importe().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("El importe de la nota de credito debe ser mayor a cero");
        }
        Operario operario = resolveOperario(request.operarioId());
        NotaCreditoVenta nota = NotaCreditoVenta.builder()
                .factura(factura)
                .operario(operario)
                .fecha(request.fecha() == null ? LocalDate.now() : request.fecha())
                .importe(request.importe())
                .motivo(request.motivo() == null || request.motivo().isBlank() ? "Ajuste comercial" : request.motivo().trim())
                .cae(generarCae())
                .build();
        factura.setSaldoPendiente(factura.getSaldoPendiente().subtract(request.importe()).max(BigDecimal.ZERO));
        factura.setEstado(factura.getSaldoPendiente().compareTo(BigDecimal.ZERO) == 0 ? EstadoFactura.COBRADA : EstadoFactura.PARCIAL);
        facturaRepository.save(factura);
        return toNotaResponse(notaRepository.save(nota));
    }

    private FacturaVentaItem buildItem(FacturaVenta factura, FacturaItemRequest request) {
        if (request.descripcion() == null || request.descripcion().isBlank()) throw new BusinessException("La descripcion del item es obligatoria");
        BigDecimal cantidad = request.cantidad() == null ? BigDecimal.ZERO : request.cantidad();
        BigDecimal precio = request.precioUnitario() == null ? BigDecimal.ZERO : request.precioUnitario();
        if (cantidad.compareTo(BigDecimal.ZERO) <= 0 || precio.compareTo(BigDecimal.ZERO) < 0) throw new BusinessException("Cantidad o precio invalido");
        InsumoAgricola insumo = request.insumoId() == null || request.insumoId().isBlank() ? null : insumoRepository.findByIdAndDeletedAtIsNull(request.insumoId()).orElseThrow(() -> new ResourceNotFoundException("Insumo no encontrado"));
        BigDecimal iva = request.ivaPorcentaje() == null ? BigDecimal.valueOf(21) : request.ivaPorcentaje();
        return FacturaVentaItem.builder()
                .factura(factura).insumo(insumo).descripcion(request.descripcion().trim())
                .cantidad(cantidad).unidad(request.unidad() == null || request.unidad().isBlank() ? "UN" : request.unidad().trim())
                .precioUnitario(precio).ivaPorcentaje(iva).subtotal(cantidad.multiply(precio).setScale(2, RoundingMode.HALF_UP)).build();
    }

    private void validateCliente(ClienteRequest request) {
        if (request.razonSocial() == null || request.razonSocial().isBlank()) throw new BusinessException("La razon social es obligatoria");
        if (request.cuit() == null || request.cuit().isBlank()) throw new BusinessException("El CUIT es obligatorio");
        if (request.condicionFiscal() == null) throw new BusinessException("La condicion fiscal es obligatoria");
    }

    private ClienteFinanciero getCliente(String id) { return clienteRepository.findByIdAndDeletedAtIsNull(id).orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado")); }
    private FacturaVenta getFactura(String id) { return facturaRepository.findByIdAndDeletedAtIsNull(id).orElseThrow(() -> new ResourceNotFoundException("Factura no encontrada")); }
    private Operario resolveOperario(String id) { return id == null || id.isBlank() ? null : operarioRepository.findActiveById(id).orElseThrow(() -> new ResourceNotFoundException("Operario no encontrado")); }
    private String blankToNull(String value) { return value == null || value.isBlank() ? null : value.trim(); }
    private LocalDate defaultDesde(LocalDate value) { return value == null ? LocalDate.now().withDayOfMonth(1) : value; }
    private LocalDate defaultHasta(LocalDate value) { return value == null ? LocalDate.now() : value; }
    private String generarCae() { return String.valueOf(System.currentTimeMillis()).substring(1, 13); }
    private String nombreCompleto(Operario o) { return o == null ? null : (o.getNombre() + " " + o.getApellido()).trim(); }
    private String comprobante(FacturaVenta f) { return f.getPuntoVenta() + "-" + f.getNumeroComprobante(); }

    private ClienteResponse toClienteResponse(ClienteFinanciero c) { return new ClienteResponse(c.getId(), c.getRazonSocial(), c.getCuit(), c.getCondicionFiscal(), c.getEmail(), c.getTelefono(), c.getDireccion(), c.getActivo(), c.getCreatedAt(), c.getUpdatedAt()); }
    private FacturaItemResponse toItemResponse(FacturaVentaItem i) { return new FacturaItemResponse(i.getId(), i.getInsumo() == null ? null : i.getInsumo().getId(), i.getInsumo() == null ? null : i.getInsumo().getNombre(), i.getDescripcion(), i.getCantidad(), i.getUnidad(), i.getPrecioUnitario(), i.getIvaPorcentaje(), i.getSubtotal()); }
    private FacturaResponse toFacturaResponse(FacturaVenta f) { return new FacturaResponse(f.getId(), f.getCliente().getId(), f.getCliente().getRazonSocial(), f.getCliente().getCuit(), f.getOperario() == null ? null : f.getOperario().getId(), nombreCompleto(f.getOperario()), f.getTipoComprobante(), f.getPuntoVenta(), f.getNumeroComprobante(), f.getFechaEmision(), f.getFechaVencimiento(), f.getEstado(), f.getEstadoFiscal(), f.getCae(), f.getCaeVencimiento(), f.getSubtotal(), f.getIva(), f.getTotal(), f.getSaldoPendiente(), f.getObservaciones(), f.getItems().stream().map(this::toItemResponse).toList(), f.getCreatedAt()); }
    private CobroResponse toCobroResponse(CobroVenta c) { return new CobroResponse(c.getId(), c.getFactura().getId(), comprobante(c.getFactura()), c.getFactura().getCliente().getRazonSocial(), c.getOperario() == null ? null : c.getOperario().getId(), nombreCompleto(c.getOperario()), c.getFecha(), c.getMetodoPago(), c.getImporte(), c.getReferencia(), c.getObservaciones(), c.getCreatedAt()); }
    private NotaCreditoResponse toNotaResponse(NotaCreditoVenta n) { return new NotaCreditoResponse(n.getId(), n.getFactura().getId(), comprobante(n.getFactura()), n.getFactura().getCliente().getRazonSocial(), n.getOperario() == null ? null : n.getOperario().getId(), nombreCompleto(n.getOperario()), n.getFecha(), n.getImporte(), n.getMotivo(), n.getCae(), n.getCreatedAt()); }
}
