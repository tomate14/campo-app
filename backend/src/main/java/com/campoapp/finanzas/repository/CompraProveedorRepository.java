package com.campoapp.finanzas.repository;

import com.campoapp.finanzas.entity.CompraProveedor;
import com.campoapp.finanzas.entity.EstadoCompra;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface CompraProveedorRepository extends JpaRepository<CompraProveedor, String> {
    Optional<CompraProveedor> findByIdAndDeletedAtIsNull(String id);
    long countByDeletedAtIsNull();
    long countByDeletedAtIsNullAndEstado(EstadoCompra estado);

    @Query(value = "select coalesce(sum(total), 0) from finanzas_compras where deleted_at is null and fecha_emision between :desde and :hasta and estado <> 'ANULADA'", nativeQuery = true)
    BigDecimal comprasEntre(@Param("desde") LocalDate desde, @Param("hasta") LocalDate hasta);

    @Query(value = "select coalesce(sum(saldo_pendiente), 0) from finanzas_compras where deleted_at is null and fecha_emision between :desde and :hasta and estado not in ('PAGADA', 'ANULADA')", nativeQuery = true)
    BigDecimal cuentasPorPagarEntre(@Param("desde") LocalDate desde, @Param("hasta") LocalDate hasta);

    @Query(value = """
        select date_format(fecha_emision, '%Y-%m') as periodo, coalesce(sum(total), 0) as total
        from finanzas_compras
        where deleted_at is null and estado <> 'ANULADA' and fecha_emision between :desde and :hasta
        group by date_format(fecha_emision, '%Y-%m')
        order by periodo
        """, nativeQuery = true)
    List<Object[]> comprasPorPeriodo(@Param("desde") LocalDate desde, @Param("hasta") LocalDate hasta);

    @Query(value = """
        select p.razon_social, count(c.id), coalesce(sum(c.total), 0)
        from finanzas_compras c
        join finanzas_proveedores p on p.id = c.proveedor_id
        where c.deleted_at is null and c.estado <> 'ANULADA' and c.fecha_emision between :desde and :hasta
        group by p.id, p.razon_social
        order by coalesce(sum(c.total), 0) desc
        limit :limit
        """, nativeQuery = true)
    List<Object[]> topProveedores(@Param("desde") LocalDate desde, @Param("hasta") LocalDate hasta, @Param("limit") int limit);

    @Query(value = """
        select p.razon_social, c.numero_comprobante, c.fecha_vencimiento, c.saldo_pendiente, c.estado
        from finanzas_compras c
        join finanzas_proveedores p on p.id = c.proveedor_id
        where c.deleted_at is null and c.estado not in ('PAGADA', 'ANULADA') and c.saldo_pendiente > 0
        order by c.fecha_vencimiento asc, c.saldo_pendiente desc
        limit :limit
        """, nativeQuery = true)
    List<Object[]> cuentasPorPagarPendientes(@Param("limit") int limit);

    @Query(value = """
        select count(*)
        from finanzas_compras
        where deleted_at is null and estado not in ('PAGADA', 'ANULADA') and fecha_vencimiento between :desde and :hasta
        """, nativeQuery = true)
    long vencimientosPendientesEntre(@Param("desde") LocalDate desde, @Param("hasta") LocalDate hasta);

    @Query("""
        select c from CompraProveedor c
        where c.deletedAt is null
          and (:estado is null or c.estado = :estado)
          and (:fechaDesde is null or c.fechaEmision >= :fechaDesde)
          and (:fechaHasta is null or c.fechaEmision <= :fechaHasta)
          and (:search is null or :search = ''
            or lower(c.proveedor.razonSocial) like lower(concat('%', :search, '%'))
            or c.numeroComprobante like concat('%', :search, '%'))
        order by c.fechaEmision desc, c.createdAt desc
        """)
    Page<CompraProveedor> findFiltered(@Param("search") String search,
                                       @Param("estado") EstadoCompra estado,
                                       @Param("fechaDesde") LocalDate fechaDesde,
                                       @Param("fechaHasta") LocalDate fechaHasta,
                                       Pageable pageable);
}
