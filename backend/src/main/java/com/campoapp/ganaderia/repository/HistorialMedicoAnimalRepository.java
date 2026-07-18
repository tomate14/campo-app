package com.campoapp.ganaderia.repository;

import com.campoapp.ganaderia.entity.HistorialMedicoAnimal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface HistorialMedicoAnimalRepository extends JpaRepository<HistorialMedicoAnimal, String> {

    @Query("""
            SELECT h FROM HistorialMedicoAnimal h
            JOIN FETCH h.animal a
            WHERE h.deletedAt IS NULL
              AND a.deletedAt IS NULL
              AND a.id = :animalId
            ORDER BY h.fecha DESC
            """)
    List<HistorialMedicoAnimal> findByAnimalId(@Param("animalId") String animalId);

    // Listado bulk para replica offline: animalId opcional con el patron (:param IS NULL OR ...).
    @Query("""
            SELECT h FROM HistorialMedicoAnimal h
            JOIN FETCH h.animal a
            WHERE h.deletedAt IS NULL
              AND a.deletedAt IS NULL
              AND (:animalId IS NULL OR a.id = :animalId)
            ORDER BY h.fecha DESC
            """)
    List<HistorialMedicoAnimal> findFiltered(@Param("animalId") String animalId);
}
