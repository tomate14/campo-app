package com.campoapp.ganaderia.repository;

import com.campoapp.ganaderia.entity.MovimientoAnimal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MovimientoAnimalRepository extends JpaRepository<MovimientoAnimal, String> {

    @Query("""
            SELECT m FROM MovimientoAnimal m
            JOIN FETCH m.animal a
            WHERE m.deletedAt IS NULL
              AND a.deletedAt IS NULL
              AND a.id = :animalId
            ORDER BY m.fecha DESC
            """)
    List<MovimientoAnimal> findByAnimalId(@Param("animalId") String animalId);
}
