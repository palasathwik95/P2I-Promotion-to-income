package com.example.demo.service;

import com.example.demo.model.*;
import com.example.demo.repository.*;
import jakarta.annotation.PostConstruct;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Arrays;

@Service
public class InitializationService {

    private final UserRepository userRepository;
    private final CreatorProfileRepository creatorProfileRepository;
    private final ServicePackageRepository servicePackageRepository;
    private final PasswordEncoder passwordEncoder;

    public InitializationService(
            UserRepository userRepository,
            CreatorProfileRepository creatorProfileRepository,
            ServicePackageRepository servicePackageRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.creatorProfileRepository = creatorProfileRepository;
        this.servicePackageRepository = servicePackageRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostConstruct
    public void init() {
        // 1. Seed Packages if empty
        if (servicePackageRepository.count() == 0) {
            seedPackages();
        }

        // 2. Seed Users if empty
        if (userRepository.count() == 0) {
            seedUsers();
        }
    }

    private void seedPackages() {
        // Photography
        servicePackageRepository.save(new ServicePackage(
                "Photography", "Basic", 149.0, "2 Hours",
                "15 High-Resolution Edited Images, 1 Location, Digital Delivery",
                true, 15, 0, "2 Days"
        ));
        servicePackageRepository.save(new ServicePackage(
                "Photography", "Standard", 299.0, "4 Hours",
                "35 High-Resolution Edited Images, 2 Locations, Social Media Optimization",
                true, 35, 0, "4 Days"
        ));
        servicePackageRepository.save(new ServicePackage(
                "Photography", "Premium", 599.0, "8 Hours (Full Day)",
                "75 High-Resolution Edited Images, Multi-Location, RAW Images Delivery on request",
                true, 75, 0, "7 Days"
        ));
        servicePackageRepository.save(new ServicePackage(
                "Photography", "Enterprise", 1499.0, "Custom (up to 3 days)",
                "200+ Photos, Full Event/Office coverage, Brand lifestyle portraits, Premium edits",
                true, 200, 0, "14 Days"
        ));

        // Videography
        servicePackageRepository.save(new ServicePackage(
                "Videography", "Basic", 199.0, "2 Hours",
                "1-2 minute Edited Promo Video, 1080p Delivery, 1 Revision",
                true, 0, 1, "3 Days"
        ));
        servicePackageRepository.save(new ServicePackage(
                "Videography", "Standard", 399.0, "4 Hours",
                "2-3 minute Cinematic Promotion Video, Color Grading, Logo Animation, 2 Revisions",
                true, 0, 1, "5 Days"
        ));
        servicePackageRepository.save(new ServicePackage(
                "Videography", "Premium", 799.0, "Full Day",
                "5-minute Brand Documentary Video, 4K resolution, Sound Design, Subtitles, Unlimited Revisions",
                true, 0, 3, "7 Days"
        ));

        // Drone Shoot
        servicePackageRepository.save(new ServicePackage(
                "Drone Shoot", "Basic", 249.0, "1 Hour",
                "5 Aerial Photos, 1 Edited 4K Drone Footage Video (30s)",
                true, 5, 1, "3 Days"
        ));
        servicePackageRepository.save(new ServicePackage(
                "Drone Shoot", "Standard", 499.0, "3 Hours",
                "15 Aerial Photos, 3 Edited 4K Drone Clips (60s total), FPV fly-through",
                true, 15, 3, "5 Days"
        ));

        // Product Shoot
        servicePackageRepository.save(new ServicePackage(
                "Product Shoot", "Basic", 129.0, "Contractual",
                "10 High-Quality White Background Product Shots suitable for E-commerce",
                true, 10, 0, "3 Days"
        ));
        servicePackageRepository.save(new ServicePackage(
                "Product Shoot", "Premium", 499.0, "Contractual",
                "30 White Background & Lifestyle Product Shots, 1 short 15s product teaser",
                true, 30, 1, "6 Days"
        ));

        // Event Coverage
        servicePackageRepository.save(new ServicePackage(
                "Event Coverage", "Standard", 699.0, "6 Hours",
                "50 Edited Photos, 3-minute Highlight Reel videography",
                true, 50, 1, "7 Days"
        ));

        // Logo Design
        servicePackageRepository.save(new ServicePackage(
                "Logo Design", "Basic", 99.0, "N/A",
                "2 Custom Concepts, High-resolution vectors (SVG, PDF, PNG), 3 revisions",
                false, 0, 0, "4 Days"
        ));

        // Instagram Reel Creation
        servicePackageRepository.save(new ServicePackage(
                "Instagram Reel Creation", "Basic", 149.0, "2 Hours Shoot",
                "3 Custom vertical edit reels with trending music matching, color grading",
                true, 0, 3, "3 Days"
        ));
    }

    private void seedUsers() {
        // 1. Admin setup
        User admin = new User(
                "admin@p2i.com",
                passwordEncoder.encode("admin123"),
                "Admin Manager",
                "+1112223333",
                Role.ADMIN
        );
        userRepository.save(admin);

        // 2. Customer setup
        User customer = new User(
                "customer@p2i.com",
                passwordEncoder.encode("customer123"),
                "Arjun Patel",
                "+918765432109",
                Role.CUSTOMER
        );
        userRepository.save(customer);

        // 3. Creator setup
        User creator = new User(
                "creator@p2i.com",
                passwordEncoder.encode("creator123"),
                "Sathwik Kumar",
                "+919876543210",
                Role.CREATOR
        );
        creator = userRepository.saveAndFlush(creator);

        CreatorProfile profile = new CreatorProfile();
        profile.setUser(creator);
        profile.setSpecialization("Photography");
        profile.setExperience("5 Years");
        profile.setSkills("Adobe Premiere Pro, Lightroom, Studio Lighting, Color Grading");
        profile.setLanguages("English, Hindi, Kannada");
        profile.setEquipment("Sony A7 IV, 24-70mm f/2.8 GM, DJI Mavic Air 3");
        profile.setLocation("Bangalore");
        profile.setBio("Professional promotional content creator specialized in high-end brand, corporate events, and e-commerce product shoots.");
        profile.setHourlyRate(150.0);
        profile.setApproved(true);
        profile.setRating(4.9);
        profile.setCompletedProjects(12);

        creatorProfileRepository.saveAndFlush(profile);
    }
}
