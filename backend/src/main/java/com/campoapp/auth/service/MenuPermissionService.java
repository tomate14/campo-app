package com.campoapp.auth.service;

import com.campoapp.auth.dto.MenuOptionResponse;
import com.campoapp.auth.dto.RoleMenuPermissionsResponse;
import com.campoapp.auth.dto.RoleOptionResponse;
import com.campoapp.common.exception.BusinessException;
import com.campoapp.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class MenuPermissionService {

    private final JdbcTemplate jdbcTemplate;

    public List<RoleMenuPermissionsResponse> getMatrix() {
        String sql = """
                SELECT r.id AS role_id, r.name AS role_name, r.description AS role_description,
                       m.id AS menu_id, m.menu_key, m.label, m.route, m.section, m.icon, m.display_order,
                       CASE WHEN rmo.menu_option_id IS NULL THEN FALSE ELSE TRUE END AS enabled
                FROM roles r
                CROSS JOIN menu_options m
                LEFT JOIN role_menu_options rmo ON rmo.role_id = r.id AND rmo.menu_option_id = m.id
                WHERE r.deleted_at IS NULL AND m.deleted_at IS NULL AND m.active = TRUE
                ORDER BY r.name, m.display_order
                """;
        Map<String, RoleAccumulator> roles = new LinkedHashMap<>();
        jdbcTemplate.query(sql, rs -> {
            String roleId = rs.getString("role_id");
            String roleName = rs.getString("role_name");
            String roleDescription = rs.getString("role_description");
            RoleAccumulator role = roles.computeIfAbsent(roleId, ignored -> new RoleAccumulator(roleId, roleName, roleDescription));
            role.options.add(toMenuOption(rs));
        });
        return roles.values().stream()
                .map(role -> new RoleMenuPermissionsResponse(role.roleId, role.roleName, role.description, role.options))
                .toList();
    }

    public List<RoleOptionResponse> getRoles() {
        return jdbcTemplate.query("""
                SELECT id, name, description
                FROM roles
                WHERE deleted_at IS NULL
                ORDER BY name
                """, (rs, rowNum) -> new RoleOptionResponse(
                rs.getString("id"),
                rs.getString("name"),
                rs.getString("description")
        ));
    }

    @Transactional
    public RoleMenuPermissionsResponse createRole(String name, String description, Boolean enableAllMenuOptions) {
        String normalizedName = normalizeRoleName(name);
        Integer existing = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM roles WHERE name = ? AND deleted_at IS NULL",
                Integer.class,
                normalizedName
        );
        if (existing != null && existing > 0) {
            throw new BusinessException("Ya existe un rol con nombre: " + normalizedName);
        }
        jdbcTemplate.update(
                "INSERT INTO roles (id, name, description) VALUES (UUID(), ?, ?)",
                normalizedName,
                blankToNull(description)
        );
        RoleInfo role = jdbcTemplate.query("""
                SELECT id, name, description
                FROM roles
                WHERE name = ? AND deleted_at IS NULL
                """, (rs, rowNum) -> new RoleInfo(rs.getString("id"), rs.getString("name"), rs.getString("description")), normalizedName)
                .stream()
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Rol no encontrado: " + normalizedName));
        if (Boolean.TRUE.equals(enableAllMenuOptions)) {
            jdbcTemplate.update("""
                    INSERT INTO role_menu_options (role_id, menu_option_id)
                    SELECT ?, id FROM menu_options WHERE deleted_at IS NULL AND active = TRUE
                    """, role.id());
        }
        return getMatrix().stream()
                .filter(item -> item.roleId().equals(role.id()))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Rol no encontrado: " + role.id()));
    }

    public List<MenuOptionResponse> getOptionsForUser(String userId) {
        String sql = """
                SELECT DISTINCT m.id AS menu_id, m.menu_key, m.label, m.route, m.section, m.icon, m.display_order,
                       TRUE AS enabled
                FROM users u
                JOIN user_roles ur ON ur.user_id = u.id
                JOIN roles r ON r.id = ur.role_id
                JOIN role_menu_options rmo ON rmo.role_id = r.id
                JOIN menu_options m ON m.id = rmo.menu_option_id
                WHERE u.id = ? AND u.deleted_at IS NULL AND u.active = TRUE
                  AND r.deleted_at IS NULL AND m.deleted_at IS NULL AND m.active = TRUE
                ORDER BY m.display_order
                """;
        List<MenuOptionResponse> options = jdbcTemplate.query(sql, (rs, rowNum) -> toMenuOption(rs), userId);
        if (!options.isEmpty()) {
            return options;
        }
        return getDefaultOptionsForAdminIfApplies(userId);
    }

    @Transactional
    public RoleMenuPermissionsResponse updateRoleOptions(String roleId, List<String> menuKeys) {
        RoleInfo role = findRole(roleId);
        if (isAdminRole(role.name()) && !menuKeys.contains("admin-roles-menu")) {
            throw new BusinessException("Admin y super_admin deben conservar acceso a Roles y menu.");
        }
        List<String> validKeys = validMenuKeys(menuKeys);
        jdbcTemplate.update("DELETE FROM role_menu_options WHERE role_id = ?", roleId);
        for (String key : validKeys) {
            jdbcTemplate.update("""
                    INSERT INTO role_menu_options (role_id, menu_option_id)
                    SELECT ?, id FROM menu_options WHERE menu_key = ? AND deleted_at IS NULL AND active = TRUE
                    """, roleId, key);
        }
        return getMatrix().stream()
                .filter(item -> item.roleId().equals(roleId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Rol no encontrado: " + roleId));
    }

    private List<MenuOptionResponse> getDefaultOptionsForAdminIfApplies(String userId) {
        String rolesSql = """
                SELECT r.name
                FROM users u
                JOIN user_roles ur ON ur.user_id = u.id
                JOIN roles r ON r.id = ur.role_id
                WHERE u.id = ? AND u.deleted_at IS NULL AND u.active = TRUE
                """;
        Set<String> roles = Set.copyOf(jdbcTemplate.queryForList(rolesSql, String.class, userId));
        if (!roles.contains("admin") && !roles.contains("super_admin")) {
            return List.of();
        }
        return jdbcTemplate.query("""
                SELECT m.id AS menu_id, m.menu_key, m.label, m.route, m.section, m.icon, m.display_order,
                       TRUE AS enabled
                FROM menu_options m
                WHERE m.deleted_at IS NULL AND m.active = TRUE
                ORDER BY m.display_order
                """, (rs, rowNum) -> toMenuOption(rs));
    }

    private RoleInfo findRole(String roleId) {
        List<RoleInfo> roles = jdbcTemplate.query("""
                SELECT id, name, description
                FROM roles
                WHERE id = ? AND deleted_at IS NULL
                """, (rs, rowNum) -> new RoleInfo(rs.getString("id"), rs.getString("name"), rs.getString("description")), roleId);
        if (roles.isEmpty()) {
            throw new ResourceNotFoundException("Rol no encontrado: " + roleId);
        }
        return roles.get(0);
    }

    private List<String> validMenuKeys(List<String> menuKeys) {
        List<String> uniqueKeys = menuKeys.stream().distinct().toList();
        if (uniqueKeys.isEmpty()) {
            return List.of();
        }
        String placeholders = String.join(",", uniqueKeys.stream().map(ignored -> "?").toList());
        List<String> validKeys = jdbcTemplate.queryForList("""
                SELECT menu_key
                FROM menu_options
                WHERE deleted_at IS NULL AND active = TRUE AND menu_key IN (%s)
                """.formatted(placeholders), String.class, uniqueKeys.toArray());
        if (validKeys.size() != uniqueKeys.size()) {
            throw new BusinessException("Una o mas opciones de menu no existen.");
        }
        return validKeys;
    }

    private boolean isAdminRole(String roleName) {
        return "admin".equals(roleName) || "super_admin".equals(roleName);
    }

    private String normalizeRoleName(String value) {
        String normalized = value == null ? "" : value.trim().toLowerCase()
                .replaceAll("[^a-z0-9]+", "_")
                .replaceAll("^_+|_+$", "");
        if (normalized.isBlank()) {
            throw new BusinessException("El nombre del rol es obligatorio.");
        }
        return normalized;
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private MenuOptionResponse toMenuOption(ResultSet rs) throws SQLException {
        return new MenuOptionResponse(
                rs.getString("menu_id"),
                rs.getString("menu_key"),
                rs.getString("label"),
                rs.getString("route"),
                rs.getString("section"),
                rs.getString("icon"),
                rs.getInt("display_order"),
                rs.getBoolean("enabled")
        );
    }

    private record RoleAccumulator(String roleId, String roleName, String description, List<MenuOptionResponse> options) {
        private RoleAccumulator(String roleId, String roleName, String description) {
            this(roleId, roleName, description, new ArrayList<>());
        }
    }

    private record RoleInfo(String id, String name, String description) {
    }
}
