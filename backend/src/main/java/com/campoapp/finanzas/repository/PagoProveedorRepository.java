package com.campoapp.finanzas.repository;

import com.campoapp.finanzas.entity.PagoProveedor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;

public interface PagoProveedorRepository extends JpaRepository<PagoProveedor, String> {
    Page<PagoProveedor> findByDeletedAtIsNullOrderByFechaDesc(Pageable pageable);

    @Query(value = "select coalesce(sum(importe), 0) from finanzas_pagos_proveedor where deleted_at is null and fecha between :desde and :hasta", nativeQuery = true)
    BigDecimal pagosEntre(@Param("desde") LocalDate desde, @Param("hasta") LocalDate hasta);
}
