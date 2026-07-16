package com.campoapp.ganaderia.repository;

import com.campoapp.ganaderia.entity.AlertaPotrero;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface AlertaPotreroRepository extends JpaRepository<AlertaPotrero, String> {

    @Query("SELECT a FROM AlertaPotrero a WHERE a.id = :id AND a.deletedAt IS NULL")
    Optional<AlertaPotrero> findActiveById(@Param("id") String id);

    @Query("""
            SELECT a FROM AlertaPotrero a
            WHERE a.deletedAt IS NULL
              AND (:potreroId IS NULL OR a.potrero.id = :potreroId)
              AND (:estado IS NULL OR a.estado = :estado)
            ORDER BY a.fecha DESC, a.createdAt DESC
            """)
    List<AlertaPotrero> search(@Param("potreroId") String potreroId, @Param("estado") String estado);
}
