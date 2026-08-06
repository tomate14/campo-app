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
        // Feature 73: CSV de ids de utilidad_cultivo (lo que se guarda/edita).
        String cultivosAfectados,
        // Feature 73: CSV de los valores resueltos de esos ids, para mostrar (ej: "MAIZ, SORGO").
        String cultivosAfectadosNombres,
        String descripcion,
        String sintomas,
        String umbralAccion,
        // Feature 54: zona tipica de aparicion.
        String zonaTipica,
        Boolean activo,
        // Feature 54: imagenes propias y url de la principal.
        List<CatalogoPlagaImagenResponse> imagenes,
        String imagenPrincipalUrl,
        // Feature 75: clasificacion taxonomica resuelta desde GBIF, para mostrar en la ficha.
        String gbifGenero,
        String gbifFamilia,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
