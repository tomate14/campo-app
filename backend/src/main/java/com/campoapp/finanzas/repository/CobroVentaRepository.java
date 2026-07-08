package com.campoapp.finanzas.repository;

import com.campoapp.finanzas.entity.CobroVenta;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface CobroVentaRepository extends JpaRepository<CobroVenta, String> {
    Page<CobroVenta> findByDeletedAtIsNullOrderByFechaDesc(Pageable pageable);

    @Query("select coalesce(sum(c.importe), 0) from CobroVenta c where c.deletedAt is null and c.fecha between :desde and :hasta")
    BigDecimal cobrosEntre(@Param("desde") LocalDate desde, @Param("hasta") LocalDate hasta);

    @Query(value = """
        select date_format(fecha, '%Y-%m') as periodo, coalesce(sum(importe), 0) as total
        from finanzas_cobros
        where deleted_at is null and fecha between :desde and :hasta
        group by date_format(fecha, '%Y-%m')
        order by periodo
        """, nativeQuery = true)
    List<Object[]> cobrosPorPeriodo(@Param("desde") LocalDate desde, @Param("hasta") LocalDate hasta);
}
