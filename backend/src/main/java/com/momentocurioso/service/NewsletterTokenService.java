package com.momentocurioso.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;

@Service
public class NewsletterTokenService {

    private final byte[] secret;

    public NewsletterTokenService(@Value("${newsletter.token-secret}") String secret) {
        this.secret = secret.getBytes(StandardCharsets.UTF_8);
    }

    public String createUnsubscribeToken(Long subscriberId) {
        String value = subscriberId.toString();
        return value + "." + sign(value);
    }

    public Long readSubscriberId(String token) {
        String[] parts = token.split("\\.", 2);
        if (parts.length != 2 || !isValidSignature(parts[0], parts[1])) {
            throw new IllegalArgumentException("Link de cancelamento inválido");
        }
        try {
            return Long.valueOf(parts[0]);
        } catch (NumberFormatException ex) {
            throw new IllegalArgumentException("Link de cancelamento inválido");
        }
    }

    private boolean isValidSignature(String value, String providedSignature) {
        byte[] expected = sign(value).getBytes(StandardCharsets.UTF_8);
        byte[] provided = providedSignature.getBytes(StandardCharsets.UTF_8);
        return MessageDigest.isEqual(expected, provided);
    }

    private String sign(String value) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret, "HmacSHA256"));
            return Base64.getUrlEncoder().withoutPadding()
                    .encodeToString(mac.doFinal(value.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException | InvalidKeyException ex) {
            throw new IllegalStateException("Não foi possível assinar o token", ex);
        }
    }
}
