package com.campoapp.agricultura.repository.plagas;

import com.campoapp.agricultura.entity.plagas.AplicacionFitosanitaria;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AplicacionFitosanitariaRepository extends JpaRepository<AplicacionFitosanitaria, String> {
    @Query("SELECT a FROM AplicacionFitosanitaria a JOIN FETCH a.deteccion d JOIN FETCH a.lote WHERE a.deletedAt IS NULL ORDER BY a.fechaAplicacion DESC")
    List<AplicacionFitosanitaria> findAllActive();

    @Query(value = "SELECT a FROM AplicacionFitosanitaria a JOIN FETCH a.deteccion d JOIN FETCH a.lote WHERE a.deletedAt IS NULL ORDER BY a.fechaAplicacion DESC",
            countQuery = "SELECT COUNT(a) FROM AplicacionFitosanitaria a WHERE a.deletedAt IS NULL")
    Page<AplicacionFitosanitaria> findAllActive(Pageable pageable);

    @Query("SELECT COUNT(a) FROM AplicacionFitosanitaria a WHERE a.deletedAt IS NULL AND a.deteccion.id = :deteccionId")
    long countByDeteccionId(@Param("deteccionId") String deteccionId);
}
