package com.campoapp.ganaderia.repository;

import com.campoapp.ganaderia.entity.Inseminacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;

public interface InseminacionRepository extends JpaRepository<Inseminacion, String> {
    @Query("""
            SELECT i FROM Inseminacion i
            JOIN FETCH i.vaca
            WHERE i.deletedAt IS NULL
              AND (:desde IS NULL OR i.fecha >= :desde)
              AND (:hasta IS NULL OR i.fecha <= :hasta)
            ORDER BY i.fecha DESC
            """)
    List<Inseminacion> findFiltered(LocalDate desde, LocalDate hasta);

    long countByDeletedAtIsNull();
}
