package com.campoapp.finanzas.repository;

import com.campoapp.finanzas.entity.ClienteFinanciero;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ClienteFinancieroRepository extends JpaRepository<ClienteFinanciero, String> {
    Optional<ClienteFinanciero> findByIdAndDeletedAtIsNull(String id);
    boolean existsByCuitAndDeletedAtIsNull(String cuit);
    long countByDeletedAtIsNullAndActivoTrue();

    @Query("""
        select c from ClienteFinanciero c
        where c.deletedAt is null
          and (:search is null or :search = ''
            or lower(c.razonSocial) like lower(concat('%', :search, '%'))
            or c.cuit like concat('%', :search, '%'))
        order by c.razonSocial asc
        """)
    Page<ClienteFinanciero> findFiltered(@Param("search") String search, Pageable pageable);
}
