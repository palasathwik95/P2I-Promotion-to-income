package com.example.demo.service;

import com.example.demo.model.Booking;
import com.example.demo.model.BookingStatus;
import com.example.demo.model.CreatorProfile;
import com.example.demo.model.Role;
import com.example.demo.repository.BookingRepository;
import com.example.demo.repository.CreatorProfileRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final CreatorProfileRepository creatorProfileRepository;

    public AnalyticsService(
            BookingRepository bookingRepository,
            UserRepository userRepository,
            CreatorProfileRepository creatorProfileRepository
    ) {
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.creatorProfileRepository = creatorProfileRepository;
    }

    public Map<String, Object> getAdminAnalytics() {
        Map<String, Object> stats = new HashMap<>();

        List<Booking> bookings = bookingRepository.findAll();
        List<CreatorProfile> creators = creatorProfileRepository.findAll();
        long customerCount = userRepository.findByRole(Role.CUSTOMER).size();

        // 1. KPI Cards
        double totalRevenue = bookings.stream()
                .filter(b -> "PAID".equalsIgnoreCase(b.getPaymentStatus()))
                .mapToDouble(Booking::getAmount)
                .sum();

        long totalBookings = bookings.size();
        long pendingBookings = bookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.PENDING || b.getStatus() == BookingStatus.PAYMENT_SUCCESSFUL)
                .count();

        long completedProjects = bookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.COMPLETED)
                .count();

        stats.put("totalRevenue", totalRevenue);
        stats.put("totalBookings", totalBookings);
        stats.put("pendingBookings", pendingBookings);
        stats.put("completedProjects", completedProjects);
        stats.put("totalCustomers", customerCount);
        stats.put("totalCreators", creators.size());

        // 2. Service popularity distribution
        Map<String, Long> popularServices = bookings.stream()
                .collect(Collectors.groupingBy(
                        b -> b.getServicePackage().getServiceName(),
                        Collectors.counting()
                ));
        stats.put("popularServices", popularServices);

        // 3. Creator rankings (Top contributors)
        List<Map<String, Object>> creatorPerformance = creators.stream()
                .map(cp -> {
                    Map<String, Object> cMap = new HashMap<>();
                    cMap.put("id", cp.getId());
                    cMap.put("name", cp.getUser().getName());
                    cMap.put("rating", cp.getRating());
                    cMap.put("completed", cp.getCompletedProjects());
                    cMap.put("specialization", cp.getSpecialization());
                    return cMap;
                })
                .sorted((c1, c2) -> Integer.compare((int) c2.get("completed"), (int) c1.get("completed")))
                .limit(5)
                .collect(Collectors.toList());
        stats.put("creatorPerformance", creatorPerformance);

        // 4. Monthly breakdowns (simulated for charts)
        double[] monthlyRevenue = {12000, 19000, 32000, 5000, 24000, 48000, 62000};
        int[] monthlyBookings = {15, 25, 38, 12, 28, 54, 76};
        stats.put("monthlyRevenue", monthlyRevenue);
        stats.put("monthlyBookings", monthlyBookings);
        stats.put("labels", new String[]{"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"});

        // 5. Recent lists
        stats.put("recentBookings", bookings.stream()
                .sorted((b1, b2) -> b2.getBookingDate().compareTo(b1.getBookingDate()))
                .limit(5)
                .map(b -> {
                    Map<String, Object> bMap = new HashMap<>();
                    bMap.put("id", b.getId());
                    bMap.put("customerName", b.getCustomer().getName());
                    bMap.put("packageName", b.getServicePackage().getServiceName() + " - " + b.getServicePackage().getName());
                    bMap.put("amount", b.getAmount());
                    bMap.put("status", b.getStatus().name());
                    bMap.put("date", b.getShootDate());
                    return bMap;
                }).collect(Collectors.toList()));

        return stats;
    }
}
