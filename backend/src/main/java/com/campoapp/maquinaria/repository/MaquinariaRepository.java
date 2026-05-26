package com.campoapp.maquinaria.repository;

import com.campoapp.maquinaria.entity.Maquinaria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface MaquinariaRepository extends JpaRepository<Maquinaria, String> {
    Optional<Maquinaria> findByIdAndDeletedAtIsNull(String id);
    Optional<Maquinaria> findByCodigoAndDeletedAtIsNull(String codigo);

    @Query("""
        select m from Maquinaria m
        where m.deletedAt is null
          and (:tipo is null or upper(m.tipo) like upper(concat('%', :tipo, '%')))
          and (:estado is null or m.estado = :estado)
          and (:ubicacion is null or upper(m.ubicacionActual) like upper(concat('%', :ubicacion, '%')))
        order by m.updatedAt desc
    """)
    List<Maquinaria> findFiltered(String tipo, String estado, String ubicacion);
}
