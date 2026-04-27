package com.momentocurioso.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class JwtUtilTest {

    private static final String SECRET = "test-secret-at-least-32-characters-long";
    private static final long EXPIRATION_MS = 86_400_000L;

    private JwtUtil jwtUtil;

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil(SECRET, EXPIRATION_MS);
    }

    // ── BUG-019: JWT secret lido de variável de ambiente, não hardcoded ───────

    @Test
    void generateToken_returnsNonNullToken() {
        String token = jwtUtil.generateToken("user@test.com", "USER");
        assertThat(token).isNotNull().isNotBlank();
    }

    @Test
    void generateToken_tokenContainsEmail() {
        String token = jwtUtil.generateToken("user@test.com", "USER");
        assertThat(jwtUtil.extractEmail(token)).isEqualTo("user@test.com");
    }

    @Test
    void generateToken_tokenContainsRole() {
        String token = jwtUtil.generateToken("user@test.com", "ADMIN");
        assertThat(jwtUtil.extractRole(token)).isEqualTo("ADMIN");
    }

    @Test
    void extractEmail_fromValidToken_returnsCorrectEmail() {
        String email = "specific@example.com";
        String token = jwtUtil.generateToken(email, "USER");
        assertThat(jwtUtil.extractEmail(token)).isEqualTo(email);
    }

    @Test
    void validateToken_withCorrectCredentials_returnsTrue() {
        String token = jwtUtil.generateToken("user@test.com", "USER");
        UserDetails userDetails = User.withUsername("user@test.com")
                .password("ignored").authorities(List.of()).build();

        assertThat(jwtUtil.isValid(token, userDetails)).isTrue();
    }

    @Test
    void validateToken_withWrongUsername_returnsFalse() {
        String token = jwtUtil.generateToken("user@test.com", "USER");
        UserDetails otherUser = User.withUsername("other@test.com")
                .password("ignored").authorities(List.of()).build();

        assertThat(jwtUtil.isValid(token, otherUser)).isFalse();
    }

    @Test
    void extractEmail_fromMalformedToken_throwsException() {
        assertThatThrownBy(() -> jwtUtil.extractEmail("this.is.not.a.valid.jwt"))
                .isInstanceOf(Exception.class);
    }

    @Test
    void extractEmail_fromTokenSignedWithDifferentSecret_throwsException() {
        JwtUtil otherUtil = new JwtUtil("completely-different-secret-also-long-enough", EXPIRATION_MS);
        String tokenFromOther = otherUtil.generateToken("user@test.com", "USER");

        assertThatThrownBy(() -> jwtUtil.extractEmail(tokenFromOther))
                .isInstanceOf(Exception.class);
    }
}
