package com.campoapp.demo;

import com.campoapp.finanzas.entity.ClienteFinanciero;
import com.campoapp.finanzas.entity.CompraProveedor;
import com.campoapp.finanzas.entity.CompraProveedorItem;
import com.campoapp.finanzas.entity.EstadoCompra;
import com.campoapp.finanzas.entity.EstadoFactura;
import com.campoapp.finanzas.entity.EstadoFiscalAfip;
import com.campoapp.finanzas.entity.FacturaVenta;
import com.campoapp.finanzas.entity.FacturaVentaItem;
import com.campoapp.finanzas.entity.ProveedorFinanciero;
import com.campoapp.finanzas.entity.TipoClienteFiscal;
import com.campoapp.finanzas.entity.TipoComprobante;
import com.campoapp.finanzas.entity.TipoComprobanteCompra;
import com.campoapp.finanzas.repository.ClienteFinancieroRepository;
import com.campoapp.finanzas.repository.CompraProveedorRepository;
import com.campoapp.finanzas.repository.FacturaVentaRepository;
import com.campoapp.finanzas.repository.ProveedorFinancieroRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;

/**
 * Seeder de finanzas demo (feature 76).
 *
 * Puebla las pantallas de facturacion y compras: 3 proveedores, 2 clientes,
 * 3 facturas de venta (con items y estados EMITIDA/PARCIAL/COBRADA) y 2 compras a
 * proveedores. Los importes se calculan de forma coherente (subtotal + IVA 21% =
 * total; saldoPendiente segun estado). Corre en orden 80: los operarios (8) ya
 * existen pero se dejan sin asignar en factura/compra por ser opcionales.
 */
@Component
@RequiredArgsConstructor
public class FinanzasDemoSeeder implements DemoSeeder {

    private static final BigDecimal IVA_PORC = new BigDecimal("21.00");

    private final ProveedorFinancieroRepository proveedorRepository;
    private final ClienteFinancieroRepository clienteRepository;
    private final FacturaVentaRepository facturaRepository;
    private final CompraProveedorRepository compraRepository;

    @Override
    public int orden() {
        return 80;
    }

    @Override
    public String nombre() {
        return "finanzas";
    }

    @Override
    @Transactional
    public int sembrar() {
        int creados = 0;

        // --- Proveedores ---
        creados += crearProveedor("demo-prov-1", "Agroinsumos del Sur S.A.", "30711223344",
                TipoClienteFiscal.RESPONSABLE_INSCRIPTO, "ventas@agroinsumos.com", "Insumos");
        creados += crearProveedor("demo-prov-2", "Combustibles La Pampa S.R.L.", "30655443322",
                TipoClienteFiscal.RESPONSABLE_INSCRIPTO, "pedidos@combustibleslp.com", "Combustible");
        creados += crearProveedor("demo-prov-3", "Repuestos El Tractor", "20284556677",
                TipoClienteFiscal.MONOTRIBUTO, "eltractor@mail.com", "Repuestos");

        // --- Clientes ---
        creados += crearCliente("demo-cli-1", "Acopio Cerealero Central S.A.", "30712334455",
                TipoClienteFiscal.RESPONSABLE_INSCRIPTO, "compras@acopiocentral.com");
        creados += crearCliente("demo-cli-2", "Molinos del Litoral S.A.", "30698877665",
                TipoClienteFiscal.RESPONSABLE_INSCRIPTO, "administracion@molinoslitoral.com");

        // --- Facturas de venta ---
        // Factura 1: EMITIDA, saldo completo pendiente.
        creados += crearFactura("demo-fact-1", "demo-cli-1", TipoComprobante.FACTURA_A, "0001", "00000001",
                LocalDate.now().minusDays(20), EstadoFactura.EMITIDA,
                "demo-fitem-1", "Venta de soja a granel", new BigDecimal("15.000"), "TN", new BigDecimal("240000.00"),
                true);
        // Factura 2: PARCIAL, la mitad del saldo pendiente.
        creados += crearFactura("demo-fact-2", "demo-cli-2", TipoComprobante.FACTURA_A, "0001", "00000002",
                LocalDate.now().minusDays(12), EstadoFactura.PARCIAL,
                "demo-fitem-2", "Venta de trigo a granel", new BigDecimal("22.000"), "TN", new BigDecimal("180000.00"),
                true);
        // Factura 3: COBRADA, saldo cero.
        creados += crearFactura("demo-fact-3", "demo-cli-1", TipoComprobante.FACTURA_B, "0001", "00000003",
                LocalDate.now().minusDays(5), EstadoFactura.COBRADA,
                "demo-fitem-3", "Venta de maiz a granel", new BigDecimal("18.000"), "TN", new BigDecimal("160000.00"),
                false);

        // --- Compras a proveedores ---
        // Compra 1: REGISTRADA, saldo pendiente completo.
        creados += crearCompra("demo-compra-1", "demo-prov-1", TipoComprobanteCompra.FACTURA_A, "0002-00001234",
                LocalDate.now().minusDays(15), EstadoCompra.REGISTRADA,
                "demo-citem-1", "Herbicida glifosato 20 L", new BigDecimal("40.000"), "BIDON", new BigDecimal("8500.00"),
                true);
        // Compra 2: PAGADA, saldo cero.
        creados += crearCompra("demo-compra-2", "demo-prov-2", TipoComprobanteCompra.FACTURA_A, "0005-00007788",
                LocalDate.now().minusDays(8), EstadoCompra.PAGADA,
                "demo-citem-2", "Gasoil grado 2", new BigDecimal("2000.000"), "LTS", new BigDecimal("950.00"),
                false);

        return creados;
    }

    private int crearProveedor(String id, String razonSocial, String cuit,
                               TipoClienteFiscal condicion, String email, String categoria) {
        if (proveedorRepository.existsById(id)) {
            return 0;
        }
        ProveedorFinanciero proveedor = ProveedorFinanciero.builder()
                .razonSocial(razonSocial)
                .cuit(cuit)
                .condicionFiscal(condicion)
                .email(email)
                .categoria(categoria)
                .activo(true)
                .build();
        proveedor.setId(id);
        proveedorRepository.save(proveedor);
        return 1;
    }

    private int crearCliente(String id, String razonSocial, String cuit,
                             TipoClienteFiscal condicion, String email) {
        if (clienteRepository.existsById(id)) {
            return 0;
        }
        ClienteFinanciero cliente = ClienteFinanciero.builder()
                .razonSocial(razonSocial)
                .cuit(cuit)
                .condicionFiscal(condicion)
                .email(email)
                .activo(true)
                .build();
        cliente.setId(id);
        clienteRepository.save(cliente);
        return 1;
    }

    private int crearFactura(String facturaId, String clienteId, TipoComprobante tipo, String puntoVenta,
                             String numero, LocalDate fechaEmision, EstadoFactura estado,
                             String itemId, String itemDescripcion, BigDecimal cantidad, String unidad,
                             BigDecimal precioUnitario, boolean conSaldo) {
        if (facturaRepository.existsById(facturaId)) {
            return 0;
        }
        // El cliente es @ManyToOne obligatorio: lo cargamos por su id fijo.
        ClienteFinanciero cliente = clienteRepository.findById(clienteId).orElse(null);
        if (cliente == null) {
            return 0;
        }

        BigDecimal subtotal = cantidad.multiply(precioUnitario).setScale(2, RoundingMode.HALF_UP);
        BigDecimal iva = subtotal.multiply(IVA_PORC).movePointLeft(2).setScale(2, RoundingMode.HALF_UP);
        BigDecimal total = subtotal.add(iva);
        BigDecimal saldo = calcularSaldo(estado, total, conSaldo);

        FacturaVenta factura = FacturaVenta.builder()
                .cliente(cliente)
                .tipoComprobante(tipo)
                .puntoVenta(puntoVenta)
                .numeroComprobante(numero)
                .fechaEmision(fechaEmision)
                .fechaVencimiento(fechaEmision.plusDays(30))
                .estado(estado)
                .estadoFiscal(EstadoFiscalAfip.CAE_SIMULADO)
                .cae("70000000000001")
                .caeVencimiento(fechaEmision.plusDays(40))
                .subtotal(subtotal)
                .iva(iva)
                .total(total)
                .saldoPendiente(saldo)
                .build();
        factura.setId(facturaId);

        FacturaVentaItem item = FacturaVentaItem.builder()
                .factura(factura)
                .descripcion(itemDescripcion)
                .cantidad(cantidad)
                .unidad(unidad)
                .precioUnitario(precioUnitario)
                .ivaPorcentaje(IVA_PORC)
                .subtotal(subtotal)
                .build();
        item.setId(itemId);
        factura.getItems().add(item);

        facturaRepository.save(factura);
        return 1;
    }

    private int crearCompra(String compraId, String proveedorId, TipoComprobanteCompra tipo, String numero,
                            LocalDate fechaEmision, EstadoCompra estado,
                            String itemId, String itemDescripcion, BigDecimal cantidad, String unidad,
                            BigDecimal precioUnitario, boolean conSaldo) {
        if (compraRepository.existsById(compraId)) {
            return 0;
        }
        // El proveedor es @ManyToOne obligatorio: lo cargamos por su id fijo.
        ProveedorFinanciero proveedor = proveedorRepository.findById(proveedorId).orElse(null);
        if (proveedor == null) {
            return 0;
        }

        BigDecimal subtotal = cantidad.multiply(precioUnitario).setScale(2, RoundingMode.HALF_UP);
        BigDecimal iva = subtotal.multiply(IVA_PORC).movePointLeft(2).setScale(2, RoundingMode.HALF_UP);
        BigDecimal total = subtotal.add(iva);
        BigDecimal saldo = conSaldo ? total : BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);

        CompraProveedor compra = CompraProveedor.builder()
                .proveedor(proveedor)
                .tipoComprobante(tipo)
                .numeroComprobante(numero)
                .fechaEmision(fechaEmision)
                .fechaVencimiento(fechaEmision.plusDays(30))
                .estado(estado)
                .subtotal(subtotal)
                .iva(iva)
                .total(total)
                .saldoPendiente(saldo)
                .build();
        compra.setId(compraId);

        CompraProveedorItem item = CompraProveedorItem.builder()
                .compra(compra)
                .descripcion(itemDescripcion)
                .cantidad(cantidad)
                .unidad(unidad)
                .precioUnitario(precioUnitario)
                .ivaPorcentaje(IVA_PORC)
                .subtotal(subtotal)
                .build();
        item.setId(itemId);
        compra.getItems().add(item);

        compraRepository.save(compra);
        return 1;
    }

    /** Saldo pendiente coherente con el estado: COBRADA=0, PARCIAL=mitad, resto=total. */
    private BigDecimal calcularSaldo(EstadoFactura estado, BigDecimal total, boolean conSaldo) {
        if (estado == EstadoFactura.COBRADA || !conSaldo) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }
        if (estado == EstadoFactura.PARCIAL) {
            return total.divide(new BigDecimal("2"), 2, RoundingMode.HALF_UP);
        }
        return total;
    }
}
