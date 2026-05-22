package com.campoapp.agricultura.repository;

import com.campoapp.agricultura.entity.RegistroCosecha;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface RegistroCosechaRepository extends JpaRepository<RegistroCosecha, String> {

    @Query("SELECT r FROM RegistroCosecha r WHERE r.lote.id = :loteId AND r.deletedAt IS NULL ORDER BY r.fecha DESC")
    List<RegistroCosecha> findByLoteId(@Param("loteId") String loteId);

    @Query("SELECT r FROM RegistroCosecha r WHERE r.id = :id AND r.deletedAt IS NULL")
    Optional<RegistroCosecha> findActiveById(@Param("id") String id);

    @Query("SELECT r FROM RegistroCosecha r WHERE r.lote.id = :loteId AND r.deletedAt IS NULL ORDER BY r.fecha DESC")
    List<RegistroCosecha> findByLoteIdOrderByFechaDesc(@Param("loteId") String loteId);

    @Query("SELECT AVG(r.rendimientoKgHa) FROM RegistroCosecha r WHERE r.lote.id = :loteId AND r.deletedAt IS NULL")
    Double calcularRendimientoPromedio(@Param("loteId") String loteId);

    @Query("SELECT COUNT(r) FROM RegistroCosecha r WHERE r.lote.id = :loteId AND r.deletedAt IS NULL")
    long countByLoteId(@Param("loteId") String loteId);
}
