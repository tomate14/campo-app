package com.campoapp.operarios.repository;

import com.campoapp.operarios.entity.OrdenTrabajoHistorial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface OrdenTrabajoHistorialRepository extends JpaRepository<OrdenTrabajoHistorial, String> {

    @Query("select h from OrdenTrabajoHistorial h where h.deletedAt is null and h.orden.id = :ordenId order by h.createdAt desc")
    List<OrdenTrabajoHistorial> findByOrden(@Param("ordenId") String ordenId);
}
