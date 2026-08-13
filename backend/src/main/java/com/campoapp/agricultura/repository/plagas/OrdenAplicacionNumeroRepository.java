package com.campoapp.agricultura.repository.plagas;

import com.campoapp.agricultura.entity.plagas.OrdenAplicacionNumero;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OrdenAplicacionNumeroRepository extends JpaRepository<OrdenAplicacionNumero, Long> {

    Optional<OrdenAplicacionNumero> findByOrdenAplicacionId(String ordenAplicacionId);

    List<OrdenAplicacionNumero> findByOrdenAplicacionIdIn(List<String> ordenAplicacionIds);
}
