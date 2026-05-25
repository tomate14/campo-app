package com.campoapp.ganaderia.repository;

import com.campoapp.ganaderia.entity.Monta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;

public interface MontaRepository extends JpaRepository<Monta, String> {
    @Query("""
            SELECT m FROM Monta m
            JOIN FETCH m.vaca
            JOIN FETCH m.toro
            WHERE m.deletedAt IS NULL
              AND (:desde IS NULL OR m.fecha >= :desde)
              AND (:hasta IS NULL OR m.fecha <= :hasta)
            ORDER BY m.fecha DESC
            """)
    List<Monta> findFiltered(LocalDate desde, LocalDate hasta);

    long countByDeletedAtIsNull();
}
