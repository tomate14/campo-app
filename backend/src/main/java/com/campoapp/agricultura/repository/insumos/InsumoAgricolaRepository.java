package com.campoapp.agricultura.repository.insumos;

import com.campoapp.agricultura.entity.insumos.InsumoAgricola;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface InsumoAgricolaRepository extends JpaRepository<InsumoAgricola, String> {
    Optional<InsumoAgricola> findByIdAndDeletedAtIsNull(String id);
    boolean existsByCodigoAndDeletedAtIsNull(String codigo);
    boolean existsByCodigoAndIdNotAndDeletedAtIsNull(String codigo, String id);

    @Query("""
        select i from InsumoAgricola i
        where i.deletedAt is null
          and (:tipo is null or i.tipo = :tipo)
          and (:activo is null or i.activo = :activo)
          and (:search is null or :search = ''
            or lower(i.codigo) like lower(concat('%', :search, '%'))
            or lower(i.nombre) like lower(concat('%', :search, '%'))
            or lower(coalesce(i.marca, '')) like lower(concat('%', :search, '%'))
            or lower(coalesce(i.principioActivo, '')) like lower(concat('%', :search, '%')))
        order by i.nombre asc
        """)
    Page<InsumoAgricola> findFiltered(@Param("search") String search,
                                      @Param("tipo") String tipo,
                                      @Param("activo") Boolean activo,
                                      Pageable pageable);

    @Query("""
        select i from InsumoAgricola i
        where i.deletedAt is null and i.activo = true
        order by i.nombre asc
        """)
    List<InsumoAgricola> findAllActive();

    @Query(value = """
        select i from InsumoAgricola i
        left join StockInsumoAgricola s on s.insumo = i and s.deletedAt is null
        where i.deletedAt is null and i.activo = true
        group by i
        having coalesce(sum(s.cantidadDisponible), 0) <= i.stockMinimo
        order by i.nombre asc
        """,
        countQuery = """
        select count(i) from InsumoAgricola i
        where i.deletedAt is null and i.activo = true
          and (
            select coalesce(sum(s.cantidadDisponible), 0)
            from StockInsumoAgricola s
            where s.deletedAt is null and s.insumo = i
          ) <= i.stockMinimo
        """)
    Page<InsumoAgricola> findReordenPendiente(Pageable pageable);
}
