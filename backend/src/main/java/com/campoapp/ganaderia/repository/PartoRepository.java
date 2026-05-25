package com.campoapp.ganaderia.repository;

import com.campoapp.ganaderia.entity.Parto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;

public interface PartoRepository extends JpaRepository<Parto, String> {
    @Query("""
            SELECT p FROM Parto p
            JOIN FETCH p.madre
            LEFT JOIN FETCH p.ternero
            WHERE p.deletedAt IS NULL
              AND (:desde IS NULL OR p.fecha >= :desde)
              AND (:hasta IS NULL OR p.fecha <= :hasta)
            ORDER BY p.fecha DESC
            """)
    List<Parto> findFiltered(LocalDate desde, LocalDate hasta);
}
