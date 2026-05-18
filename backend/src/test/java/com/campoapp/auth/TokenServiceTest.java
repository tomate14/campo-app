package com.campoapp.auth;

import com.campoapp.auth.entity.User;
import com.campoapp.auth.repository.RefreshTokenRepository;
import com.campoapp.auth.service.TokenService;
import com.campoapp.common.exception.UnauthorizedException;
import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Set;

import static org.assertj.core.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class TokenServiceTest {

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @InjectMocks
    private TokenService tokenService;

    private User testUser;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(tokenService, "jwtSecret",
                "test-secret-key-256bits-padding-needed-here-ok");
        ReflectionTestUtils.setField(tokenService, "accessTokenExpirationMs", 900000L);
        ReflectionTestUtils.setField(tokenService, "refreshTokenExpirationMs", 604800000L);

        testUser = User.builder()
                .email("operario@campo.com")
                .name("Juan García")
                .passwordHash("hashed")
                .build();
        ReflectionTestUtils.setField(testUser, "id", "user-uuid-001");
    }

    @Test
    void generateAccessToken_containsCorrectClaims() {
        String token = tokenService.generateAccessToken(testUser);

        assertThat(token).isNotBlank();
        Claims claims = tokenService.validateAccessToken(token);
        assertThat(claims.getSubject()).isEqualTo("user-uuid-001");
        assertThat(claims.get("email")).isEqualTo("operario@campo.com");
    }

    @Test
    void validateAccessToken_withExpiredToken_throwsUnauthorizedException() {
        ReflectionTestUtils.setField(tokenService, "accessTokenExpirationMs", -1000L);
        String expiredToken = tokenService.generateAccessToken(testUser);

        assertThatThrownBy(() -> tokenService.validateAccessToken(expiredToken))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("expirado");
    }

    @Test
    void validateAccessToken_withTamperedToken_throwsUnauthorizedException() {
        assertThatThrownBy(() -> tokenService.validateAccessToken("eyJhbGc.tampered.token"))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("inválido");
    }
}
