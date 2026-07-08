package com.campoapp.finanzas.repository;

import com.campoapp.finanzas.entity.EstadoFactura;
import com.campoapp.finanzas.entity.FacturaVenta;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface FacturaVentaRepository extends JpaRepository<FacturaVenta, String> {
    Optional<FacturaVenta> findByIdAndDeletedAtIsNull(String id);
    long countByDeletedAtIsNull();
    long countByDeletedAtIsNullAndEstado(EstadoFactura estado);

    @Query(value = "select coalesce(max(cast(numero_comprobante as unsigned)), 0) from finanzas_facturas where deleted_at is null and punto_venta = :puntoVenta", nativeQuery = true)
    Integer maxNumeroByPuntoVenta(@Param("puntoVenta") String puntoVenta);

    @Query(value = "select coalesce(sum(total), 0) from finanzas_facturas where deleted_at is null and fecha_emision between :desde and :hasta and estado <> 'ANULADA'", nativeQuery = true)
    BigDecimal ventasEntre(@Param("desde") LocalDate desde, @Param("hasta") LocalDate hasta);

    @Query(value = "select coalesce(sum(saldo_pendiente), 0) from finanzas_facturas where deleted_at is null and estado not in ('COBRADA', 'ANULADA')", nativeQuery = true)
    BigDecimal cuentasPorCobrar();

    @Query(value = "select coalesce(sum(saldo_pendiente), 0) from finanzas_facturas where deleted_at is null and fecha_emision between :desde and :hasta and estado not in ('COBRADA', 'ANULADA')", nativeQuery = true)
    BigDecimal cuentasPorCobrarEntre(@Param("desde") LocalDate desde, @Param("hasta") LocalDate hasta);

    @Query(value = """
        select date_format(fecha_emision, '%Y-%m') as periodo, coalesce(sum(total), 0) as total
        from finanzas_facturas
        where deleted_at is null and estado <> 'ANULADA' and fecha_emision between :desde and :hasta
        group by date_format(fecha_emision, '%Y-%m')
        order by periodo
        """, nativeQuery = true)
    List<Object[]> ventasPorPeriodo(@Param("desde") LocalDate desde, @Param("hasta") LocalDate hasta);

    @Query(value = """
        select c.razon_social, count(f.id), coalesce(sum(f.total), 0)
        from finanzas_facturas f
        join finanzas_clientes c on c.id = f.cliente_id
        where f.deleted_at is null and f.estado <> 'ANULADA' and f.fecha_emision between :desde and :hasta
        group by c.id, c.razon_social
        order by coalesce(sum(f.total), 0) desc
        limit :limit
        """, nativeQuery = true)
    List<Object[]> topClientes(@Param("desde") LocalDate desde, @Param("hasta") LocalDate hasta, @Param("limit") int limit);

    @Query(value = """
        select c.razon_social, concat(f.punto_venta, '-', f.numero_comprobante), f.fecha_vencimiento, f.saldo_pendiente, f.estado
        from finanzas_facturas f
        join finanzas_clientes c on c.id = f.cliente_id
        where f.deleted_at is null and f.estado not in ('COBRADA', 'ANULADA') and f.saldo_pendiente > 0
        order by f.fecha_vencimiento asc, f.saldo_pendiente desc
        limit :limit
        """, nativeQuery = true)
    List<Object[]> cuentasPorCobrarPendientes(@Param("limit") int limit);

    @Query(value = """
        select count(*)
        from finanzas_facturas
        where deleted_at is null and estado not in ('COBRADA', 'ANULADA') and fecha_vencimiento between :desde and :hasta
        """, nativeQuery = true)
    long vencimientosPendientesEntre(@Param("desde") LocalDate desde, @Param("hasta") LocalDate hasta);

    @Query("""
        select f from FacturaVenta f
        where f.deletedAt is null
          and (:estado is null or f.estado = :estado)
          and (:fechaDesde is null or f.fechaEmision >= :fechaDesde)
          and (:fechaHasta is null or f.fechaEmision <= :fechaHasta)
          and (:search is null or :search = ''
            or lower(f.cliente.razonSocial) like lower(concat('%', :search, '%'))
            or f.numeroComprobante like concat('%', :search, '%'))
        order by f.fechaEmision desc, f.createdAt desc
        """)
    Page<FacturaVenta> findFiltered(@Param("search") String search,
                                    @Param("estado") EstadoFactura estado,
                                    @Param("fechaDesde") LocalDate fechaDesde,
                                    @Param("fechaHasta") LocalDate fechaHasta,
                                    Pageable pageable);
}
