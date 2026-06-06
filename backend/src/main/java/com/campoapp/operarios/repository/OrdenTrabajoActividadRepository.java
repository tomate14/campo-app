package com.campoapp.operarios.repository;

import com.campoapp.operarios.entity.OrdenTrabajoActividad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface OrdenTrabajoActividadRepository extends JpaRepository<OrdenTrabajoActividad, String> {

    @Query("select a from OrdenTrabajoActividad a left join fetch a.operario where a.deletedAt is null and a.orden.id = :ordenId order by a.createdAt desc")
    List<OrdenTrabajoActividad> findByOrden(@Param("ordenId") String ordenId);

    long countByDeletedAtIsNull();
}
