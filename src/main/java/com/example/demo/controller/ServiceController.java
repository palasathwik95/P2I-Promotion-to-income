package com.example.demo.controller;

import com.example.demo.model.ServicePackage;
import com.example.demo.repository.ServicePackageRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/services")
public class ServiceController {

    private final ServicePackageRepository servicePackageRepository;

    public ServiceController(ServicePackageRepository servicePackageRepository) {
        this.servicePackageRepository = servicePackageRepository;
    }

    @GetMapping("/public/packages")
    public ResponseEntity<List<ServicePackage>> getAllPackages() {
        return ResponseEntity.ok(servicePackageRepository.findAll());
    }

    @GetMapping("/public/packages/{serviceName}")
    public ResponseEntity<List<ServicePackage>> getPackagesByService(
            @PathVariable("serviceName") String serviceName
    ) {
        return ResponseEntity.ok(servicePackageRepository.findByServiceName(serviceName));
    }

    @GetMapping("/public/categories")
    public ResponseEntity<List<String>> getCategories() {
        List<String> categories = Arrays.asList(
                "Photography",
                "Videography",
                "Drone Shoot",
                "Product Shoot",
                "Event Coverage",
                "Graphic Design",
                "Branding",
                "Video Editing",
                "Social Media Management",
                "Logo Design",
                "Instagram Reel Creation",
                "YouTube Promotion"
        );
        return ResponseEntity.ok(categories);
    }
}
