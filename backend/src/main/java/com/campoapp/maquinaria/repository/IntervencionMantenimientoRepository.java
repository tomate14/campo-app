package com.campoapp.maquinaria.repository;

import com.campoapp.maquinaria.entity.IntervencionMantenimiento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface IntervencionMantenimientoRepository extends JpaRepository<IntervencionMantenimiento, String> {
    Optional<IntervencionMantenimiento> findByIdAndDeletedAtIsNull(String id);

    @Query("""
        select i from IntervencionMantenimiento i
        where i.deletedAt is null
          and (:maquinariaId is null or i.maquinaria.id = :maquinariaId)
          and (:tipo is null or i.tipo = :tipo)
        order by i.fecha desc
    """)
    List<IntervencionMantenimiento> findFiltered(String maquinariaId, String tipo);

    List<IntervencionMantenimiento> findByDeletedAtIsNullOrderByFechaDesc();
    List<IntervencionMantenimiento> findByFechaBetweenAndDeletedAtIsNull(LocalDate desde, LocalDate hasta);
}
