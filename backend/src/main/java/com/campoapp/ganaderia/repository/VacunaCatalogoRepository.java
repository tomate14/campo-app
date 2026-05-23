package com.campoapp.ganaderia.repository;

import com.campoapp.ganaderia.entity.VacunaCatalogo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface VacunaCatalogoRepository extends JpaRepository<VacunaCatalogo, String> {
    List<VacunaCatalogo> findByDeletedAtIsNullOrderByNombreAsc();
    List<VacunaCatalogo> findByDeletedAtIsNullAndObligatoriaOrderByNombreAsc(Boolean obligatoria);
    Optional<VacunaCatalogo> findByIdAndDeletedAtIsNull(String id);
    boolean existsByCodigoAndDeletedAtIsNull(String codigo);
    boolean existsByCodigoAndIdNotAndDeletedAtIsNull(String codigo, String id);
}
