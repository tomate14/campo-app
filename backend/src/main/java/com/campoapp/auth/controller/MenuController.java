package com.campoapp.auth.controller;

import com.campoapp.auth.dto.MenuOptionResponse;
import com.campoapp.auth.dto.RoleOptionResponse;
import com.campoapp.auth.service.MenuPermissionService;
import com.campoapp.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/menu-options")
@RequiredArgsConstructor
@Tag(name = "Menu", description = "Opciones de navegacion visibles por usuario")
@SecurityRequirement(name = "BearerAuth")
public class MenuController {

    private final MenuPermissionService menuPermissionService;

    @GetMapping("/me")
    @Operation(summary = "Listar opciones de menu visibles para el usuario autenticado")
    public ResponseEntity<ApiResponse<List<MenuOptionResponse>>> currentUserMenuOptions(
            @AuthenticationPrincipal String userId) {
        return ResponseEntity.ok(ApiResponse.ok(menuPermissionService.getOptionsForUser(userId)));
    }

    @GetMapping("/roles")
    @Operation(summary = "Listar roles disponibles para selectores")
    public ResponseEntity<ApiResponse<List<RoleOptionResponse>>> roles() {
        return ResponseEntity.ok(ApiResponse.ok(menuPermissionService.getRoles()));
    }
}
