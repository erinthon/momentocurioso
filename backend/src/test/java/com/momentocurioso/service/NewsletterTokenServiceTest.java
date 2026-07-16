package com.momentocurioso.service;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class NewsletterTokenServiceTest {

    private final NewsletterTokenService service = new NewsletterTokenService("a-long-test-secret");

    @Test
    void createsAndReadsSignedToken() {
        String token = service.createUnsubscribeToken(42L);
        assertThat(service.readSubscriberId(token)).isEqualTo(42L);
    }

    @Test
    void rejectsTamperedToken() {
        String token = service.createUnsubscribeToken(42L).replaceFirst("42", "43");
        assertThatThrownBy(() -> service.readSubscriberId(token))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
