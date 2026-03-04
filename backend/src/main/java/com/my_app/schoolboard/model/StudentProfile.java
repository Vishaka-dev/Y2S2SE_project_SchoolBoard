package com.my_app.schoolboard.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Student profile entity supporting both SCHOOL and UNIVERSITY students
 * Single table approach following SOLID principles
 */
@Entity
@Table(name = "student_profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "education_level", nullable = false)
    private EducationLevel educationLevel;

    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @Column(name = "date_of_birth", nullable = false)
    private LocalDate dateOfBirth;

    @Column(name = "province", nullable = false, length = 50)
    private String province;

    @Column(name = "interests", length = 500)
    private String interests; // Comma-separated or JSON

    // School-specific fields (nullable)
    @Column(name = "school_name", length = 200)
    private String schoolName;

    @Column(name = "grade")
    private Integer grade;

    // University-specific fields (nullable)
    @Column(name = "university_name", length = 200)
    private String universityName;

    @Column(name = "degree_program", length = 200)
    private String degreeProgram;

    @Column(name = "year_of_study")
    private Integer yearOfStudy;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /**
     * Validates that school-specific fields are set for SCHOOL students
     */
    public boolean isSchoolFieldsComplete() {
        return educationLevel == EducationLevel.SCHOOL
                && schoolName != null && !schoolName.isBlank()
                && grade != null;
    }

    /**
     * Validates that university-specific fields are set for UNIVERSITY students
     */
    public boolean isUniversityFieldsComplete() {
        return educationLevel == EducationLevel.UNIVERSITY
                && universityName != null && !universityName.isBlank()
                && degreeProgram != null && !degreeProgram.isBlank()
                && yearOfStudy != null;
    }
}
