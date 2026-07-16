package com.example.demo.repository;

import com.example.demo.model.CreatorProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CreatorProfileRepository extends JpaRepository<CreatorProfile, Long> {
    List<CreatorProfile> findByIsApproved(boolean isApproved);
    Optional<CreatorProfile> findByUserId(Long userId);
    
    @Query("SELECT cp FROM CreatorProfile cp WHERE cp.isApproved = true AND " +
           "(LOWER(cp.user.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(cp.specialization) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(cp.location) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(cp.skills) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<CreatorProfile> searchApprovedCreators(@Param("search") String search);
}
