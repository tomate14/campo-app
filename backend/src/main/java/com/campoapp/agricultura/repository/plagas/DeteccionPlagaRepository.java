package com.campoapp.agricultura.repository.plagas;

import com.campoapp.agricultura.entity.plagas.DeteccionPlaga;
import com.campoapp.agricultura.entity.plagas.EstadoDeteccionPlaga;
import com.campoapp.agricultura.entity.plagas.SeveridadPlaga;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface DeteccionPlagaRepository extends JpaRepository<DeteccionPlaga, String> {
    @Query("""
            SELECT d FROM DeteccionPlaga d
            JOIN FETCH d.lote l
            JOIN FETCH d.catalogoPlaga c
            WHERE d.deletedAt IS NULL
              AND (:loteId IS NULL OR l.id = :loteId)
              AND (:estado IS NULL OR d.estado = :estado)
              AND (:severidad IS NULL OR d.severidad = :severidad)
              AND (:cultivo IS NULL OR d.cultivo = :cultivo)
            ORDER BY d.fechaDeteccion DESC
            """)
    List<DeteccionPlaga> search(@Param("loteId") String loteId,
                                @Param("estado") EstadoDeteccionPlaga estado,
                                @Param("severidad") SeveridadPlaga severidad,
                                @Param("cultivo") String cultivo);

    @Query("SELECT d FROM DeteccionPlaga d JOIN FETCH d.lote JOIN FETCH d.catalogoPlaga WHERE d.id = :id AND d.deletedAt IS NULL")
    Optional<DeteccionPlaga> findActiveById(@Param("id") String id);

    @Query("SELECT COUNT(d) FROM DeteccionPlaga d WHERE d.deletedAt IS NULL AND d.estado = :estado")
    long countByEstado(@Param("estado") EstadoDeteccionPlaga estado);

    @Query("SELECT COUNT(d) FROM DeteccionPlaga d WHERE d.deletedAt IS NULL AND d.severidad = :severidad AND d.estado IN :estados")
    long countActiveBySeveridad(@Param("severidad") SeveridadPlaga severidad, @Param("estados") List<EstadoDeteccionPlaga> estados);

    @Query("SELECT d FROM DeteccionPlaga d JOIN FETCH d.lote JOIN FETCH d.catalogoPlaga WHERE d.deletedAt IS NULL AND d.lote.id = :loteId AND d.latitud IS NOT NULL AND d.longitud IS NOT NULL ORDER BY d.fechaDeteccion DESC")
    List<DeteccionPlaga> findMapPinsByLote(@Param("loteId") String loteId);
}
