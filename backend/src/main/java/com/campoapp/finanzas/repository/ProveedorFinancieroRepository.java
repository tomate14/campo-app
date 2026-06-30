package com.campoapp.finanzas.repository;

import com.campoapp.finanzas.entity.ProveedorFinanciero;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ProveedorFinancieroRepository extends JpaRepository<ProveedorFinanciero, String> {
    Optional<ProveedorFinanciero> findByIdAndDeletedAtIsNull(String id);
    boolean existsByCuitAndDeletedAtIsNull(String cuit);
    long countByDeletedAtIsNullAndActivoTrue();

    @Query("""
        select p from ProveedorFinanciero p
        where p.deletedAt is null
          and (:search is null or :search = ''
            or lower(p.razonSocial) like lower(concat('%', :search, '%'))
            or p.cuit like concat('%', :search, '%')
            or lower(coalesce(p.categoria, '')) like lower(concat('%', :search, '%')))
        order by p.razonSocial asc
        """)
    Page<ProveedorFinanciero> findFiltered(@Param("search") String search, Pageable pageable);
}
