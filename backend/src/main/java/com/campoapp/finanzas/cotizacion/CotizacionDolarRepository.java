package com.campoapp.finanzas.cotizacion;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

// Feature 85: acceso al historial de cotizaciones. La "actual" es la mas reciente.
public interface CotizacionDolarRepository extends JpaRepository<CotizacionDolar, String> {

    Optional<CotizacionDolar> findTopByOrderByFechaDescCreatedAtDesc();
}
