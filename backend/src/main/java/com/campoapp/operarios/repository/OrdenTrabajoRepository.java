package com.campoapp.operarios.repository;

import com.campoapp.operarios.entity.OrdenTrabajo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface OrdenTrabajoRepository extends JpaRepository<OrdenTrabajo, String> {

    @Query("select o from OrdenTrabajo o join fetch o.operario op left join fetch o.lote l where o.id = :id and o.deletedAt is null")
    Optional<OrdenTrabajo> findActiveById(@Param("id") String id);

    boolean existsByCodigoAndDeletedAtIsNull(String codigo);

    @Query("""
            select o from OrdenTrabajo o
            join fetch o.operario op
            left join fetch o.lote l
            where o.deletedAt is null
              and (:search is null or lower(o.codigo) like lower(concat('%', :search, '%'))
                or lower(o.titulo) like lower(concat('%', :search, '%'))
                or lower(o.descripcion) like lower(concat('%', :search, '%')))
              and (:estado is null or o.estado = :estado)
              and (:operarioId is null or op.id = :operarioId)
              and (:loteId is null or l.id = :loteId)
              and (:prioridad is null or o.prioridad = :prioridad)
              and (:fechaInicio is null or o.fechaProgramada >= :fechaInicio)
              and (:fechaFin is null or o.fechaProgramada < :fechaFin)
            order by o.fechaProgramada asc, o.createdAt desc
            """)
    List<OrdenTrabajo> search(
            @Param("search") String search,
            @Param("estado") String estado,
            @Param("operarioId") String operarioId,
            @Param("loteId") String loteId,
            @Param("prioridad") String prioridad,
            @Param("fechaInicio") LocalDateTime fechaInicio,
            @Param("fechaFin") LocalDateTime fechaFin
    );

    long countByDeletedAtIsNullAndEstado(String estado);

    long countByDeletedAtIsNullAndEstadoNotInAndFechaFinEstimadaBefore(List<String> estados, LocalDateTime now);
}
