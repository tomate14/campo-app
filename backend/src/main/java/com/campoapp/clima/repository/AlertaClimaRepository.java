package com.campoapp.clima.repository;

import com.campoapp.clima.entity.AlertaClima;
import com.campoapp.clima.entity.AlertaClima.TipoAlerta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface AlertaClimaRepository extends JpaRepository<AlertaClima, String> {

    @Query("SELECT a FROM AlertaClima a WHERE a.lote.id = :loteId AND a.activa = true AND a.deletedAt IS NULL ORDER BY a.fecha DESC")
    List<AlertaClima> findActivasByLoteId(@Param("loteId") String loteId);

    @Query("SELECT a FROM AlertaClima a WHERE a.lote.id = :loteId AND a.deletedAt IS NULL ORDER BY a.fecha DESC")
    List<AlertaClima> findAllByLoteId(@Param("loteId") String loteId);

    @Query("SELECT a FROM AlertaClima a WHERE a.id = :id AND a.deletedAt IS NULL")
    Optional<AlertaClima> findActiveById(@Param("id") String id);

    @Query("SELECT a FROM AlertaClima a WHERE a.lote.id = :loteId AND a.tipoAlerta = :tipo AND a.activa = true AND a.fecha >= :desde AND a.deletedAt IS NULL")
    List<AlertaClima> findActivaByTipoDesde(@Param("loteId") String loteId,
                                             @Param("tipo") TipoAlerta tipo,
                                             @Param("desde") LocalDateTime desde);
}
