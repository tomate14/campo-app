package com.campoapp.agricultura.repository.insumos;

import com.campoapp.agricultura.entity.insumos.MovimientoInsumoAgricola;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MovimientoInsumoAgricolaRepository extends JpaRepository<MovimientoInsumoAgricola, String> {
    Page<MovimientoInsumoAgricola> findByDeletedAtIsNullOrderByFechaDesc(Pageable pageable);
    List<MovimientoInsumoAgricola> findTop8ByDeletedAtIsNullOrderByFechaDesc();
    List<MovimientoInsumoAgricola> findByInsumoIdAndDeletedAtIsNullOrderByFechaDesc(String insumoId);
}
