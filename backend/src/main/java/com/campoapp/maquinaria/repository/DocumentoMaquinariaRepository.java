package com.campoapp.maquinaria.repository;

import com.campoapp.maquinaria.entity.DocumentoMaquinaria;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface DocumentoMaquinariaRepository extends JpaRepository<DocumentoMaquinaria, String> {
    List<DocumentoMaquinaria> findByMaquinariaIdAndDeletedAtIsNullOrderByVencimientoAsc(String maquinariaId);
    long countByVencimientoBeforeAndDeletedAtIsNull(LocalDate fecha);
}
