package com.example.demo.controller;

import com.example.demo.dto.ProfileUpdateRequest;
import com.example.demo.model.CreatorProfile;
import com.example.demo.model.PortfolioItem;
import com.example.demo.model.User;
import com.example.demo.repository.PortfolioItemRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.security.UserDetailsImpl;
import com.example.demo.service.CreatorService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/creators")
public class CreatorController {

    private final CreatorService creatorService;
    private final UserRepository userRepository;
    private final PortfolioItemRepository portfolioItemRepository;

    public CreatorController(
            CreatorService creatorService,
            UserRepository userRepository,
            PortfolioItemRepository portfolioItemRepository
    ) {
        this.creatorService = creatorService;
        this.userRepository = userRepository;
        this.portfolioItemRepository = portfolioItemRepository;
    }

    @GetMapping("/public")
    public ResponseEntity<List<CreatorProfile>> getApprovedCreators() {
        return ResponseEntity.ok(creatorService.getApprovedCreators());
    }

    @GetMapping("/public/search")
    public ResponseEntity<List<CreatorProfile>> searchCreators(@RequestParam(value = "q", required = false) String query) {
        return ResponseEntity.ok(creatorService.searchCreators(query));
    }

    @GetMapping("/public/{id}")
    public ResponseEntity<?> getCreatorById(@PathVariable("id") Long id) {
        CreatorProfile profile = creatorService.getCreatorProfile(id)
                .orElseThrow(() -> new RuntimeException("Creator not found"));
        List<PortfolioItem> portfolio = creatorService.getPortfolioItems(id);

        Map<String, Object> details = new HashMap<>();
        details.put("profile", profile);
        details.put("portfolio", portfolio);
        return ResponseEntity.ok(details);
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody ProfileUpdateRequest request
    ) {
        Long userId = userDetails.getUser().getId();

        // Update user properties if named or phoned
        User user = userDetails.getUser();
        if (request.getName() != null) {
            user.setName(request.getName());
            userRepository.save(user);
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
            userRepository.save(user);
        }

        CreatorProfile cp = new CreatorProfile();
        cp.setSpecialization(request.getSpecialization());
        cp.setExperience(request.getExperience());
        cp.setSkills(request.getSkills());
        cp.setLanguages(request.getLanguages());
        cp.setEquipment(request.getEquipment());
        cp.setLocation(request.getLocation());
        cp.setBio(request.getBio());
        cp.setHourlyRate(request.getHourlyRate());

        CreatorProfile existingProfile = creatorService.getCreatorProfileByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Creator profile not found"));
        CreatorProfile updated = creatorService.updateProfile(existingProfile.getId(), cp);
        return ResponseEntity.ok(Map.of("message", "Profile updated successfully.", "profile", updated));
    }

    @PostMapping("/portfolio")
    public ResponseEntity<?> addPortfolioItem(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody PortfolioItem item
    ) {
        Long creatorId = userDetails.getUser().getId();
        PortfolioItem saved = creatorService.addPortfolioItem(creatorId, item);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/portfolio")
    public ResponseEntity<List<PortfolioItem>> getMyPortfolio(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        Long creatorId = userDetails.getUser().getId();
        return ResponseEntity.ok(creatorService.getPortfolioItems(creatorId));
    }

    @DeleteMapping("/portfolio/{id}")
    public ResponseEntity<?> deletePortfolioItem(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable("id") Long id
    ) {
        PortfolioItem item = portfolioItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item not found"));
        
        if (!item.getCreator().getId().equals(userDetails.getUser().getId())) {
            return ResponseEntity.status(403).body(Map.of("message", "Forbidden"));
        }

        portfolioItemRepository.delete(item);
        return ResponseEntity.ok(Map.of("message", "Item deleted successfully."));
    }

    @GetMapping("/earnings")
    public ResponseEntity<?> getCreatorEarnings(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        // Return dummy numbers + completed projects
        Long creatorId = userDetails.getUser().getId();
        CreatorProfile cp = creatorService.getCreatorProfile(creatorId)
                .orElseThrow(() -> new RuntimeException("Creator not found"));

        double walletBalance = cp.getCompletedProjects() * cp.getHourlyRate() * 4.0; 
        double totalEarnings = walletBalance * 1.25;

        Map<String, Object> earnings = new HashMap<>();
        earnings.put("walletBalance", walletBalance);
        earnings.put("totalEarnings", totalEarnings);
        earnings.put("completedProjects", cp.getCompletedProjects());
        earnings.put("rating", cp.getRating());

        return ResponseEntity.ok(earnings);
    }
}
