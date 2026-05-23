package com.campoapp.ganaderia.repository;

import com.campoapp.ganaderia.entity.TratamientoMedicamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;

public interface TratamientoMedicamentoRepository extends JpaRepository<TratamientoMedicamento, String> {
    @Query("""
            select t from TratamientoMedicamento t
            where t.deletedAt is null
              and (:animalId is null or t.animal.id = :animalId)
              and (:desde is null or t.fechaInicio >= :desde)
              and (:hasta is null or t.fechaInicio <= :hasta)
            order by t.fechaInicio desc, t.createdAt desc
            """)
    List<TratamientoMedicamento> findFiltered(String animalId, LocalDate desde, LocalDate hasta);

    @Query("""
            select count(t) from TratamientoMedicamento t
            where t.deletedAt is null
              and (t.fechaFin is null or t.fechaFin >= :referencia)
            """)
    long countActivos(LocalDate referencia);
}
