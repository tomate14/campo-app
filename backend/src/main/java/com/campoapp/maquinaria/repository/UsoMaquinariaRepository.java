package com.campoapp.maquinaria.repository;

import com.campoapp.maquinaria.entity.UsoMaquinaria;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UsoMaquinariaRepository extends JpaRepository<UsoMaquinaria, String> {
    List<UsoMaquinaria> findByMaquinariaIdAndDeletedAtIsNullOrderByFechaDesc(String maquinariaId);
    List<UsoMaquinaria> findByDeletedAtIsNullOrderByFechaDesc();
}
