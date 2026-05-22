package com.campoapp.agricultura.repository;

import com.campoapp.agricultura.entity.RegistroCosecha;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface RendimientoRepository extends JpaRepository<RegistroCosecha, String> {

    @Query("""
            SELECT r FROM RegistroCosecha r
            JOIN FETCH r.lote l
            WHERE r.deletedAt IS NULL
              AND l.deletedAt IS NULL
              AND (:loteId IS NULL OR l.id = :loteId)
              AND (:cultivo IS NULL OR l.cultivo = :cultivo)
              AND (:temporada IS NULL OR l.temporada = :temporada)
              AND (:desde IS NULL OR r.fecha >= :desde)
              AND (:hasta IS NULL OR r.fecha <= :hasta)
            ORDER BY r.fecha ASC
            """)
    List<RegistroCosecha> findFiltered(
            @Param("loteId") String loteId,
            @Param("cultivo") String cultivo,
            @Param("temporada") String temporada,
            @Param("desde") LocalDate desde,
            @Param("hasta") LocalDate hasta
    );
}
