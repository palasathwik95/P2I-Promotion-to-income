package com.example.demo.controller;

import com.example.demo.model.Booking;
import com.example.demo.model.CreatorProfile;
import com.example.demo.service.AnalyticsService;
import com.example.demo.service.BookingService;
import com.example.demo.service.CreatorService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AnalyticsService analyticsService;
    private final CreatorService creatorService;
    private final BookingService bookingService;

    public AdminController(
            AnalyticsService analyticsService,
            CreatorService creatorService,
            BookingService bookingService
    ) {
        this.analyticsService = analyticsService;
        this.creatorService = creatorService;
        this.bookingService = bookingService;
    }

    @GetMapping("/analytics")
    public ResponseEntity<?> getDashboardAnalytics() {
        return ResponseEntity.ok(analyticsService.getAdminAnalytics());
    }

    @GetMapping("/creators/pending")
    public ResponseEntity<List<CreatorProfile>> getPendingCreators() {
        return ResponseEntity.ok(creatorService.getPendingApprovalCreators());
    }

    @PostMapping("/creators/{id}/approve")
    public ResponseEntity<?> approveCreator(@PathVariable("id") Long id) {
        CreatorProfile approved = creatorService.approveCreator(id);
        return ResponseEntity.ok(Map.of("message", "Creator approved successfully.", "profile", approved));
    }

    @PostMapping("/bookings/{id}/assign")
    public ResponseEntity<?> assignCreator(
            @PathVariable("id") Long id,
            @RequestBody Map<String, Long> payload
    ) {
        Long creatorId = payload.get("creatorId");
        if (creatorId == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "creatorId is required"));
        }
        Booking assigned = bookingService.assignCreator(id, creatorId);
        return ResponseEntity.ok(assigned);
    }

    @GetMapping("/bookings")
    public ResponseEntity<List<Booking>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }
}
