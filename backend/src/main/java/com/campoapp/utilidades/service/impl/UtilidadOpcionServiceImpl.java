package com.campoapp.utilidades.service.impl;

import com.campoapp.common.exception.BusinessException;
import com.campoapp.common.exception.ResourceNotFoundException;
import com.campoapp.utilidades.dto.UtilidadOpcionRequest;
import com.campoapp.utilidades.dto.UtilidadOpcionResponse;
import com.campoapp.utilidades.service.UtilidadOpcionService;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Fachada generica del modulo Utilidades (feature 71).
 * Cada catalogo configurable vive en su propia tabla {@code utilidad_*} con el
 * mismo esquema. La categoria enviada por el cliente NO se interpola nunca como
 * nombre de tabla: siempre se resuelve contra la whitelist {@link #CATALOGOS} y
 * se usa el valor del mapa. Esa es la defensa contra SQL injection por nombre de
 * tabla; los valores y filtros van siempre por parametros preparados.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UtilidadOpcionServiceImpl implements UtilidadOpcionService {

    // Whitelist inmutable categoria -> tabla fisica.
    private static final Map<String, String> CATALOGOS = Map.of(
            "DESTINO_COSECHA", "utilidad_destino_cosecha",
            "TIPO_PERDIDA_COSECHA", "utilidad_tipo_perdida",
            "CULTIVO", "utilidad_cultivo",
            "TIPO_PLAGA", "utilidad_tipo_plaga",
            "TIPO_INSUMO", "utilidad_tipo_insumo",
            "UNIDAD_INSUMO", "utilidad_unidad_insumo"
    );

    private final JdbcTemplate jdbcTemplate;

    // Resuelve la tabla contra la whitelist. Categoria desconocida -> 404.
    private String resolveTabla(String categoria) {
        String tabla = categoria == null ? null : CATALOGOS.get(categoria.trim());
        if (tabla == null) {
            throw new ResourceNotFoundException("Categoría de utilidad no soportada: " + categoria);
        }
        return tabla;
    }

    @Override
    public List<UtilidadOpcionResponse> listarPorCategoria(String categoria) {
        String tabla = resolveTabla(categoria);
        String cat = categoria.trim();
        return jdbcTemplate.query(
                "SELECT id, valor, activo, orden FROM " + tabla
                        + " WHERE activo = 1 AND deleted_at IS NULL ORDER BY valor ASC",
                (rs, rowNum) -> new UtilidadOpcionResponse(
                        rs.getString("id"),
                        cat,
                        rs.getString("valor"),
                        rs.getBoolean("activo"),
                        rs.getInt("orden")));
    }

    @Override
    @Transactional
    public UtilidadOpcionResponse crear(UtilidadOpcionRequest request) {
        String categoria = request.categoria().trim();
        String tabla = resolveTabla(categoria);
        String valor = request.valor().trim();

        // Evita duplicados por valor (mismo criterio que la constraint unica de la tabla).
        Integer existentes = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM " + tabla + " WHERE valor = ? AND deleted_at IS NULL",
                Integer.class, valor);
        if (existentes != null && existentes > 0) {
            throw new BusinessException("Ya existe una opción '" + valor + "' en la categoría " + categoria);
        }

        Integer maxOrden = jdbcTemplate.queryForObject(
                "SELECT MAX(orden) FROM " + tabla, Integer.class);
        int orden = (maxOrden == null ? 0 : maxOrden) + 1;

        String id = UUID.randomUUID().toString();
        Timestamp now = Timestamp.valueOf(LocalDateTime.now());
        jdbcTemplate.update(
                "INSERT INTO " + tabla + " (id, valor, activo, orden, created_at, updated_at) VALUES (?, ?, 1, ?, ?, ?)",
                id, valor, orden, now, now);
        return new UtilidadOpcionResponse(id, categoria, valor, true, orden);
    }

    @Override
    @Transactional
    public void eliminar(String categoria, String id) {
        String tabla = resolveTabla(categoria);
        Timestamp now = Timestamp.valueOf(LocalDateTime.now());
        jdbcTemplate.update(
                "UPDATE " + tabla + " SET deleted_at = ?, updated_at = ? WHERE id = ? AND deleted_at IS NULL",
                now, now, id);
    }
}
