package com.example.demo.service;

import com.example.demo.model.Notification;
import com.example.demo.model.User;
import com.example.demo.repository.NotificationRepository;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final JavaMailSender mailSender;

    public NotificationService(NotificationRepository notificationRepository, JavaMailSender mailSender) {
        this.notificationRepository = notificationRepository;
        this.mailSender = mailSender;
    }

    @Transactional
    public void sendNotification(User user, String title, String message) {
        // 1. Save In-App Notification
        Notification notification = new Notification(user, title, message, "IN_APP");
        notificationRepository.save(notification);

        // 2. Simulate Email (Use JavaMailSender fallback gracefully)
        try {
            SimpleMailMessage mailMessage = new SimpleMailMessage();
            mailMessage.setTo(user.getEmail());
            mailMessage.setSubject("P2I Platform: " + title);
            mailMessage.setText(message);
            // In local/production, this would send an actual email but we'll try/catch to avoid breaking build
            mailSender.send(mailMessage);
            System.out.println("REAL EMAIL SENT to " + user.getEmail() + ": " + title);
        } catch (Exception e) {
            System.out.println("[EMAIL NOTIFICATION FALLBACK] Send email to " + user.getEmail() + " failed: " + e.getMessage());
            System.out.println("[EMAIL CONTENT] Title: " + title + " | Message: " + message);
        }

        // 3. Simulate WhatsApp Notification
        String phone = user.getPhone();
        if (phone != null && !phone.trim().isEmpty()) {
            System.out.println("[WHATSAPP NOTIFICATION SIMULATION] Sent message to " + phone + ":");
            System.out.println("--------------------------------------------------");
            System.out.println("P2I Notification: " + title);
            System.out.println("Message: " + message);
            System.out.println("--------------------------------------------------");
        }
    }

    public List<Notification> getNotificationsForUser(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<Notification> getUnreadNotificationsForUser(Long userId) {
        return notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        List<Notification> unread = notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
        for (Notification n : unread) {
            n.setRead(true);
        }
        notificationRepository.saveAll(unread);
    }
}
