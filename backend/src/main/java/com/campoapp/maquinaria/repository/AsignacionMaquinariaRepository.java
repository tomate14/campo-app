package com.campoapp.maquinaria.repository;

import com.campoapp.maquinaria.entity.AsignacionMaquinaria;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AsignacionMaquinariaRepository extends JpaRepository<AsignacionMaquinaria, String> {
    List<AsignacionMaquinaria> findByMaquinariaIdAndDeletedAtIsNullOrderByFechaInicioDesc(String maquinariaId);
    long countByFechaFinIsNullAndDeletedAtIsNull();
}
