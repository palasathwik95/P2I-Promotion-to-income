package com.example.demo.repository;

import com.example.demo.model.Booking;
import com.example.demo.model.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByCustomerIdOrderByBookingDateDesc(Long customerId);
    List<Booking> findByCreatorIdOrderByBookingDateDesc(Long creatorId);
    List<Booking> findByStatus(BookingStatus status);
}
