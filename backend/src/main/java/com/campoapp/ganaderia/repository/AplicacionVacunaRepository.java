package com.campoapp.ganaderia.repository;

import com.campoapp.ganaderia.entity.AplicacionVacuna;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;

public interface AplicacionVacunaRepository extends JpaRepository<AplicacionVacuna, String> {
    @Query("""
            select a from AplicacionVacuna a
            where a.deletedAt is null
              and (:animalId is null or a.animal.id = :animalId)
              and (:vacunaId is null or a.vacuna.id = :vacunaId)
              and (:desde is null or a.fechaAplicacion >= :desde)
              and (:hasta is null or a.fechaAplicacion <= :hasta)
            order by a.fechaAplicacion desc, a.createdAt desc
            """)
    List<AplicacionVacuna> findFiltered(String animalId, String vacunaId, LocalDate desde, LocalDate hasta);

    @Query("""
            select a from AplicacionVacuna a
            where a.deletedAt is null
              and a.proximaDosisFecha is not null
              and a.proximaDosisFecha <= :hasta
            order by a.proximaDosisFecha asc
            """)
    List<AplicacionVacuna> findUpcomingAlerts(LocalDate hasta);
}
