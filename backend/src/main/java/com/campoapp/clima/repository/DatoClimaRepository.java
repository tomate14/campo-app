package com.campoapp.clima.repository;

import com.campoapp.clima.entity.DatoClima;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface DatoClimaRepository extends JpaRepository<DatoClima, String> {

    @Query("SELECT d FROM DatoClima d WHERE d.lote.id = :loteId AND d.deletedAt IS NULL ORDER BY d.timestampUtc DESC LIMIT 1")
    Optional<DatoClima> findUltimoByLoteId(@Param("loteId") String loteId);

    @Query("SELECT d FROM DatoClima d WHERE d.lote.id = :loteId AND d.deletedAt IS NULL ORDER BY d.timestampUtc DESC")
    List<DatoClima> findByLoteIdOrderByTimestampDesc(@Param("loteId") String loteId);

    @Query("SELECT d FROM DatoClima d WHERE d.lote.id = :loteId AND d.timestampUtc >= :desde AND d.deletedAt IS NULL ORDER BY d.timestampUtc ASC")
    List<DatoClima> findHistorico(@Param("loteId") String loteId, @Param("desde") LocalDateTime desde);

    @Modifying
    @Query("UPDATE DatoClima d SET d.deletedAt = CURRENT_TIMESTAMP WHERE d.lote.id = :loteId AND d.timestampUtc < :corte AND d.deletedAt IS NULL")
    int purgarAntiguos(@Param("loteId") String loteId, @Param("corte") LocalDateTime corte);

    @Query("SELECT COALESCE(SUM(d.precipitacionesMm), 0) FROM DatoClima d WHERE d.lote.id = :loteId AND d.deletedAt IS NULL AND d.timestampUtc BETWEEN :desde AND :hasta")
    BigDecimal sumarPrecipitaciones(@Param("loteId") String loteId, @Param("desde") LocalDateTime desde, @Param("hasta") LocalDateTime hasta);
}
