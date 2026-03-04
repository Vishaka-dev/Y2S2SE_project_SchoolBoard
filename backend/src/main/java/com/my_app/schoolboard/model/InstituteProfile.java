package com.my_app.schoolboard.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * Institute profile entity for educational institutions
 */
@Entity
@Table(name = "institute_profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InstituteProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "institution_name", nullable = false, length = 200)
    private String institutionName;

    @Column(name = "institution_type", nullable = false, length = 50)
    private String institutionType; // e.g., SCHOOL, UNIVERSITY, COLLEGE

    @Column(name = "registration_number", nullable = false, unique = true, length = 100)
    private String registrationNumber;

    @Column(name = "province", nullable = false, length = 50)
    private String province;

    @Column(name = "district", nullable = false, length = 50)
    private String district;

    @Column(name = "address", nullable = false, length = 500)
    private String address;

    @Column(name = "contact_person", nullable = false, length = 100)
    private String contactPerson;

    @Column(name = "contact_number", nullable = false, length = 20)
    private String contactNumber;

    @Column(name = "website", length = 200)
    private String website;

    @Column(name = "verified", nullable = false)
    @Builder.Default
    private Boolean verified = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
