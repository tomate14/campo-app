package com.campoapp.utilidades.repository;

import com.campoapp.utilidades.entity.UtilidadOpcion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UtilidadOpcionRepository extends JpaRepository<UtilidadOpcion, String> {

    // Orden alfabetico por valor (regla del apartado Utilidades).
    List<UtilidadOpcion> findByCategoriaAndActivoTrueAndDeletedAtIsNullOrderByValorAsc(String categoria);

    boolean existsByCategoriaAndValorAndDeletedAtIsNull(String categoria, String valor);

    @Query("SELECT o FROM UtilidadOpcion o WHERE o.id = :id AND o.deletedAt IS NULL")
    Optional<UtilidadOpcion> findActiveById(@Param("id") String id);

    // Devuelve el maximo orden vigente de la categoria; null si no hay opciones activas.
    @Query("SELECT MAX(o.orden) FROM UtilidadOpcion o WHERE o.categoria = :categoria AND o.deletedAt IS NULL")
    Integer findMaxOrden(@Param("categoria") String categoria);
}
