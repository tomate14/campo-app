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
import java.util.Optional;

public interface CompraProveedorRepository extends JpaRepository<CompraProveedor, String> {
    Optional<CompraProveedor> findByIdAndDeletedAtIsNull(String id);
    long countByDeletedAtIsNull();
    long countByDeletedAtIsNullAndEstado(EstadoCompra estado);

    @Query(value = "select coalesce(sum(total), 0) from finanzas_compras where deleted_at is null and fecha_emision between :desde and :hasta and estado <> 'ANULADA'", nativeQuery = true)
    BigDecimal comprasEntre(@Param("desde") LocalDate desde, @Param("hasta") LocalDate hasta);

    @Query(value = "select coalesce(sum(saldo_pendiente), 0) from finanzas_compras where deleted_at is null and fecha_emision between :desde and :hasta and estado not in ('PAGADA', 'ANULADA')", nativeQuery = true)
    BigDecimal cuentasPorPagarEntre(@Param("desde") LocalDate desde, @Param("hasta") LocalDate hasta);

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
