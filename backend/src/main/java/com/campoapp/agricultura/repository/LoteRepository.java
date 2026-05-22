package com.campoapp.agricultura.repository;

import com.campoapp.agricultura.entity.Lote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface LoteRepository extends JpaRepository<Lote, String> {

    @Query("SELECT l FROM Lote l WHERE l.deletedAt IS NULL ORDER BY l.createdAt DESC")
    List<Lote> findAllActive();

    @Query("SELECT l FROM Lote l WHERE l.id = :id AND l.deletedAt IS NULL")
    Optional<Lote> findActiveById(@Param("id") String id);

    @Query("SELECT l FROM Lote l WHERE l.temporada = :temporada AND l.deletedAt IS NULL")
    List<Lote> findByTemporada(@Param("temporada") String temporada);

    @Query("SELECT l FROM Lote l WHERE l.cultivo = :cultivo AND l.deletedAt IS NULL")
    List<Lote> findByCultivo(@Param("cultivo") String cultivo);

    @Query("""
            SELECT DISTINCT l
            FROM Lote l
            LEFT JOIN l.propiedadesSuelo p
            WHERE l.deletedAt IS NULL
              AND (:temporada IS NULL OR l.temporada = :temporada)
              AND (:cultivo IS NULL OR l.cultivo = :cultivo)
              AND (:areaMin IS NULL OR l.area >= :areaMin)
              AND (:areaMax IS NULL OR l.area <= :areaMax)
              AND (:phMin IS NULL OR p.deletedAt IS NULL AND p.ph >= :phMin)
              AND (:phMax IS NULL OR p.deletedAt IS NULL AND p.ph <= :phMax)
              AND (
                    :tienePoligono IS NULL
                    OR (:tienePoligono = TRUE AND l.poligono IS NOT NULL AND l.poligono <> '')
                    OR (:tienePoligono = FALSE AND (l.poligono IS NULL OR l.poligono = ''))
                  )
            ORDER BY l.createdAt DESC
            """)
    List<Lote> search(
            @Param("temporada") String temporada,
            @Param("cultivo") String cultivo,
            @Param("areaMin") BigDecimal areaMin,
            @Param("areaMax") BigDecimal areaMax,
            @Param("phMin") BigDecimal phMin,
            @Param("phMax") BigDecimal phMax,
            @Param("tienePoligono") Boolean tienePoligono
    );
}
