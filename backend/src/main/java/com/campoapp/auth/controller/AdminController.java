package com.campoapp.auth.controller;

import com.campoapp.auth.dto.AssignRoleRequest;
import com.campoapp.auth.dto.CreateRoleRequest;
import com.campoapp.auth.dto.RoleMenuPermissionsResponse;
import com.campoapp.auth.dto.UpdateRoleMenuRequest;
import com.campoapp.auth.entity.AuditLog;
import com.campoapp.auth.entity.User;
import com.campoapp.auth.repository.AuditLogRepository;
import com.campoapp.auth.repository.UserRepository;
import com.campoapp.auth.service.MenuPermissionService;
import com.campoapp.auth.service.RBACService;
import com.campoapp.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@Tag(name = "Administración", description = "Gestión de usuarios, roles y auditoría")
@SecurityRequirement(name = "BearerAuth")
public class AdminController {

    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;
    private final RBACService rbacService;
    private final MenuPermissionService menuPermissionService;

    @GetMapping("/users")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN')")
    @Operation(summary = "Listar todos los usuarios")
    public ResponseEntity<ApiResponse<Page<User>>> listUsers(
            @PageableDefault(size = 20) Pageable pageable) {
        Page<User> users = userRepository.findAll(pageable);
        return ResponseEntity.ok(ApiResponse.ok(users));
    }

    @PostMapping("/users/{userId}/roles")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN')")
    @Operation(summary = "Asignar rol a un usuario")
    public ResponseEntity<ApiResponse<Void>> assignRole(
            @PathVariable String userId,
            @Valid @RequestBody AssignRoleRequest request) {
        rbacService.assignRole(userId, request.roleName());
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @DeleteMapping("/users/{userId}/roles/{roleName}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN')")
    @Operation(summary = "Remover rol de un usuario")
    public ResponseEntity<ApiResponse<Void>> removeRole(
            @PathVariable String userId,
            @PathVariable String roleName) {
        rbacService.removeRole(userId, roleName);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @PostMapping("/roles")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN')")
    @Operation(summary = "Crear rol operativo")
    public ResponseEntity<ApiResponse<RoleMenuPermissionsResponse>> createRole(
            @Valid @RequestBody CreateRoleRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(menuPermissionService.createRole(
                request.name(),
                request.description(),
                request.enableAllMenuOptions()
        )));
    }

    @GetMapping("/audit-logs")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN')")
    @Operation(summary = "Listar logs de auditoría")
    public ResponseEntity<ApiResponse<Page<AuditLog>>> auditLogs(
            @PageableDefault(size = 50) Pageable pageable) {
        Page<AuditLog> logs = auditLogRepository.findAll(pageable);
        return ResponseEntity.ok(ApiResponse.ok(logs));
    }

    @GetMapping("/menu-permissions")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN')")
    @Operation(summary = "Listar matriz de permisos de menu por rol")
    public ResponseEntity<ApiResponse<List<RoleMenuPermissionsResponse>>> menuPermissions() {
        return ResponseEntity.ok(ApiResponse.ok(menuPermissionService.getMatrix()));
    }

    @PutMapping("/roles/{roleId}/menu-options")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN')")
    @Operation(summary = "Actualizar opciones de menu visibles para un rol")
    public ResponseEntity<ApiResponse<RoleMenuPermissionsResponse>> updateRoleMenuOptions(
            @PathVariable String roleId,
            @Valid @RequestBody UpdateRoleMenuRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(menuPermissionService.updateRoleOptions(roleId, request.menuKeys())));
    }

}
