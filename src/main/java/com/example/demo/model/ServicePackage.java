package com.example.demo.model;

import jakarta.persistence.*;

@Entity
@Table(name = "service_packages")
public class ServicePackage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String serviceName; // Photography, Videography, Drone Shoot, etc.

    @Column(nullable = false)
    private String name; // Basic, Standard, Premium, Enterprise

    @Column(nullable = false)
    private Double price;

    private String duration;
    
    @Column(length = 2000)
    private String deliverables;
    
    private boolean editingIncluded;
    private Integer numPhotos;
    private Integer numVideos;
    private String deliveryTime;

    public ServicePackage() {}

    public ServicePackage(String serviceName, String name, Double price, String duration, String deliverables, boolean editingIncluded, Integer numPhotos, Integer numVideos, String deliveryTime) {
        this.serviceName = serviceName;
        this.name = name;
        this.price = price;
        this.duration = duration;
        this.deliverables = deliverables;
        this.editingIncluded = editingIncluded;
        this.numPhotos = numPhotos;
        this.numVideos = numVideos;
        this.deliveryTime = deliveryTime;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getServiceName() {
        return serviceName;
    }

    public void setServiceName(String serviceName) {
        this.serviceName = serviceName;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public String getDuration() {
        return duration;
    }

    public void setDuration(String duration) {
        this.duration = duration;
    }

    public String getDeliverables() {
        return deliverables;
    }

    public void setDeliverables(String deliverables) {
        this.deliverables = deliverables;
    }

    public boolean isEditingIncluded() {
        return editingIncluded;
    }

    public void setEditingIncluded(boolean editingIncluded) {
        this.editingIncluded = editingIncluded;
    }

    public Integer getNumPhotos() {
        return numPhotos;
    }

    public void setNumPhotos(Integer numPhotos) {
        this.numPhotos = numPhotos;
    }

    public Integer getNumVideos() {
        return numVideos;
    }

    public void setNumVideos(Integer numVideos) {
        this.numVideos = numVideos;
    }

    public String getDeliveryTime() {
        return deliveryTime;
    }

    public void setDeliveryTime(String deliveryTime) {
        this.deliveryTime = deliveryTime;
    }
}
