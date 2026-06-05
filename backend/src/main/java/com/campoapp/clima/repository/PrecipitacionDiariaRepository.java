package com.campoapp.clima.repository;

import com.campoapp.clima.entity.PrecipitacionDiaria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface PrecipitacionDiariaRepository extends JpaRepository<PrecipitacionDiaria, String> {

    @Query("SELECT p FROM PrecipitacionDiaria p WHERE p.lote.id = :loteId AND p.fecha = :fecha")
    Optional<PrecipitacionDiaria> findByLoteIdAndFechaIncludingDeleted(@Param("loteId") String loteId, @Param("fecha") LocalDate fecha);

    @Query("SELECT p FROM PrecipitacionDiaria p WHERE p.lote.id = :loteId AND p.fecha BETWEEN :desde AND :hasta AND p.deletedAt IS NULL ORDER BY p.fecha ASC")
    List<PrecipitacionDiaria> findByLoteIdAndFechaBetween(@Param("loteId") String loteId,
                                                           @Param("desde") LocalDate desde,
                                                           @Param("hasta") LocalDate hasta);

    @Query("SELECT COALESCE(SUM(p.precipitacionMm), 0) FROM PrecipitacionDiaria p WHERE p.lote.id = :loteId AND p.fecha BETWEEN :desde AND :hasta AND p.deletedAt IS NULL")
    BigDecimal sumarPrecipitaciones(@Param("loteId") String loteId,
                                     @Param("desde") LocalDate desde,
                                     @Param("hasta") LocalDate hasta);

    @Query("SELECT COUNT(p) FROM PrecipitacionDiaria p WHERE p.lote.id = :loteId AND p.fecha BETWEEN :desde AND :hasta AND p.deletedAt IS NULL")
    long contarRegistros(@Param("loteId") String loteId,
                         @Param("desde") LocalDate desde,
                         @Param("hasta") LocalDate hasta);
}
