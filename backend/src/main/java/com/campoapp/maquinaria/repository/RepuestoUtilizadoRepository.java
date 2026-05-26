package com.campoapp.maquinaria.repository;

import com.campoapp.maquinaria.entity.RepuestoUtilizado;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RepuestoUtilizadoRepository extends JpaRepository<RepuestoUtilizado, String> {
    List<RepuestoUtilizado> findByIntervencionIdAndDeletedAtIsNullOrderByDescripcionAsc(String intervencionId);
}
