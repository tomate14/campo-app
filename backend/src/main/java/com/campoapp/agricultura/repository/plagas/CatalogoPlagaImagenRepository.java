package com.campoapp.agricultura.repository.plagas;

import com.campoapp.agricultura.entity.plagas.CatalogoPlagaImagen;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface CatalogoPlagaImagenRepository extends JpaRepository<CatalogoPlagaImagen, String> {

    // Imagenes vigentes de una plaga, principal primero, luego por orden y antiguedad.
    List<CatalogoPlagaImagen> findByCatalogoPlagaIdAndDeletedAtIsNullOrderByEsPrincipalDescOrdenAscCreatedAtAsc(String catalogoPlagaId);

    Optional<CatalogoPlagaImagen> findByIdAndDeletedAtIsNull(String id);

    // Carga batch para evitar N+1 en los listados de catalogo.
    List<CatalogoPlagaImagen> findByCatalogoPlagaIdInAndDeletedAtIsNull(Collection<String> catalogoPlagaIds);
}
