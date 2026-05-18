package com.campoapp.agricultura.repository;

import com.campoapp.agricultura.entity.PropiedadSuelo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PropiedadSueloRepository extends JpaRepository<PropiedadSuelo, String> {

    @Query("SELECT p FROM PropiedadSuelo p WHERE p.lote.id = :loteId AND p.deletedAt IS NULL ORDER BY p.fecha DESC")
    List<PropiedadSuelo> findByLoteId(@Param("loteId") String loteId);

    @Query("SELECT p FROM PropiedadSuelo p WHERE p.id = :id AND p.deletedAt IS NULL")
    Optional<PropiedadSuelo> findActiveById(@Param("id") String id);

    @Query("SELECT p FROM PropiedadSuelo p WHERE p.lote.id = :loteId AND p.deletedAt IS NULL ORDER BY p.fecha DESC LIMIT 1")
    Optional<PropiedadSuelo> findUltimoAnalisis(@Param("loteId") String loteId);
}
