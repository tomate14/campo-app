package com.campoapp.ganaderia.repository;

import com.campoapp.ganaderia.entity.DiagnosticoSanitario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface DiagnosticoSanitarioRepository extends JpaRepository<DiagnosticoSanitario, String> {
    @Query("""
            select d from DiagnosticoSanitario d
            where d.deletedAt is null
              and (:animalId is null or d.animal.id = :animalId)
              and (:estado is null or d.estado = :estado)
            order by d.fechaDiagnostico desc, d.createdAt desc
            """)
    List<DiagnosticoSanitario> findFiltered(String animalId, String estado);

    @Query("""
            select count(d) from DiagnosticoSanitario d
            where d.deletedAt is null
              and d.estado = 'ABIERTO'
            """)
    long countAbiertos();
}
