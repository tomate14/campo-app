package com.campoapp.agricultura.repository.insumos;

import com.campoapp.agricultura.entity.insumos.MovimientoInsumoAgricola;
import com.campoapp.agricultura.entity.insumos.TipoMovimientoInsumo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

public interface MovimientoInsumoAgricolaRepository extends JpaRepository<MovimientoInsumoAgricola, String> {
    Page<MovimientoInsumoAgricola> findByDeletedAtIsNullOrderByFechaDesc(Pageable pageable);
    List<MovimientoInsumoAgricola> findTop8ByDeletedAtIsNullOrderByFechaDesc();
    List<MovimientoInsumoAgricola> findByInsumoIdAndDeletedAtIsNullOrderByFechaDesc(String insumoId);

    // Feature 84: idempotencia del movimiento generado al validar una orden de aplicacion.
    MovimientoInsumoAgricola findFirstByOrdenAplicacionIdAndDeletedAtIsNull(String ordenAplicacionId);

    // Feature 84: movimientos de salida/uso por conjunto de lotes y rango, para agregar el costo
    // de insumos aplicados por lote/periodo.
    @Query("""
            select m from MovimientoInsumoAgricola m
            where m.deletedAt is null
              and m.tipoMovimiento in :tipos
              and m.lote.id in :loteIds
              and m.fecha between :desde and :hasta
            """)
    List<MovimientoInsumoAgricola> findSalidasPorLotesYRango(@Param("tipos") Collection<TipoMovimientoInsumo> tipos,
                                                             @Param("loteIds") Collection<String> loteIds,
                                                             @Param("desde") LocalDateTime desde,
                                                             @Param("hasta") LocalDateTime hasta);
}
