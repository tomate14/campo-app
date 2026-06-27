package com.campoapp.agricultura.repository.insumos;

import com.campoapp.agricultura.entity.insumos.StockInsumoAgricola;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface StockInsumoAgricolaRepository extends JpaRepository<StockInsumoAgricola, String> {
    Optional<StockInsumoAgricola> findByIdAndDeletedAtIsNull(String id);
    List<StockInsumoAgricola> findByInsumoIdAndDeletedAtIsNullOrderByFechaVencimientoAsc(String insumoId);
    Page<StockInsumoAgricola> findByDeletedAtIsNullOrderByFechaVencimientoAsc(Pageable pageable);

    @Query("select coalesce(sum(s.cantidadDisponible), 0) from StockInsumoAgricola s where s.deletedAt is null and s.insumo.id = :insumoId")
    BigDecimal totalByInsumoId(@Param("insumoId") String insumoId);

    @Query("""
        select s from StockInsumoAgricola s
        where s.deletedAt is null
          and s.fechaVencimiento is not null
          and s.fechaVencimiento <= :hasta
          and s.cantidadDisponible > 0
        order by s.fechaVencimiento asc
        """)
    List<StockInsumoAgricola> vencimientosHasta(@Param("hasta") LocalDate hasta);

    @Query("""
        select s from StockInsumoAgricola s
        where s.deletedAt is null
          and s.fechaVencimiento is not null
          and s.fechaVencimiento <= :hasta
          and s.cantidadDisponible > 0
        order by s.fechaVencimiento asc
        """)
    Page<StockInsumoAgricola> vencimientosHasta(@Param("hasta") LocalDate hasta, Pageable pageable);

    @Query("""
        select s from StockInsumoAgricola s
        where s.deletedAt is null and s.cantidadDisponible > 0
        order by s.insumo.nombre asc, s.fechaVencimiento asc
        """)
    List<StockInsumoAgricola> findAvailable();
}
