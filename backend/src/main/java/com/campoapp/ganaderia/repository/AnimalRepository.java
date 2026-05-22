package com.campoapp.ganaderia.repository;

import com.campoapp.ganaderia.entity.Animal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface AnimalRepository extends JpaRepository<Animal, String> {

    @Query("""
            SELECT a FROM Animal a
            LEFT JOIN FETCH a.madre
            LEFT JOIN FETCH a.padre
            WHERE a.deletedAt IS NULL
              AND (:caravana IS NULL OR LOWER(a.caravana) LIKE LOWER(CONCAT('%', :caravana, '%')))
              AND (:raza IS NULL OR LOWER(a.raza) LIKE LOWER(CONCAT('%', :raza, '%')))
              AND (:ubicacion IS NULL OR LOWER(a.ubicacionActual) LIKE LOWER(CONCAT('%', :ubicacion, '%')))
              AND (:estado IS NULL OR a.estado = :estado)
            ORDER BY a.updatedAt DESC
            """)
    List<Animal> findFiltered(
            @Param("caravana") String caravana,
            @Param("raza") String raza,
            @Param("ubicacion") String ubicacion,
            @Param("estado") String estado
    );

    @Query("""
            SELECT a FROM Animal a
            LEFT JOIN FETCH a.madre
            LEFT JOIN FETCH a.padre
            WHERE a.deletedAt IS NULL
              AND a.id = :id
            """)
    Optional<Animal> findActiveById(@Param("id") String id);

    boolean existsByCaravanaAndDeletedAtIsNull(String caravana);
    boolean existsByCaravanaAndIdNotAndDeletedAtIsNull(String caravana, String id);
}
