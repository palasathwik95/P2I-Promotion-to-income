package com.example.demo.service;

import com.example.demo.model.CreatorProfile;
import com.example.demo.model.PortfolioItem;
import com.example.demo.model.User;
import com.example.demo.repository.CreatorProfileRepository;
import com.example.demo.repository.PortfolioItemRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class CreatorService {

    private final UserRepository userRepository;
    private final CreatorProfileRepository creatorProfileRepository;
    private final PortfolioItemRepository portfolioItemRepository;

    public CreatorService(
            UserRepository userRepository,
            CreatorProfileRepository creatorProfileRepository,
            PortfolioItemRepository portfolioItemRepository
    ) {
        this.userRepository = userRepository;
        this.creatorProfileRepository = creatorProfileRepository;
        this.portfolioItemRepository = portfolioItemRepository;
    }

    public List<CreatorProfile> getApprovedCreators() {
        return creatorProfileRepository.findByIsApproved(true);
    }

    public List<CreatorProfile> getPendingApprovalCreators() {
        return creatorProfileRepository.findByIsApproved(false);
    }

    public Optional<CreatorProfile> getCreatorProfile(Long id) {
        return creatorProfileRepository.findById(id);
    }

    public Optional<CreatorProfile> getCreatorProfileByUserId(Long userId) {
        return creatorProfileRepository.findByUserId(userId);
    }

    public List<CreatorProfile> searchCreators(String query) {
        if (query == null || query.trim().isEmpty()) {
            return getApprovedCreators();
        }
        return creatorProfileRepository.searchApprovedCreators(query);
    }

    @Transactional
    public CreatorProfile approveCreator(Long creatorId) {
        CreatorProfile profile = creatorProfileRepository.findById(creatorId)
                .orElseThrow(() -> new RuntimeException("Creator profile not found with ID: " + creatorId));
        profile.setApproved(true);
        return creatorProfileRepository.save(profile);
    }

    @Transactional
    public CreatorProfile updateProfile(Long creatorId, CreatorProfile updatedProfile) {
        CreatorProfile profile = creatorProfileRepository.findById(creatorId)
                .orElseThrow(() -> new RuntimeException("Creator profile not found with ID: " + creatorId));

        if (updatedProfile.getSpecialization() != null) profile.setSpecialization(updatedProfile.getSpecialization());
        if (updatedProfile.getExperience() != null) profile.setExperience(updatedProfile.getExperience());
        if (updatedProfile.getSkills() != null) profile.setSkills(updatedProfile.getSkills());
        if (updatedProfile.getLanguages() != null) profile.setLanguages(updatedProfile.getLanguages());
        if (updatedProfile.getEquipment() != null) profile.setEquipment(updatedProfile.getEquipment());
        if (updatedProfile.getLocation() != null) profile.setLocation(updatedProfile.getLocation());
        if (updatedProfile.getBio() != null) profile.setBio(updatedProfile.getBio());
        if (updatedProfile.getHourlyRate() != null) profile.setHourlyRate(updatedProfile.getHourlyRate());

        return creatorProfileRepository.save(profile);
    }

    @Transactional
    public PortfolioItem addPortfolioItem(Long creatorId, PortfolioItem item) {
        User creator = userRepository.findById(creatorId)
                .orElseThrow(() -> new RuntimeException("Creator user not found with ID: " + creatorId));
        item.setCreator(creator);
        item.setCreatedAt(LocalDateTime.now());
        return portfolioItemRepository.save(item);
    }

    public List<PortfolioItem> getPortfolioItems(Long creatorId) {
        return portfolioItemRepository.findByCreatorIdOrderByCreatedAtDesc(creatorId);
    }
}
