package com.momentocurioso.service;

import com.momentocurioso.dto.request.SubscribeNewsletterRequest;
import com.momentocurioso.entity.NewsletterSubscriber;
import com.momentocurioso.entity.NewsletterSubscriberStatus;
import com.momentocurioso.repository.NewsletterSubscriberRepository;
import com.momentocurioso.service.impl.NewsletterSubscriptionServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NewsletterSubscriptionServiceImplTest {

    @Mock NewsletterSubscriberRepository subscriberRepository;
    @Mock NewsletterEmailService emailService;
    @Mock NewsletterTokenService tokenService;
    @InjectMocks NewsletterSubscriptionServiceImpl service;

    @Test
    void subscribeActivatesImmediatelyWhenMailIsDisabled() {
        when(subscriberRepository.findByEmailIgnoreCase("leitor@example.com")).thenReturn(Optional.empty());
        when(subscriberRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(emailService.isEnabled()).thenReturn(false);

        service.subscribe(new SubscribeNewsletterRequest(" Leitor@Example.com ", " Ana ", true, ""));

        NewsletterSubscriber saved = captureLastSaved();
        assertThat(saved.getEmail()).isEqualTo("leitor@example.com");
        assertThat(saved.getName()).isEqualTo("Ana");
        assertThat(saved.getStatus()).isEqualTo(NewsletterSubscriberStatus.ACTIVE);
        assertThat(saved.getConfirmationTokenHash()).isNull();
        verify(emailService, never()).sendConfirmation(any(), any());
    }

    @Test
    void subscribeKeepsPendingAndSendsConfirmationWhenMailIsEnabled() {
        when(subscriberRepository.findByEmailIgnoreCase("leitor@example.com")).thenReturn(Optional.empty());
        when(subscriberRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(emailService.isEnabled()).thenReturn(true);

        service.subscribe(new SubscribeNewsletterRequest("leitor@example.com", null, true, null));

        verify(emailService).sendConfirmation(any(NewsletterSubscriber.class), argThat(token -> token.length() == 64));
        NewsletterSubscriber saved = captureLastSaved();
        assertThat(saved.getStatus()).isEqualTo(NewsletterSubscriberStatus.PENDING);
        assertThat(saved.getConfirmationTokenHash()).hasSize(64);
    }

    @Test
    void confirmActivatesSubscriber() throws Exception {
        NewsletterSubscriber subscriber = new NewsletterSubscriber();
        subscriber.setStatus(NewsletterSubscriberStatus.PENDING);
        String token = "confirmation-token";
        String hash = HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256")
                .digest(token.getBytes(StandardCharsets.UTF_8)));
        when(subscriberRepository.findByConfirmationTokenHash(hash)).thenReturn(Optional.of(subscriber));

        service.confirm(token);

        assertThat(subscriber.getStatus()).isEqualTo(NewsletterSubscriberStatus.ACTIVE);
        assertThat(subscriber.getConfirmedAt()).isNotNull();
        verify(subscriberRepository).save(subscriber);
    }

    @Test
    void unsubscribeUsesSignedSubscriberId() {
        NewsletterSubscriber subscriber = new NewsletterSubscriber();
        subscriber.setId(7L);
        subscriber.setStatus(NewsletterSubscriberStatus.ACTIVE);
        when(tokenService.readSubscriberId("signed-token")).thenReturn(7L);
        when(subscriberRepository.findById(7L)).thenReturn(Optional.of(subscriber));

        service.unsubscribe("signed-token");

        assertThat(subscriber.getStatus()).isEqualTo(NewsletterSubscriberStatus.UNSUBSCRIBED);
        assertThat(subscriber.getUnsubscribedAt()).isNotNull();
    }

    @Test
    void honeypotDoesNotPersistOrSend() {
        service.subscribe(new SubscribeNewsletterRequest("bot@example.com", null, true, "spam-site"));

        verifyNoInteractions(subscriberRepository, emailService);
    }

    private NewsletterSubscriber captureLastSaved() {
        var captor = org.mockito.ArgumentCaptor.forClass(NewsletterSubscriber.class);
        verify(subscriberRepository, atLeastOnce()).save(captor.capture());
        return captor.getAllValues().get(captor.getAllValues().size() - 1);
    }
}
