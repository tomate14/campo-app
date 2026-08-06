package com.campoapp.agricultura.repository.plagas;

import com.campoapp.agricultura.entity.plagas.CatalogoPlaga;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CatalogoPlagaRepository extends JpaRepository<CatalogoPlaga, String> {
    @Query("SELECT c FROM CatalogoPlaga c WHERE c.deletedAt IS NULL AND (:tipo IS NULL OR c.tipo = :tipo) ORDER BY c.nombreComun ASC")
    List<CatalogoPlaga> search(@Param("tipo") String tipo);

    @Query("SELECT c FROM CatalogoPlaga c WHERE c.deletedAt IS NULL AND (:tipo IS NULL OR c.tipo = :tipo) ORDER BY c.nombreComun ASC")
    Page<CatalogoPlaga> searchPage(@Param("tipo") String tipo, Pageable pageable);

    @Query("SELECT c FROM CatalogoPlaga c WHERE c.id = :id AND c.deletedAt IS NULL")
    Optional<CatalogoPlaga> findActiveById(@Param("id") String id);

    // Feature 73: plagas cuyo CSV de cultivos_afectados contiene el id de cultivo dado
    // (FIND_IN_SET matchea el id exacto dentro del CSV). Solo con nombre cientifico util para GBIF.
    @Query(value = "SELECT * FROM catalogo_plagas WHERE deleted_at IS NULL "
            + "AND nombre_cientifico IS NOT NULL AND nombre_cientifico <> '' "
            + "AND FIND_IN_SET(:cultivoId, cultivos_afectados) > 0", nativeQuery = true)
    List<CatalogoPlaga> findConCultivoAfectado(@Param("cultivoId") String cultivoId);

    // Feature 75: todas las plagas activas con nombre cientifico, para resolver taxonomia GBIF (similares).
    @Query("SELECT c FROM CatalogoPlaga c WHERE c.deletedAt IS NULL "
            + "AND c.nombreCientifico IS NOT NULL AND c.nombreCientifico <> '' ORDER BY c.nombreComun ASC")
    List<CatalogoPlaga> findConNombreCientifico();
}
