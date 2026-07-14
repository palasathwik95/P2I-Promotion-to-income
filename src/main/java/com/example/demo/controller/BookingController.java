package com.example.demo.controller;

import com.example.demo.dto.BookingRequest;
import com.example.demo.dto.ReviewRequest;
import com.example.demo.model.*;
import com.example.demo.repository.ReviewRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.security.UserDetailsImpl;
import com.example.demo.service.BookingService;
import com.example.demo.service.NotificationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;
    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public BookingController(
            BookingService bookingService,
            ReviewRepository reviewRepository,
            UserRepository userRepository,
            NotificationService notificationService
    ) {
        this.bookingService = bookingService;
        this.reviewRepository = reviewRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    @PostMapping
    public ResponseEntity<?> createBooking(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody BookingRequest request
    ) {
        Long customerId = userDetails.getUser().getId();
        Booking booking = bookingService.createBooking(customerId, request);
        return ResponseEntity.ok(booking);
    }

    @PostMapping("/{id}/pay")
    public ResponseEntity<?> confirmPayment(
            @PathVariable("id") Long id,
            @RequestBody Map<String, String> payload
    ) {
        String paymentId = payload.getOrDefault("paymentId", "pay_" + UUID.randomUUID().toString().substring(0, 12));
        Booking confirmed = bookingService.confirmPayment(id, paymentId);
        return ResponseEntity.ok(confirmed);
    }

    @PostMapping("/{id}/accept")
    public ResponseEntity<?> acceptBooking(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable("id") Long id
    ) {
        Long creatorId = userDetails.getUser().getId();
        Booking accepted = bookingService.acceptBooking(creatorId, id);
        return ResponseEntity.ok(accepted);
    }

    @PostMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable("id") Long id,
            @RequestBody Map<String, String> payload
    ) {
        Long creatorId = userDetails.getUser().getId();
        BookingStatus status = BookingStatus.valueOf(payload.get("status").toUpperCase());
        Booking updated = bookingService.updateStatus(creatorId, id, status);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{id}/deliver")
    public ResponseEntity<?> deliverWork(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable("id") Long id,
            @RequestBody Map<String, String> payload
    ) {
        Long creatorId = userDetails.getUser().getId();
        String url = payload.get("deliverablesUrl");
        if (url == null || url.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Deliverables URL is required."));
        }
        Booking delivered = bookingService.deliverWork(creatorId, id, url);
        return ResponseEntity.ok(delivered);
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<?> completeBooking(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable("id") Long id
    ) {
        Long customerId = userDetails.getUser().getId();
        Booking completed = bookingService.completeBooking(customerId, id);
        return ResponseEntity.ok(completed);
    }

    @GetMapping("/customer")
    public ResponseEntity<?> getCustomerBookings(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        Long customerId = userDetails.getUser().getId();
        List<Booking> list = bookingService.getBookingsForCustomer(customerId);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/creator")
    public ResponseEntity<?> getCreatorBookings(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        Long creatorId = userDetails.getUser().getId();
        List<Booking> list = bookingService.getBookingsForCreator(creatorId);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getBookingDetails(@PathVariable("id") Long id) {
        Booking booking = bookingService.getBookingById(id);
        return ResponseEntity.ok(booking);
    }

    @PostMapping("/{id}/reviews")
    public ResponseEntity<?> writeReview(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable("id") Long id,
            @Valid @RequestBody ReviewRequest request
    ) {
        Booking booking = bookingService.getBookingById(id);
        if (!booking.getCustomer().getId().equals(userDetails.getUser().getId())) {
            return ResponseEntity.status(403).body(Map.of("message", "Forbidden"));
        }

        if (booking.getStatus() != BookingStatus.COMPLETED && booking.getStatus() != BookingStatus.DELIVERED) {
            return ResponseEntity.badRequest().body(Map.of("message", "Can only review after deliverables are uploaded."));
        }

        if (reviewRepository.findByBookingId(id).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "You already reviewed this booking."));
        }

        Review review = new Review();
        review.setBooking(booking);
        review.setCustomer(booking.getCustomer());
        review.setCreator(booking.getCreator());
        review.setRating(request.getRating());
        review.setComment(request.getComment());
        review.setImagesUrl(request.getImagesUrl());
        review.setCreatedAt(LocalDateTime.now());

        Review savedReview = reviewRepository.save(review);

        // Notify creator
        notificationService.sendNotification(
                booking.getCreator(),
                "New Rating & Review Received",
                "Customer " + booking.getCustomer().getName() + " left you a " + request.getRating() + "-star review."
        );

        return ResponseEntity.ok(savedReview);
    }

    @GetMapping("/invoice/{id}")
    public ResponseEntity<?> downloadInvoice(@PathVariable("id") Long id) {
        // Return structured mock PDF invoice details
        Booking booking = bookingService.getBookingById(id);
        return ResponseEntity.ok(Map.of(
                "company", "P2I (Promotion To Income) Inc.",
                "invoiceNo", "INV-2026-" + booking.getId(),
                "date", booking.getBookingDate().toString(),
                "customer", booking.getCustomer().getName(),
                "customerEmail", booking.getCustomer().getEmail(),
                "service", booking.getServicePackage().getServiceName(),
                "package", booking.getServicePackage().getName(),
                "amount", booking.getAmount(),
                "paymentId", booking.getPaymentId() != null ? booking.getPaymentId() : "N/A",
                "status", booking.getPaymentStatus()
        ));
    }
}
