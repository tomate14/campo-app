package com.campoapp.agricultura.dto.plagas;

import java.time.LocalDateTime;
import java.util.List;

public record CatalogoPlagaResponse(
        String id,
        String nombreComun,
        String nombreCientifico,
        String tipo,
        // Feature 72: valor resuelto del catalogo TIPO_PLAGA (tipo sigue siendo el id).
        String tipoNombre,
        String cultivosAfectados,
        String descripcion,
        String sintomas,
        String umbralAccion,
        // Feature 54: zona tipica de aparicion.
        String zonaTipica,
        Boolean activo,
        // Feature 54: imagenes propias y url de la principal.
        List<CatalogoPlagaImagenResponse> imagenes,
        String imagenPrincipalUrl,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
