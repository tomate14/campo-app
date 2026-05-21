package com.campoapp.clima.repository;

import com.campoapp.clima.entity.Pronostico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface PronosticoRepository extends JpaRepository<Pronostico, String> {

    @Query("SELECT p FROM Pronostico p WHERE p.lote.id = :loteId AND p.fecha >= :desde AND p.deletedAt IS NULL ORDER BY p.fecha ASC")
    List<Pronostico> findByLoteIdDesde(@Param("loteId") String loteId, @Param("desde") LocalDate desde);

    @Modifying
    @Query("DELETE FROM Pronostico p WHERE p.lote.id = :loteId")
    void deleteByLoteId(@Param("loteId") String loteId);
}
