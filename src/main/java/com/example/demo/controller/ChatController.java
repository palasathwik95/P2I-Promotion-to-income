package com.example.demo.controller;

import com.example.demo.model.Message;
import com.example.demo.security.UserDetailsImpl;
import com.example.demo.service.ChatService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chats")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<List<Message>> getChatHistory(@PathVariable("bookingId") Long bookingId) {
        List<Message> history = chatService.getChatHistory(bookingId);
        return ResponseEntity.ok(history);
    }

    @PostMapping("/booking/{bookingId}")
    public ResponseEntity<?> sendMessage(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable("bookingId") Long bookingId,
            @RequestBody Map<String, String> payload
    ) {
        Long senderId = userDetails.getUser().getId();
        String content = payload.get("content");
        String mediaUrl = payload.get("mediaUrl");
        String mediaType = payload.get("mediaType");

        if (content == null || content.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Message content cannot be empty."));
        }

        Message msg = chatService.sendMessage(bookingId, senderId, content, mediaUrl, mediaType);
        return ResponseEntity.ok(msg);
    }
}
