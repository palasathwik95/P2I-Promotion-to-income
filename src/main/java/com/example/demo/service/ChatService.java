package com.example.demo.service;

import com.example.demo.model.Booking;
import com.example.demo.model.Message;
import com.example.demo.model.User;
import com.example.demo.repository.BookingRepository;
import com.example.demo.repository.MessageRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ChatService {

    private final MessageRepository messageRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public ChatService(
            MessageRepository messageRepository,
            BookingRepository bookingRepository,
            UserRepository userRepository,
            NotificationService notificationService
    ) {
        this.messageRepository = messageRepository;
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public Message sendMessage(Long bookingId, Long senderId, String content, String mediaUrl, String mediaType) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Sender not found"));

        // Validate sender is either customer or creator of this booking
        if (!booking.getCustomer().getId().equals(senderId) && 
            (booking.getCreator() == null || !booking.getCreator().getId().equals(senderId))) {
            throw new RuntimeException("Sender is not a participant of this booking chat");
        }

        Message message = new Message();
        message.setBooking(booking);
        message.setSender(sender);
        message.setContent(content);
        message.setMediaUrl(mediaUrl);
        message.setMediaType(mediaType);
        message.setCreatedAt(LocalDateTime.now());

        Message savedMessage = messageRepository.save(message);

        // Notify recipient
        User recipient = booking.getCustomer().getId().equals(senderId) ? booking.getCreator() : booking.getCustomer();
        if (recipient != null) {
            notificationService.sendNotification(
                    recipient,
                    "New Chat Message",
                    sender.getName() + " sent you a message: " + (content.length() > 30 ? content.substring(0, 27) + "..." : content)
            );
        }

        return savedMessage;
    }

    public List<Message> getChatHistory(Long bookingId) {
        return messageRepository.findByBookingIdOrderByCreatedAtAsc(bookingId);
    }
}
