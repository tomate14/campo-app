package com.campoapp.maquinaria.repository;

import com.campoapp.maquinaria.entity.MantenimientoProgramado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface MantenimientoProgramadoRepository extends JpaRepository<MantenimientoProgramado, String> {
    Optional<MantenimientoProgramado> findByIdAndDeletedAtIsNull(String id);

    @Query("""
        select distinct m from MantenimientoProgramado m
        join fetch m.maquinaria
        left join fetch m.plan
        where m.deletedAt is null
          and (:maquinariaId is null or m.maquinaria.id = :maquinariaId)
          and (:estado is null or m.estado = :estado)
        order by m.fechaProgramada asc
    """)
    List<MantenimientoProgramado> findFiltered(String maquinariaId, String estado);

    long countByEstadoAndDeletedAtIsNull(String estado);
    long countByEstadoAndFechaProgramadaBeforeAndDeletedAtIsNull(String estado, LocalDate fecha);
}
