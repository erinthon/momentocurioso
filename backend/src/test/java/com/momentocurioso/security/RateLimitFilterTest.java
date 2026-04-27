package com.momentocurioso.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import static org.assertj.core.api.Assertions.assertThat;

class RateLimitFilterTest {

    private RateLimitFilter filter;

    @BeforeEach
    void setUp() {
        filter = new RateLimitFilter();
    }

    // ── BUG-007: 11ª tentativa em /auth/* deve retornar HTTP 429 ─────────────

    @Test
    void filter_tenRequestsAllowed_eleventhReturns429() throws Exception {
        String clientIp = "192.168.1.100";

        for (int i = 1; i <= 10; i++) {
            MockHttpServletRequest request = new MockHttpServletRequest("POST", "/auth/login");
            request.setServletPath("/auth/login");
            request.setRemoteAddr(clientIp);
            MockHttpServletResponse response = new MockHttpServletResponse();
            MockFilterChain chain = new MockFilterChain();

            filter.doFilter(request, response, chain);

            assertThat(response.getStatus())
                    .as("Request %d não deve ser bloqueado", i)
                    .isNotEqualTo(429);
            assertThat(chain.getRequest())
                    .as("Chain deve ter sido chamado para o request %d", i)
                    .isNotNull();
        }

        MockHttpServletRequest eleventh = new MockHttpServletRequest("POST", "/auth/login");
        eleventh.setServletPath("/auth/login");
        eleventh.setRemoteAddr(clientIp);
        MockHttpServletResponse eleventhResponse = new MockHttpServletResponse();
        MockFilterChain eleventhChain = new MockFilterChain();

        filter.doFilter(eleventh, eleventhResponse, eleventhChain);

        assertThat(eleventhResponse.getStatus())
                .as("11ª tentativa deve retornar HTTP 429")
                .isEqualTo(429);
        assertThat(eleventhChain.getRequest())
                .as("Chain NÃO deve ter sido chamado no 11º request")
                .isNull();
    }

    @Test
    void filter_onNonAuthPath_doesNotApplyRateLimit() throws Exception {
        for (int i = 1; i <= 20; i++) {
            MockHttpServletRequest request = new MockHttpServletRequest("GET", "/posts");
            request.setServletPath("/posts");
            request.setRemoteAddr("10.0.0.1");
            MockHttpServletResponse response = new MockHttpServletResponse();
            MockFilterChain chain = new MockFilterChain();

            filter.doFilter(request, response, chain);

            assertThat(response.getStatus())
                    .as("Request %d para /posts não deve ser rate-limited", i)
                    .isNotEqualTo(429);
            assertThat(chain.getRequest())
                    .as("Chain deve ter sido chamado para o request %d de /posts", i)
                    .isNotNull();
        }
    }

    @Test
    void filter_429Response_containsJsonBody() throws Exception {
        String clientIp = "10.0.0.42";

        for (int i = 0; i < 10; i++) {
            MockHttpServletRequest req = new MockHttpServletRequest("POST", "/auth/login");
            req.setServletPath("/auth/login");
            req.setRemoteAddr(clientIp);
            filter.doFilter(req, new MockHttpServletResponse(), new MockFilterChain());
        }

        MockHttpServletRequest blocked = new MockHttpServletRequest("POST", "/auth/login");
        blocked.setServletPath("/auth/login");
        blocked.setRemoteAddr(clientIp);
        MockHttpServletResponse blockedResponse = new MockHttpServletResponse();
        MockFilterChain blockedChain = new MockFilterChain();

        filter.doFilter(blocked, blockedResponse, blockedChain);

        assertThat(blockedResponse.getStatus()).isEqualTo(429);
        assertThat(blockedResponse.getContentType()).contains("application/json");

        String body = blockedResponse.getContentAsString();
        assertThat(body).contains("\"status\":429");
        assertThat(body).contains("\"message\"");
    }
}
