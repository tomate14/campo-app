package com.campoapp.agricultura.repository;

import com.campoapp.agricultura.entity.HistoricoCultivo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface HistoricoCultivoRepository extends JpaRepository<HistoricoCultivo, String> {

    @Query("SELECT h FROM HistoricoCultivo h WHERE h.lote.id = :loteId AND h.deletedAt IS NULL ORDER BY h.temporada DESC, h.fechaSiembra DESC")
    List<HistoricoCultivo> findByLoteId(@Param("loteId") String loteId);

    @Query("SELECT h FROM HistoricoCultivo h WHERE h.id = :id AND h.deletedAt IS NULL")
    Optional<HistoricoCultivo> findActiveById(@Param("id") String id);

    @Query("SELECT h FROM HistoricoCultivo h WHERE h.lote.id = :loteId AND h.deletedAt IS NULL ORDER BY h.temporada DESC, h.fechaSiembra DESC LIMIT 1")
    Optional<HistoricoCultivo> findUltimoCultivo(@Param("loteId") String loteId);

    @Query("SELECT DISTINCT h.cultivo FROM HistoricoCultivo h WHERE h.lote.id = :loteId AND h.deletedAt IS NULL ORDER BY h.cultivo")
    List<String> findCultivosDistintos(@Param("loteId") String loteId);

    @Query("SELECT COUNT(h) FROM HistoricoCultivo h WHERE h.lote.id = :loteId AND h.deletedAt IS NULL")
    long countByLoteId(@Param("loteId") String loteId);

    @Query("SELECT AVG(h.rendimientoKgHa) FROM HistoricoCultivo h WHERE h.lote.id = :loteId AND h.deletedAt IS NULL AND h.rendimientoKgHa IS NOT NULL")
    Double calcularRendimientoPromedio(@Param("loteId") String loteId);
}
