package com.example.demo.model;

import jakarta.persistence.*;

import org.springframework.data.domain.Persistable;

@Entity
@Table(name = "business_clients")
public class BusinessClient implements Persistable<Long> {

    @Id
    private Long id;

    @OneToOne
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    private String companyName;
    private String companyWebsite;
    private String address;
    private String contactPerson;

    @Transient
    private boolean isNewEntity = true;

    @Override
    public boolean isNew() {
        return isNewEntity;
    }

    @PostPersist
    @PostLoad
    public void markNotNew() {
        this.isNewEntity = false;
    }

    public BusinessClient() {}

    public BusinessClient(User user) {
        this.user = user;
        this.id = user.getId();
    }

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
        this.id = user.getId();
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getCompanyWebsite() {
        return companyWebsite;
    }

    public void setCompanyWebsite(String companyWebsite) {
        this.companyWebsite = companyWebsite;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getContactPerson() {
        return contactPerson;
    }

    public void setContactPerson(String contactPerson) {
        this.contactPerson = contactPerson;
    }
}
