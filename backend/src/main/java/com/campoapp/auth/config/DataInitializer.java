package com.campoapp.auth.config;

import com.campoapp.auth.entity.Role;
import com.campoapp.auth.entity.User;
import com.campoapp.auth.repository.RoleRepository;
import com.campoapp.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Slf4j
@Component
@Order(1) // Corre antes que el DemoDataRunner (feature 76, @Order(100)).
@RequiredArgsConstructor
public class DataInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${admin.initial-email:admin@campoapp.com}")
    private String adminEmail;

    @Value("${admin.initial-password:Admin@Campo2024!}")
    private String adminPassword;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        createAdminUserIfNotExists();
    }

    private void createAdminUserIfNotExists() {
        if (userRepository.existsByEmail(adminEmail)) {
            log.info("Usuario admin ya existe, omitiendo seed.");
            return;
        }

        Role superAdminRole = roleRepository.findByName("super_admin")
                .orElseThrow(() -> new IllegalStateException(
                    "Rol 'super_admin' no encontrado. Verificar migración V1."));

        User admin = User.builder()
                .email(adminEmail)
                .passwordHash(passwordEncoder.encode(adminPassword))
                .name("Administrador")
                .active(true)
                .emailVerified(true)
                .roles(Set.of(superAdminRole))
                .build();

        userRepository.save(admin);
        log.info("✅ Usuario admin inicial creado: {}", adminEmail);
        log.warn("⚠️  Cambiá la contraseña del admin en producción.");
    }
}
