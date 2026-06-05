package com.campoapp.ganaderia.repository;

import com.campoapp.ganaderia.entity.Potrero;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface PotreroRepository extends JpaRepository<Potrero, String> {

    @Query("SELECT p FROM Potrero p WHERE p.deletedAt IS NULL ORDER BY p.nombre")
    List<Potrero> findAllActive();

    @Query("SELECT p FROM Potrero p WHERE p.id = :id AND p.deletedAt IS NULL")
    Optional<Potrero> findActiveById(@Param("id") String id);

    @Query("""
            SELECT p FROM Potrero p
            WHERE p.deletedAt IS NULL
              AND (:estado IS NULL OR p.estado = :estado)
              AND (:tipoUso IS NULL OR p.tipoUso = :tipoUso)
              AND (:nombre IS NULL OR LOWER(p.nombre) LIKE LOWER(CONCAT('%', :nombre, '%')))
              AND (:superficieMin IS NULL OR p.superficieHa >= :superficieMin)
              AND (:superficieMax IS NULL OR p.superficieHa <= :superficieMax)
            ORDER BY p.nombre
            """)
    List<Potrero> search(
            @Param("nombre") String nombre,
            @Param("estado") String estado,
            @Param("tipoUso") String tipoUso,
            @Param("superficieMin") BigDecimal superficieMin,
            @Param("superficieMax") BigDecimal superficieMax
    );
}
