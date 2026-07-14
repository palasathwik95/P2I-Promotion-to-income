package com.example.demo.service;

import com.example.demo.dto.BookingRequest;
import com.example.demo.model.*;
import com.example.demo.repository.BookingRepository;
import com.example.demo.repository.CreatorProfileRepository;
import com.example.demo.repository.ServicePackageRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final CreatorProfileRepository creatorProfileRepository;
    private final ServicePackageRepository servicePackageRepository;
    private final NotificationService notificationService;

    public BookingService(
            BookingRepository bookingRepository,
            UserRepository userRepository,
            CreatorProfileRepository creatorProfileRepository,
            ServicePackageRepository servicePackageRepository,
            NotificationService notificationService
    ) {
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.creatorProfileRepository = creatorProfileRepository;
        this.servicePackageRepository = servicePackageRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public Booking createBooking(Long customerId, BookingRequest request) {
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        ServicePackage servicePackage = servicePackageRepository.findById(request.getPackageId())
                .orElseThrow(() -> new RuntimeException("Service package not found"));

        Booking booking = new Booking();
        booking.setCustomer(customer);
        booking.setServicePackage(servicePackage);
        booking.setShootDate(request.getShootDate());
        booking.setShootTime(request.getShootTime());
        booking.setLocation(request.getLocation());
        booking.setRequirements(request.getRequirements());
        booking.setReferenceImages(request.getReferenceImages());
        booking.setAmount(servicePackage.getPrice());
        booking.setStatus(BookingStatus.PENDING);
        booking.setPaymentStatus("PENDING");

        Booking savedBooking = bookingRepository.save(booking);

        // Notify customer
        notificationService.sendNotification(
                customer,
                "Booking Initiated",
                "Your booking for " + servicePackage.getServiceName() + " (" + servicePackage.getName() + ") has been initiated. Please complete the payment of $" + booking.getAmount() + " to finish booking."
        );

        // Notify admins (find a general admin or send system alert)
        List<User> admins = userRepository.findByRole(Role.ADMIN);
        for (User admin : admins) {
            notificationService.sendNotification(
                    admin,
                    "New Booking Initiated",
                    "A new booking ID " + savedBooking.getId() + " by " + customer.getName() + " has been initiated. Awaiting payment."
            );
        }

        return savedBooking;
    }

    @Transactional
    public Booking confirmPayment(Long bookingId, String paymentId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        booking.setPaymentStatus("PAID");
        booking.setPaymentId(paymentId);
        booking.setStatus(BookingStatus.CONFIRMED);
        booking.setInvoiceUrl("/api/bookings/invoice/" + bookingId);

        Booking savedBooking = bookingRepository.save(booking);

        // Notify customer
        notificationService.sendNotification(
                booking.getCustomer(),
                "Booking Confirmed",
                "We received your payment of $" + booking.getAmount() + " for booking ID " + booking.getId() + ". Project invoice is now generated. Our administrator is assigning a creator."
        );

        // Notify admins
        List<User> admins = userRepository.findByRole(Role.ADMIN);
        for (User admin : admins) {
            notificationService.sendNotification(
                    admin,
                    "Booking Payment Confirmed",
                    "Booking ID " + booking.getId() + " has been paid ($" + booking.getAmount() + "). Please assign a creator immediately."
            );
        }

        return savedBooking;
    }

    @Transactional
    public Booking assignCreator(Long bookingId, Long creatorId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        User creator = userRepository.findById(creatorId)
                .orElseThrow(() -> new RuntimeException("Creator not found"));

        booking.setCreator(creator);
        booking.setStatus(BookingStatus.CREATOR_ASSIGNED);

        Booking savedBooking = bookingRepository.save(booking);

        // Notify creator
        notificationService.sendNotification(
                creator,
                "New Project Assigned",
                "You have been assigned to Booking ID " + booking.getId() + " (" + booking.getServicePackage().getServiceName() + ") on " + booking.getShootDate() + " at " + booking.getShootTime() + ". Please review and accept the booking."
        );

        // Notify customer
        notificationService.sendNotification(
                booking.getCustomer(),
                "Creator Assigned",
                "Professional creator " + creator.getName() + " has been assigned to your shoot. Awaiting their acceptance."
        );

        return savedBooking;
    }

    @Transactional
    public Booking acceptBooking(Long creatorId, Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!booking.getCreator().getId().equals(creatorId)) {
            throw new RuntimeException("You are not authorized to accept this booking.");
        }

        booking.setStatus(BookingStatus.CREATOR_ACCEPTED);
        Booking savedBooking = bookingRepository.save(booking);

        // Notify customer
        notificationService.sendNotification(
                booking.getCustomer(),
                "Creator Accepted Your Shoot",
                "Great news! " + booking.getCreator().getName() + " has accepted your shoot booking. You can now chat and coordinate details."
        );

        return savedBooking;
    }

    @Transactional
    public Booking updateStatus(Long creatorId, Long bookingId, BookingStatus status) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!booking.getCreator().getId().equals(creatorId)) {
            throw new RuntimeException("Unauthorized status updates");
        }

        booking.setStatus(status);
        Booking savedBooking = bookingRepository.save(booking);

        notificationService.sendNotification(
                booking.getCustomer(),
                "Booking Status Update: " + status,
                "Your booking status has changed to " + status.name().toLowerCase().replace("_", " ") + "."
        );

        return savedBooking;
    }

    @Transactional
    public Booking deliverWork(Long creatorId, Long bookingId, String deliverablesUrl) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!booking.getCreator().getId().equals(creatorId)) {
            throw new RuntimeException("Unauthorized deliver action");
        }

        booking.setDeliverablesUrl(deliverablesUrl);
        booking.setStatus(BookingStatus.DELIVERED);
        Booking savedBooking = bookingRepository.save(booking);

        notificationService.sendNotification(
                booking.getCustomer(),
                "Shoot Deliverables Available!",
                "Your final files are now ready! Download files from: " + deliverablesUrl + ". Please mark the project as completed and leave a review."
        );

        return savedBooking;
    }

    @Transactional
    public Booking completeBooking(Long customerId, Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!booking.getCustomer().getId().equals(customerId)) {
            throw new RuntimeException("Unauthorized action");
        }

        booking.setStatus(BookingStatus.COMPLETED);
        Booking savedBooking = bookingRepository.save(booking);

        // Update creator completed project stats
        if (booking.getCreator() != null) {
            CreatorProfile profile = creatorProfileRepository.findById(booking.getCreator().getId())
                    .orElse(null);
            if (profile != null) {
                profile.setCompletedProjects(profile.getCompletedProjects() + 1);
                creatorProfileRepository.save(profile);
            }

            notificationService.sendNotification(
                    booking.getCreator(),
                    "Project Mark Completed",
                    "Customer " + booking.getCustomer().getName() + " has marked Booking ID " + booking.getId() + " as completed and successfully downloaded the files. You have earned your payout."
            );
        }

        return savedBooking;
    }

    public List<Booking> getBookingsForCustomer(Long customerId) {
        return bookingRepository.findByCustomerIdOrderByBookingDateDesc(customerId);
    }

    public List<Booking> getBookingsForCreator(Long creatorId) {
        return bookingRepository.findByCreatorIdOrderByBookingDateDesc(creatorId);
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public Booking getBookingById(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
    }
}
