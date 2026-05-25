package com.campoapp.ganaderia.repository;

import com.campoapp.ganaderia.entity.ControlPrenez;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;

public interface ControlPrenezRepository extends JpaRepository<ControlPrenez, String> {
    @Query("""
            SELECT c FROM ControlPrenez c
            JOIN FETCH c.vaca
            WHERE c.deletedAt IS NULL
              AND (:estado IS NULL OR c.estado = :estado)
            ORDER BY c.fechaDiagnostico DESC
            """)
    List<ControlPrenez> findFiltered(String estado);

    @Query("""
            SELECT c FROM ControlPrenez c
            JOIN FETCH c.vaca
            WHERE c.deletedAt IS NULL
              AND c.estado = 'PRENADA'
              AND c.fechaEstimadaParto IS NOT NULL
              AND c.fechaEstimadaParto <= :hasta
            ORDER BY c.fechaEstimadaParto ASC
            """)
    List<ControlPrenez> findUpcomingBirths(LocalDate hasta);
}
