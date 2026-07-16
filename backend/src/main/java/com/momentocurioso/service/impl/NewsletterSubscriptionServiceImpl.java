package com.momentocurioso.service.impl;

import com.momentocurioso.dto.request.SubscribeNewsletterRequest;
import com.momentocurioso.dto.response.NewsletterMessageResponse;
import com.momentocurioso.dto.response.NewsletterSubscriberResponse;
import com.momentocurioso.dto.response.PageResponse;
import com.momentocurioso.entity.NewsletterSubscriber;
import com.momentocurioso.entity.NewsletterSubscriberStatus;
import com.momentocurioso.repository.NewsletterSubscriberRepository;
import com.momentocurioso.service.NewsletterEmailService;
import com.momentocurioso.service.NewsletterSubscriptionService;
import com.momentocurioso.service.NewsletterTokenService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.Locale;
import java.util.UUID;

@Service
public class NewsletterSubscriptionServiceImpl implements NewsletterSubscriptionService {

    private static final String SUBSCRIPTION_MESSAGE =
            "Se o endereço for válido, enviaremos as instruções para concluir a inscrição.";

    private final NewsletterSubscriberRepository subscriberRepository;
    private final NewsletterEmailService emailService;
    private final NewsletterTokenService tokenService;

    public NewsletterSubscriptionServiceImpl(NewsletterSubscriberRepository subscriberRepository,
                                             NewsletterEmailService emailService,
                                             NewsletterTokenService tokenService) {
        this.subscriberRepository = subscriberRepository;
        this.emailService = emailService;
        this.tokenService = tokenService;
    }

    @Override
    @Transactional
    public NewsletterMessageResponse subscribe(SubscribeNewsletterRequest request) {
        if (request.website() != null && !request.website().isBlank()) {
            return new NewsletterMessageResponse(SUBSCRIPTION_MESSAGE);
        }

        String email = request.email().trim().toLowerCase(Locale.ROOT);
        NewsletterSubscriber subscriber = subscriberRepository.findByEmailIgnoreCase(email)
                .orElseGet(NewsletterSubscriber::new);

        if (subscriber.getStatus() == NewsletterSubscriberStatus.ACTIVE) {
            return new NewsletterMessageResponse(SUBSCRIPTION_MESSAGE);
        }

        String confirmationToken = newToken();
        prepareSubscription(subscriber, email, request.name(), confirmationToken);
        subscriberRepository.save(subscriber);

        if (emailService.isEnabled()) {
            emailService.sendConfirmation(subscriber, confirmationToken);
        } else {
            activate(subscriber);
            subscriberRepository.save(subscriber);
        }
        return new NewsletterMessageResponse(SUBSCRIPTION_MESSAGE);
    }

    @Override
    @Transactional
    public NewsletterMessageResponse confirm(String token) {
        NewsletterSubscriber subscriber = subscriberRepository.findByConfirmationTokenHash(hash(token))
                .orElseThrow(() -> new EntityNotFoundException("Link de confirmação inválido ou expirado"));
        activate(subscriber);
        subscriberRepository.save(subscriber);
        return new NewsletterMessageResponse("Inscrição confirmada. Sua próxima dose de curiosidade chegará por e-mail.");
    }

    @Override
    @Transactional
    public NewsletterMessageResponse unsubscribe(String token) {
        NewsletterSubscriber subscriber = subscriberRepository.findById(tokenService.readSubscriberId(token))
                .orElseThrow(() -> new EntityNotFoundException("Link de cancelamento inválido"));
        subscriber.setStatus(NewsletterSubscriberStatus.UNSUBSCRIBED);
        subscriber.setConfirmationTokenHash(null);
        subscriber.setUnsubscribedAt(LocalDateTime.now());
        subscriberRepository.save(subscriber);
        return new NewsletterMessageResponse("Inscrição cancelada. Você não receberá novos e-mails.");
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<NewsletterSubscriberResponse> list(NewsletterSubscriberStatus status, Pageable pageable) {
        Page<NewsletterSubscriber> page = status == null
                ? subscriberRepository.findAll(pageable)
                : subscriberRepository.findAllByStatus(status, pageable);
        return PageResponse.from(page.map(NewsletterSubscriberResponse::from));
    }

    @Override
    public long countActive() {
        return subscriberRepository.countByStatus(NewsletterSubscriberStatus.ACTIVE);
    }

    @Override
    public void delete(Long id) {
        if (!subscriberRepository.existsById(id)) {
            throw new EntityNotFoundException("Inscrito não encontrado: " + id);
        }
        subscriberRepository.deleteById(id);
    }

    private void prepareSubscription(NewsletterSubscriber subscriber, String email, String name,
                                     String confirmationToken) {
        subscriber.setEmail(email);
        subscriber.setName(name == null || name.isBlank() ? null : name.trim());
        subscriber.setStatus(NewsletterSubscriberStatus.PENDING);
        subscriber.setConfirmationTokenHash(hash(confirmationToken));
        subscriber.setSubscribedAt(LocalDateTime.now());
        subscriber.setConfirmedAt(null);
        subscriber.setUnsubscribedAt(null);
    }

    private void activate(NewsletterSubscriber subscriber) {
        subscriber.setStatus(NewsletterSubscriberStatus.ACTIVE);
        subscriber.setConfirmationTokenHash(null);
        subscriber.setConfirmedAt(LocalDateTime.now());
        subscriber.setUnsubscribedAt(null);
    }

    private String newToken() {
        return UUID.randomUUID().toString().replace("-", "")
                + UUID.randomUUID().toString().replace("-", "");
    }

    static String hash(String value) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(value.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 indisponível", ex);
        }
    }
}
