package com.campoapp.agricultura.repository.plagas;

import com.campoapp.agricultura.entity.plagas.PlagaReferencia;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PlagaReferenciaRepository extends JpaRepository<PlagaReferencia, String> {

    List<PlagaReferencia> findByDeletedAtIsNullOrderByCultivoIdAscNombreComunAsc();

    List<PlagaReferencia> findByCultivoIdAndDeletedAtIsNull(String cultivoId);

    // Idempotencia: una fila por (cultivo, nombre cientifico).
    Optional<PlagaReferencia> findByCultivoIdAndNombreCientificoAndDeletedAtIsNull(String cultivoId, String nombreCientifico);
}
