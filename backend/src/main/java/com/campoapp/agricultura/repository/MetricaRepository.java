package com.campoapp.agricultura.repository;

import com.campoapp.clima.entity.DatoClima;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface MetricaRepository extends JpaRepository<DatoClima, String> {

    @Query("""
            SELECT d FROM DatoClima d
            JOIN FETCH d.lote l
            WHERE d.deletedAt IS NULL
              AND l.deletedAt IS NULL
              AND (:loteId IS NULL OR l.id = :loteId)
              AND (:cultivo IS NULL OR l.cultivo = :cultivo)
              AND (:temporada IS NULL OR l.temporada = :temporada)
              AND (:desde IS NULL OR d.timestampUtc >= :desde)
              AND (:hasta IS NULL OR d.timestampUtc <= :hasta)
            ORDER BY d.timestampUtc ASC
            """)
    List<DatoClima> findFiltered(
            @Param("loteId") String loteId,
            @Param("cultivo") String cultivo,
            @Param("temporada") String temporada,
            @Param("desde") LocalDateTime desde,
            @Param("hasta") LocalDateTime hasta
    );
}
