package com.campoapp.agricultura.repository;

import com.campoapp.agricultura.entity.HistoricoCultivo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface AnalisisRepository extends JpaRepository<HistoricoCultivo, String> {

    @Query("""
            SELECT h FROM HistoricoCultivo h
            JOIN FETCH h.lote l
            WHERE h.deletedAt IS NULL
              AND l.deletedAt IS NULL
              AND (:loteId IS NULL OR l.id = :loteId)
              AND (:cultivo IS NULL OR h.cultivo = :cultivo)
              AND (:temporada IS NULL OR h.temporada = :temporada)
              AND (:desde IS NULL OR h.fechaSiembra >= :desde OR h.fechaCosecha >= :desde)
              AND (:hasta IS NULL OR h.fechaSiembra <= :hasta OR h.fechaCosecha <= :hasta)
            ORDER BY h.temporada ASC, h.fechaSiembra ASC
            """)
    List<HistoricoCultivo> findFiltered(
            @Param("loteId") String loteId,
            @Param("cultivo") String cultivo,
            @Param("temporada") String temporada,
            @Param("desde") LocalDate desde,
            @Param("hasta") LocalDate hasta
    );
}
