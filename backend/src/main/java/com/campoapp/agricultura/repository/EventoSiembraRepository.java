package com.campoapp.agricultura.repository;

import com.campoapp.agricultura.entity.EventoSiembra;
import com.campoapp.agricultura.entity.EventoSiembra.TipoEvento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface EventoSiembraRepository extends JpaRepository<EventoSiembra, String> {

    @Query("SELECT e FROM EventoSiembra e WHERE e.lote.id = :loteId AND e.deletedAt IS NULL ORDER BY e.fecha DESC")
    List<EventoSiembra> findByLoteId(@Param("loteId") String loteId);

    @Query("SELECT e FROM EventoSiembra e WHERE e.id = :id AND e.deletedAt IS NULL")
    Optional<EventoSiembra> findActiveById(@Param("id") String id);

    @Query("SELECT e FROM EventoSiembra e WHERE e.lote.id = :loteId AND e.tipoEvento = :tipo AND e.deletedAt IS NULL ORDER BY e.fecha DESC")
    List<EventoSiembra> findByLoteIdAndTipo(@Param("loteId") String loteId, @Param("tipo") TipoEvento tipo);

    @Query("SELECT e FROM EventoSiembra e WHERE e.fecha BETWEEN :desde AND :hasta AND e.deletedAt IS NULL ORDER BY e.fecha DESC")
    List<EventoSiembra> findByFechaBetween(@Param("desde") LocalDate desde, @Param("hasta") LocalDate hasta);
}
