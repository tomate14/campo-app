package com.campoapp.maquinaria.repository;

import com.campoapp.maquinaria.entity.PlanMantenimiento;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PlanMantenimientoRepository extends JpaRepository<PlanMantenimiento, String> {
    Optional<PlanMantenimiento> findByIdAndDeletedAtIsNull(String id);
    List<PlanMantenimiento> findByDeletedAtIsNullOrderByUpdatedAtDesc();
    List<PlanMantenimiento> findByActivoTrueAndDeletedAtIsNullOrderByNombreAsc();
}
