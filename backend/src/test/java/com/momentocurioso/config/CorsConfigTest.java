package com.momentocurioso.config;

import com.momentocurioso.config.SecurityConfig;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;

import static org.assertj.core.api.Assertions.assertThat;

class CorsConfigTest {

    private CorsConfigurationSource buildSource(String origins) {
        SecurityConfig config = new SecurityConfig();
        ReflectionTestUtils.setField(config, "allowedOrigins", origins);
        return config.corsConfigurationSource();
    }

    private CorsConfiguration getConfig(CorsConfigurationSource source) {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRequestURI("/api/posts");
        return source.getCorsConfiguration(request);
    }

    // ── BUG-020: CORS lido de variável de ambiente, não hardcoded ─────────────

    @Test
    void cors_withSingleOrigin_allowsIt() {
        CorsConfiguration config = getConfig(buildSource("http://localhost:4200"));

        assertThat(config.getAllowedOrigins())
                .containsExactly("http://localhost:4200");
    }

    @Test
    void cors_withMultipleOriginsCommaSeparated_allowsBoth() {
        CorsConfiguration config = getConfig(buildSource("http://app.com,http://admin.com"));

        assertThat(config.getAllowedOrigins())
                .contains("http://app.com", "http://admin.com");
    }

    @Test
    void cors_withMultipleOriginsAndSpaces_trimsEachOrigin() {
        CorsConfiguration config = getConfig(buildSource("http://app.com , http://admin.com"));

        assertThat(config.getAllowedOrigins())
                .contains("http://app.com", "http://admin.com")
                .doesNotContain(" http://admin.com");
    }
}
