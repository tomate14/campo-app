package com.campoapp.operarios.repository;

import com.campoapp.operarios.entity.Operario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface OperarioRepository extends JpaRepository<Operario, String> {

    @Query("select o from Operario o where o.deletedAt is null order by o.apellido asc, o.nombre asc")
    List<Operario> findAllActive();

    @Query("select o from Operario o where o.id = :id and o.deletedAt is null")
    Optional<Operario> findActiveById(@Param("id") String id);

    boolean existsByLegajoAndDeletedAtIsNull(String legajo);

    boolean existsByDocumentoNumeroAndDeletedAtIsNull(String documentoNumero);

    @Query("""
            select o from Operario o
            where o.deletedAt is null
              and (:search is null or lower(o.nombre) like lower(concat('%', :search, '%'))
                or lower(o.apellido) like lower(concat('%', :search, '%'))
                or lower(o.legajo) like lower(concat('%', :search, '%'))
                or lower(o.documentoNumero) like lower(concat('%', :search, '%')))
              and (:estado is null or o.estado = :estado)
              and (:rol is null or o.rolOperativo = :rol)
            order by o.apellido asc, o.nombre asc
            """)
    List<Operario> search(@Param("search") String search, @Param("estado") String estado, @Param("rol") String rol);
}
