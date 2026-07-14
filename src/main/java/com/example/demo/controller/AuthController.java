package com.example.demo.controller;

import com.example.demo.dto.AuthRequest;
import com.example.demo.dto.AuthResponse;
import com.example.demo.dto.RegisterRequest;
import com.example.demo.model.CreatorProfile;
import com.example.demo.model.Role;
import com.example.demo.model.User;
import com.example.demo.repository.CreatorProfileRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.security.JwtUtils;
import com.example.demo.security.UserDetailsImpl;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final CreatorProfileRepository creatorProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    public AuthController(
            AuthenticationManager authenticationManager,
            UserRepository userRepository,
            CreatorProfileRepository creatorProfileRepository,
            PasswordEncoder passwordEncoder,
            JwtUtils jwtUtils
    ) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.creatorProfileRepository = creatorProfileRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email is already in use."));
        }

        Role userRole;
        try {
            userRole = Role.valueOf(request.getRole().toUpperCase());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid role specified. Valid roles are: CUSTOMER, CREATOR"));
        }

        if (userRole == Role.ADMIN) {
            return ResponseEntity.badRequest().body(Map.of("message", "Cannot register directly as an Administrator."));
        }

        User user = new User(
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                request.getName(),
                request.getPhone(),
                userRole
        );

        User savedUser = userRepository.save(user);

        if (userRole == Role.CREATOR) {
            CreatorProfile profile = new CreatorProfile(savedUser);
            profile.setSpecialization(request.getSpecialization());
            profile.setExperience(request.getExperience());
            profile.setSkills(request.getSkills());
            profile.setLanguages(request.getLanguages());
            profile.setEquipment(request.getEquipment());
            profile.setLocation(request.getLocation());
            profile.setBio(request.getBio());
            profile.setHourlyRate(request.getHourlyRate() != null ? request.getHourlyRate() : 0.0);
            profile.setApproved(false); // Awaiting admin approval
            creatorProfileRepository.save(profile);
        }

        return ResponseEntity.ok(Map.of("message", "User registered successfully.", "role", userRole));
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody AuthRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        String jwt = jwtUtils.generateToken(userDetails);
        User user = userDetails.getUser();

        boolean isApproved = true;
        if (user.getRole() == Role.CREATOR) {
            CreatorProfile cp = creatorProfileRepository.findById(user.getId()).orElse(null);
            if (cp != null) {
                isApproved = cp.isApproved();
            }
        }

        return ResponseEntity.ok(new AuthResponse(
                jwt,
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getRole().name(),
                isApproved
        ));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("email", user.getEmail());
        response.put("name", user.getName());
        response.put("phone", user.getPhone());
        response.put("role", user.getRole().name());

        if (user.getRole() == Role.CREATOR) {
            CreatorProfile cp = creatorProfileRepository.findById(user.getId()).orElse(null);
            if (cp != null) {
                response.put("creatorProfile", cp);
                response.put("isApproved", cp.isApproved());
            }
        } else {
            response.put("isApproved", true);
        }

        return ResponseEntity.ok(response);
    }
}
