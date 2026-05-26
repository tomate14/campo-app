package com.campoapp.maquinaria.repository;

import com.campoapp.maquinaria.entity.HistorialEstadoMaquinaria;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HistorialEstadoMaquinariaRepository extends JpaRepository<HistorialEstadoMaquinaria, String> {
    List<HistorialEstadoMaquinaria> findByMaquinariaIdAndDeletedAtIsNullOrderByFechaDesc(String maquinariaId);
}
