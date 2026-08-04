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
}
