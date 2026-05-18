package com.campoapp.auth.service;

import com.campoapp.auth.entity.Role;
import com.campoapp.auth.entity.User;
import com.campoapp.auth.repository.RoleRepository;
import com.campoapp.auth.repository.UserRepository;
import com.campoapp.common.exception.BusinessException;
import com.campoapp.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RBACService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    @Transactional
    public void assignRole(String userId, String roleName) {
        User user = userRepository.findActiveById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado: " + userId));
        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new ResourceNotFoundException("Rol no encontrado: " + roleName));

        if (user.getRoles().contains(role)) {
            throw new BusinessException("El usuario ya tiene el rol: " + roleName);
        }
        user.getRoles().add(role);
        userRepository.save(user);
    }

    @Transactional
    public void removeRole(String userId, String roleName) {
        User user = userRepository.findActiveById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado: " + userId));
        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new ResourceNotFoundException("Rol no encontrado: " + roleName));

        user.getRoles().remove(role);
        userRepository.save(user);
    }

    public Set<String> getUserPermissions(String userId) {
        User user = userRepository.findActiveById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado: " + userId));
        return user.getPermissionNames();
    }

    public boolean hasPermission(String userId, String permission) {
        return getUserPermissions(userId).contains(permission);
    }
}
