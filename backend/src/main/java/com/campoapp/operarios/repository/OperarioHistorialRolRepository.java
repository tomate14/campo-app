package com.campoapp.operarios.repository;

import com.campoapp.operarios.entity.OperarioHistorialRol;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface OperarioHistorialRolRepository extends JpaRepository<OperarioHistorialRol, String> {

    @Query("select h from OperarioHistorialRol h join fetch h.operario o where h.deletedAt is null and o.deletedAt is null order by h.fecha desc")
    List<OperarioHistorialRol> findAllActive();

    @Query("select h from OperarioHistorialRol h join fetch h.operario o where h.deletedAt is null and o.deletedAt is null and o.id = :operarioId order by h.fecha desc")
    List<OperarioHistorialRol> findByOperario(@Param("operarioId") String operarioId);
}
