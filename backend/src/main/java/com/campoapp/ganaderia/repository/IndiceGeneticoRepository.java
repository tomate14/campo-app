package com.campoapp.ganaderia.repository;

import com.campoapp.ganaderia.entity.IndiceGenetico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface IndiceGeneticoRepository extends JpaRepository<IndiceGenetico, String> {
    @Query("""
            SELECT i FROM IndiceGenetico i
            JOIN FETCH i.animal
            WHERE i.deletedAt IS NULL
            ORDER BY i.fechaEvaluacion DESC
            """)
    List<IndiceGenetico> findAllActive();

    @Query("""
            SELECT i FROM IndiceGenetico i
            JOIN FETCH i.animal
            WHERE i.deletedAt IS NULL
              AND i.animal.id = :animalId
            ORDER BY i.fechaEvaluacion DESC
            """)
    List<IndiceGenetico> findByAnimal(String animalId);

    default Optional<IndiceGenetico> findLatestByAnimal(String animalId) {
        return findByAnimal(animalId).stream().findFirst();
    }
}
