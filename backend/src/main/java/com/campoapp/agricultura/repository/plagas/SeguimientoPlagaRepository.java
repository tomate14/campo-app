package com.campoapp.agricultura.repository.plagas;

import com.campoapp.agricultura.entity.plagas.SeguimientoPlaga;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SeguimientoPlagaRepository extends JpaRepository<SeguimientoPlaga, String> {
    @Query("SELECT s FROM SeguimientoPlaga s JOIN FETCH s.deteccion d JOIN FETCH d.lote JOIN FETCH d.catalogoPlaga WHERE s.deletedAt IS NULL ORDER BY s.fecha DESC")
    List<SeguimientoPlaga> findAllActive();

    @Query("SELECT s FROM SeguimientoPlaga s WHERE s.deletedAt IS NULL AND s.deteccion.id = :deteccionId ORDER BY s.fecha DESC")
    List<SeguimientoPlaga> findByDeteccionId(@Param("deteccionId") String deteccionId);
}
