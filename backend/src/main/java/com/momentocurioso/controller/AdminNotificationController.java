package com.momentocurioso.controller;

import com.momentocurioso.dto.response.NotificationCountsResponse;
import com.momentocurioso.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin/notifications")
public class AdminNotificationController {

    private final NotificationService notificationService;

    public AdminNotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping("/counts")
    public ResponseEntity<NotificationCountsResponse> getCounts() {
        return ResponseEntity.ok(notificationService.getCounts());
    }
}
