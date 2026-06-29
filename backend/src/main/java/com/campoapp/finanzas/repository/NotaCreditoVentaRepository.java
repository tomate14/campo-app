package com.campoapp.finanzas.repository;

import com.campoapp.finanzas.entity.NotaCreditoVenta;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotaCreditoVentaRepository extends JpaRepository<NotaCreditoVenta, String> {
    Page<NotaCreditoVenta> findByDeletedAtIsNullOrderByFechaDesc(Pageable pageable);
}
