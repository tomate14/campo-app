package com.campoapp.ganaderia.repository;

import com.campoapp.ganaderia.entity.Animal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
              AND (:estado IS NULL OR a.estado = :estado)
            ORDER BY a.updatedAt DESC
            """)
    List<Animal> findFiltered(
            @Param("caravana") String caravana,
            @Param("raza") String raza,
            @Param("estado") String estado
    );

    /**
     * Listado paginado de animales activos con filtros opcionales.
     * El filtro por potrero resuelve la asignacion activa en animales_potreros,
     * el mismo origen que usa la respuesta para potreroId/potreroNombre.
     * Orden estable por caravana e id para que la paginacion sea deterministica.
     */
    @Query(value = """
            SELECT a FROM Animal a
            LEFT JOIN FETCH a.madre
            LEFT JOIN FETCH a.padre
            WHERE a.deletedAt IS NULL
              AND (:caravana IS NULL OR LOWER(a.caravana) LIKE LOWER(CONCAT('%', :caravana, '%')))
              AND (:estado IS NULL OR a.estado = :estado)
              AND (:potreroId IS NULL OR EXISTS (
                  SELECT ap.id FROM AnimalPotrero ap
                  WHERE ap.deletedAt IS NULL
                    AND ap.activo = true
                    AND ap.animal.id = a.id
                    AND ap.potrero.id = :potreroId
              ))
            ORDER BY a.caravana ASC, a.id ASC
            """,
            countQuery = """
            SELECT COUNT(a) FROM Animal a
            WHERE a.deletedAt IS NULL
              AND (:caravana IS NULL OR LOWER(a.caravana) LIKE LOWER(CONCAT('%', :caravana, '%')))
              AND (:estado IS NULL OR a.estado = :estado)
              AND (:potreroId IS NULL OR EXISTS (
                  SELECT ap.id FROM AnimalPotrero ap
                  WHERE ap.deletedAt IS NULL
                    AND ap.activo = true
                    AND ap.animal.id = a.id
                    AND ap.potrero.id = :potreroId
              ))
            """)
    Page<Animal> findFilteredPage(
            @Param("caravana") String caravana,
            @Param("potreroId") String potreroId,
            @Param("estado") String estado,
            Pageable pageable
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
