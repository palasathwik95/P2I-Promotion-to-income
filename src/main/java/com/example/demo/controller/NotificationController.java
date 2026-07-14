package com.example.demo.controller;

import com.example.demo.model.Notification;
import com.example.demo.repository.NotificationRepository;
import com.example.demo.security.UserDetailsImpl;
import com.example.demo.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final NotificationRepository notificationRepository;

    public NotificationController(
            NotificationService notificationService,
            NotificationRepository notificationRepository
    ) {
        this.notificationService = notificationService;
        this.notificationRepository = notificationRepository;
    }

    // GET all notifications for the authenticated user (most recent first)
    @GetMapping
    public ResponseEntity<List<Notification>> getMyNotifications(
            @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        Long userId = userDetails.getUser().getId();
        List<Notification> notifications = notificationService.getNotificationsForUser(userId);
        return ResponseEntity.ok(notifications);
    }

    // GET unread count only
    @GetMapping("/unread-count")
    public ResponseEntity<?> getUnreadCount(
            @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        Long userId = userDetails.getUser().getId();
        List<Notification> unread = notificationService.getUnreadNotificationsForUser(userId);
        return ResponseEntity.ok(Map.of("count", unread.size()));
    }

    // POST mark a single notification as read
    @PostMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable("id") Long id
    ) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (!notification.getUser().getId().equals(userDetails.getUser().getId())) {
            return ResponseEntity.status(403).body(Map.of("message", "Forbidden"));
        }

        notification.setRead(true);
        notificationRepository.save(notification);
        return ResponseEntity.ok(Map.of("message", "Marked as read."));
    }

    // POST mark ALL notifications as read
    @PostMapping("/read-all")
    public ResponseEntity<?> markAllAsRead(
            @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        Long userId = userDetails.getUser().getId();
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok(Map.of("message", "All notifications marked as read."));
    }
}
