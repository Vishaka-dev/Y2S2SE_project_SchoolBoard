package com.my_app.schoolboard.dto;

import com.my_app.schoolboard.model.EducationLevel;
import com.my_app.schoolboard.model.Role;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

/**
 * Data Transfer Object for completing an OAuth2 user's profile.
 * Contains all the profile-specific fields needed by various roles.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompleteProfileRequest {

    @NotNull(message = "Role is required")
    private Role role;

    // ===== Common profile fields =====
    private String fullName;
    private LocalDate dateOfBirth;
    private String province;

    // ===== Student-specific fields =====
    private EducationLevel educationLevel;
    private List<String> interests;

    // School student fields
    private String schoolName;
    private Integer grade;

    // University student fields
    private String universityName;
    private String degreeProgram;
    private Integer yearOfStudy;

    // ===== Teacher-specific fields =====
    private String institutionName;
    private String subjectSpecialization;
    private Integer yearsOfExperience;
    private String qualifications;

    // ===== Institute-specific fields =====
    private String institutionType;
    private String registrationNumber;
    private String district;
    private String address;
    private String contactPerson;
    private String contactNumber;
    private String website;
}
