package com.campoapp.agricultura.repository.plagas;

import com.campoapp.agricultura.entity.plagas.EstadoOrdenAplicacion;
import com.campoapp.agricultura.entity.plagas.OrdenAplicacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface OrdenAplicacionRepository extends JpaRepository<OrdenAplicacion, String> {

    @Query("""
            SELECT o FROM OrdenAplicacion o
            JOIN FETCH o.lote
            JOIN FETCH o.deteccion d
            JOIN FETCH d.catalogoPlaga
            WHERE o.deletedAt IS NULL
              AND (:estado IS NULL OR o.estado = :estado)
              AND (:operarioId IS NULL OR o.operarioId = :operarioId)
              AND (:responsableId IS NULL OR o.responsableId = :responsableId)
              AND (:loteId IS NULL OR o.lote.id = :loteId)
            ORDER BY o.fechaAplicacion DESC
            """)
    List<OrdenAplicacion> search(@Param("estado") EstadoOrdenAplicacion estado,
                                 @Param("operarioId") String operarioId,
                                 @Param("responsableId") String responsableId,
                                 @Param("loteId") String loteId);

    @Query("""
            SELECT o FROM OrdenAplicacion o
            JOIN FETCH o.lote
            JOIN FETCH o.deteccion d
            JOIN FETCH d.catalogoPlaga
            WHERE o.deletedAt IS NULL AND o.id = :id
            """)
    Optional<OrdenAplicacion> findActiveById(@Param("id") String id);

    @Query("""
            SELECT o FROM OrdenAplicacion o
            JOIN FETCH o.lote
            JOIN FETCH o.deteccion d
            JOIN FETCH d.catalogoPlaga
            WHERE o.deletedAt IS NULL AND o.lote.id = :loteId
            ORDER BY o.fechaAplicacion DESC
            """)
    List<OrdenAplicacion> findActiveByLote(@Param("loteId") String loteId);
}
