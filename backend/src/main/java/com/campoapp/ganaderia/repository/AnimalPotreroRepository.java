package com.campoapp.ganaderia.repository;

import com.campoapp.ganaderia.entity.AnimalPotrero;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface AnimalPotreroRepository extends JpaRepository<AnimalPotrero, String> {

    @Query("""
            SELECT ap FROM AnimalPotrero ap
            JOIN FETCH ap.animal
            JOIN FETCH ap.potrero
            WHERE ap.deletedAt IS NULL
              AND ap.activo = true
              AND ap.animal.id = :animalId
            """)
    Optional<AnimalPotrero> findActiveByAnimalId(@Param("animalId") String animalId);

    @Query("""
            SELECT ap FROM AnimalPotrero ap
            JOIN FETCH ap.animal
            JOIN FETCH ap.potrero
            WHERE ap.deletedAt IS NULL
              AND ap.activo = true
              AND ap.animal.id IN :animalIds
            """)
    List<AnimalPotrero> findActiveByAnimalIds(@Param("animalIds") Collection<String> animalIds);

    @Query("""
            SELECT ap FROM AnimalPotrero ap
            JOIN FETCH ap.animal
            JOIN FETCH ap.potrero
            WHERE ap.deletedAt IS NULL
              AND ap.activo = true
            """)
    List<AnimalPotrero> findAllActiveWithPotrero();
}
