package com.campoapp.ganaderia.repository;

import com.campoapp.ganaderia.entity.RegistroAlimentacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface RegistroAlimentacionRepository extends JpaRepository<RegistroAlimentacion, String> {
    @Query("""
            SELECT r FROM RegistroAlimentacion r
            LEFT JOIN FETCH r.animal
            LEFT JOIN FETCH r.dieta
            LEFT JOIN FETCH r.potreroRef
            WHERE r.deletedAt IS NULL
              AND (:animalId IS NULL OR r.animal.id = :animalId)
              AND (:desde IS NULL OR r.fecha >= :desde)
              AND (:hasta IS NULL OR r.fecha <= :hasta)
            ORDER BY r.fecha DESC, r.updatedAt DESC
            """)
    List<RegistroAlimentacion> findFiltered(@Param("animalId") String animalId, @Param("desde") LocalDate desde, @Param("hasta") LocalDate hasta);
}
