package com.campoapp.ganaderia.repository;

import com.campoapp.ganaderia.entity.CatalogoRazaBovina;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CatalogoRazaBovinaRepository extends JpaRepository<CatalogoRazaBovina, String> {

    @Query("""
            SELECT r FROM CatalogoRazaBovina r
            WHERE r.deletedAt IS NULL
              AND r.activo = true
            ORDER BY r.nombre ASC
            """)
    List<CatalogoRazaBovina> findAllActive();

    Optional<CatalogoRazaBovina> findByIdAndDeletedAtIsNullAndActivoTrue(String id);

    @Query("""
            SELECT r FROM CatalogoRazaBovina r
            WHERE r.deletedAt IS NULL
              AND r.activo = true
              AND (
                LOWER(r.nombre) LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(r.codigo) LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(r.aptitud) LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(r.tipoGenetico) LIKE LOWER(CONCAT('%', :search, '%'))
              )
            ORDER BY r.nombre ASC
            """)
    List<CatalogoRazaBovina> search(@Param("search") String search);
}
