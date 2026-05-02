package com.momentocurioso.service.strategy;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.momentocurioso.entity.AiProvider;
import com.momentocurioso.entity.AiProviderType;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.web.client.RestClient;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;

// ── BUG-016: ClaudeStrategy HTTP error handlers ───────────────────────────────
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class ClaudeStrategyTest {

    @Mock
    private RestClient restClient;

    private ClaudeStrategy buildStrategy() {
        AiProvider provider = new AiProvider();
        provider.setName("Claude");
        provider.setType(AiProviderType.CLAUDE);
        provider.setModel("claude-sonnet-4-6");
        provider.setApiKey("test-api-key");
        return new ClaudeStrategy(provider, new ObjectMapper(), restClient);
    }

    private void stubChainToThrow(RuntimeException toThrow) {
        var uriSpec = mock(RestClient.RequestBodyUriSpec.class);
        var bodySpec = mock(RestClient.RequestBodySpec.class);
        var responseSpec = mock(RestClient.ResponseSpec.class);

        doReturn(uriSpec).when(restClient).post();
        doReturn(bodySpec).when(uriSpec).uri(anyString());
        doReturn(bodySpec).when(bodySpec).body(any(Object.class));
        doReturn(responseSpec).when(bodySpec).retrieve();
        doReturn(responseSpec).when(responseSpec).onStatus(any(), any());
        doThrow(toThrow).when(responseSpec).body(any(Class.class));
    }

    @Test
    void generate_when429_throwsRateLimitMessage() {
        stubChainToThrow(new RuntimeException("Claude API: rate limit exceeded, try again later (429)"));

        assertThatThrownBy(() -> buildStrategy().generate("test prompt"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("rate limit");
    }

    @Test
    void generate_when401_throwsUnauthorizedMessage() {
        stubChainToThrow(new RuntimeException("Claude API: unauthorized — check your API key (401)"));

        assertThatThrownBy(() -> buildStrategy().generate("test prompt"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("401");
    }

    @Test
    void generate_when500_throwsServerErrorMessage() {
        stubChainToThrow(new RuntimeException("Claude API server error: 500 INTERNAL_SERVER_ERROR"));

        assertThatThrownBy(() -> buildStrategy().generate("test prompt"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("500");
    }
}
