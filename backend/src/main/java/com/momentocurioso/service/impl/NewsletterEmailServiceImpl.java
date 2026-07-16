package com.momentocurioso.service.impl;

import com.momentocurioso.entity.NewsletterIssue;
import com.momentocurioso.entity.NewsletterSubscriber;
import com.momentocurioso.service.NewsletterEmailService;
import com.momentocurioso.service.NewsletterTokenService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailSendException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.web.util.HtmlUtils;

import java.io.UnsupportedEncodingException;

@Service
public class NewsletterEmailServiceImpl implements NewsletterEmailService {

    private final JavaMailSender mailSender;
    private final NewsletterTokenService tokenService;
    private final boolean enabled;
    private final String from;
    private final String fromName;
    private final String siteUrl;

    public NewsletterEmailServiceImpl(JavaMailSender mailSender,
                                      NewsletterTokenService tokenService,
                                      @Value("${newsletter.mail.enabled:false}") boolean enabled,
                                      @Value("${newsletter.mail.from}") String from,
                                      @Value("${newsletter.mail.from-name}") String fromName,
                                      @Value("${app.site-url}") String siteUrl) {
        this.mailSender = mailSender;
        this.tokenService = tokenService;
        this.enabled = enabled;
        this.from = from;
        this.fromName = fromName;
        this.siteUrl = siteUrl.replaceAll("/+$", "");
    }

    @Override
    public boolean isEnabled() {
        return enabled;
    }

    @Override
    public void sendConfirmation(NewsletterSubscriber subscriber, String rawToken) {
        String confirmationUrl = siteUrl + "/newsletter/confirm?token=" + rawToken;
        String name = subscriber.getName() == null ? "curioso(a)" : escape(subscriber.getName());
        String html = emailLayout("Confirme sua inscrição", """
                <p>Olá, %s!</p>
                <p>Falta só um passo para receber a <strong>Dose Semanal de Curiosidade</strong>.</p>
                <p style="margin:28px 0"><a href="%s" style="background:#0a7c38;color:#fff;padding:13px 22px;border-radius:8px;text-decoration:none;font-weight:700">Confirmar minha inscrição</a></p>
                <p style="color:#66756c;font-size:13px">Se você não solicitou a inscrição, ignore este e-mail.</p>
                """.formatted(name, confirmationUrl));
        send(subscriber.getEmail(), "Confirme sua inscrição no Momento Curioso", html);
    }

    @Override
    public void sendIssue(NewsletterIssue issue, NewsletterSubscriber subscriber) {
        String unsubscribeUrl = siteUrl + "/newsletter/unsubscribe?token="
                + tokenService.createUnsubscribeToken(subscriber.getId());
        send(subscriber.getEmail(), issue.getSubject(), renderIssue(issue, unsubscribeUrl));
    }

    @Override
    public String renderIssuePreview(NewsletterIssue issue) {
        return renderIssue(issue, siteUrl + "/newsletter/unsubscribe");
    }

    private String renderIssue(NewsletterIssue issue, String unsubscribeUrl) {
        String postUrl = siteUrl + "/blog/posts/" + issue.getMainPost().getSlug();
        String socialImageUrl = siteUrl + "/api/posts/" + issue.getMainPost().getSlug() + "/social-thumbnail";

        StringBuilder content = new StringBuilder();
        content.append("<div style=\"display:none;max-height:0;overflow:hidden\">")
                .append(escape(issue.getPreheader())).append("</div>")
                .append("<p style=\"color:#0a7c38;font-weight:700;text-transform:uppercase;letter-spacing:.08em;font-size:12px\">A melhor história da semana</p>")
                .append("<img src=\"").append(socialImageUrl).append("\" alt=\"\" style=\"width:100%;border-radius:10px\">")
                .append("<h1 style=\"font-size:28px;line-height:1.2\">").append(escape(issue.getMainPost().getTitle())).append("</h1>")
                .append("<p>").append(escape(issue.getMainPost().getSummary())).append("</p>")
                .append("<p><a href=\"").append(postUrl).append("\" style=\"color:#0a7c38;font-weight:700\">Ler a história completa →</a></p>")
                .append("<hr style=\"border:0;border-top:1px solid #dfe7e1;margin:32px 0\">")
                .append("<h2>Três curiosidades rápidas</h2><ol>")
                .append("<li style=\"margin-bottom:12px\">").append(escape(issue.getQuickFactOne())).append("</li>")
                .append("<li style=\"margin-bottom:12px\">").append(escape(issue.getQuickFactTwo())).append("</li>")
                .append("<li style=\"margin-bottom:12px\">").append(escape(issue.getQuickFactThree())).append("</li></ol>");

        appendLinkSection(content, "Vídeo recomendado", issue.getVideoTitle(), issue.getVideoUrl());
        appendLinkSection(content, "Livro ou produto no contexto", issue.getRecommendationTitle(), issue.getRecommendationUrl());
        content.append("<div style=\"background:#eef8f1;border-left:4px solid #0a7c38;padding:18px 20px;margin:28px 0\"><strong>Pergunta para a comunidade</strong><p style=\"margin-bottom:0\">")
                .append(escape(issue.getCommunityQuestion())).append("</p></div>")
                .append("<p style=\"color:#66756c;font-size:12px;text-align:center;margin-top:36px\">Você recebeu este e-mail porque se inscreveu no Momento Curioso. <a href=\"")
                .append(unsubscribeUrl).append("\" style=\"color:#66756c\">Cancelar inscrição</a>.</p>");

        return emailLayout("Dose Semanal de Curiosidade", content.toString());
    }

    private void appendLinkSection(StringBuilder content, String label, String title, String url) {
        if (title == null || url == null) {
            return;
        }
        content.append("<h2>").append(label).append("</h2><p><a href=\"")
                .append(escape(url)).append("\" style=\"color:#0a7c38;font-weight:700\">")
                .append(escape(title)).append(" →</a></p>");
    }

    private String emailLayout(String title, String content) {
        return """
                <!doctype html><html lang="pt-BR"><body style="margin:0;background:#f4f7f5;color:#183024;font-family:Arial,sans-serif">
                <div style="max-width:640px;margin:0 auto;padding:24px 14px">
                  <div style="background:#fff;border:1px solid #dfe7e1;border-radius:14px;padding:32px">
                    <div style="color:#0a7c38;font-size:20px;font-weight:800;margin-bottom:28px">Momento Curioso <span style="color:#66756c;font-size:12px;font-weight:400">· %s</span></div>
                    %s
                  </div>
                </div></body></html>
                """.formatted(escape(title), content);
    }

    private void send(String recipient, String subject, String html) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, "UTF-8");
            helper.setFrom(from, fromName);
            helper.setTo(recipient);
            helper.setSubject(subject);
            helper.setText(html, true);
            mailSender.send(message);
        } catch (MessagingException | UnsupportedEncodingException ex) {
            throw new MailSendException("Falha ao preparar e-mail da newsletter", ex);
        }
    }

    private String escape(String value) {
        return HtmlUtils.htmlEscape(value == null ? "" : value);
    }
}
