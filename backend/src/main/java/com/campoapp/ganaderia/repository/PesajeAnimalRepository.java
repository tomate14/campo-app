package com.campoapp.ganaderia.repository;

import com.campoapp.ganaderia.entity.PesajeAnimal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface PesajeAnimalRepository extends JpaRepository<PesajeAnimal, String> {
    @Query("""
            SELECT p FROM PesajeAnimal p
            JOIN FETCH p.animal
            WHERE p.deletedAt IS NULL
              AND (:animalId IS NULL OR p.animal.id = :animalId)
              AND (:desde IS NULL OR p.fecha >= :desde)
              AND (:hasta IS NULL OR p.fecha <= :hasta)
            ORDER BY p.fecha DESC, p.updatedAt DESC
            """)
    List<PesajeAnimal> findFiltered(@Param("animalId") String animalId, @Param("desde") LocalDate desde, @Param("hasta") LocalDate hasta);

    List<PesajeAnimal> findByAnimalIdAndDeletedAtIsNullOrderByFechaDesc(String animalId);
}
