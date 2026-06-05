package com.campoapp.operarios.repository;

import com.campoapp.operarios.entity.OperarioDocumento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface OperarioDocumentoRepository extends JpaRepository<OperarioDocumento, String> {

    @Query("select d from OperarioDocumento d join fetch d.operario o where d.deletedAt is null and o.deletedAt is null order by d.fechaVencimiento asc")
    List<OperarioDocumento> findAllActive();

    @Query("select d from OperarioDocumento d join fetch d.operario o where d.deletedAt is null and o.deletedAt is null and o.id = :operarioId order by d.fechaVencimiento asc")
    List<OperarioDocumento> findByOperario(@Param("operarioId") String operarioId);

    long countByDeletedAtIsNullAndFechaVencimientoBefore(LocalDate fecha);
}
