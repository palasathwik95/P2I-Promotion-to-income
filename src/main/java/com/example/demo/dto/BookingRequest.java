package com.example.demo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class BookingRequest {

    @NotNull(message = "Package ID is required")
    private Long packageId;

    @NotBlank(message = "Shoot date is required")
    private String shootDate;

    @NotBlank(message = "Shoot time is required")
    private String shootTime;

    @NotBlank(message = "Location is required")
    private String location;

    private String requirements;
    private String referenceImages; // Comma separated URLs or description

    public BookingRequest() {}

    // Getters and Setters
    public Long getPackageId() {
        return packageId;
    }

    public void setPackageId(Long packageId) {
        this.packageId = packageId;
    }

    public String getShootDate() {
        return shootDate;
    }

    public void setShootDate(String shootDate) {
        this.shootDate = shootDate;
    }

    public String getShootTime() {
        return shootTime;
    }

    public void setShootTime(String shootTime) {
        this.shootTime = shootTime;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getRequirements() {
        return requirements;
    }

    public void setRequirements(String requirements) {
        this.requirements = requirements;
    }

    public String getReferenceImages() {
        return referenceImages;
    }

    public void setReferenceImages(String referenceImages) {
        this.referenceImages = referenceImages;
    }
}
