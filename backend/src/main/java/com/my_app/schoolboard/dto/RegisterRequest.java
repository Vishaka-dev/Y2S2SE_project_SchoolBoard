package com.my_app.schoolboard.dto;

import com.my_app.schoolboard.model.EducationLevel;
import com.my_app.schoolboard.model.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * Enhanced registration request DTO supporting all role types
 * Validation is performed by role-specific strategies
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {

    // Common fields for all users
    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    private String username;

    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    @NotNull(message = "Role is required")
    private Role role;

    // ===== Common profile fields =====
    private String fullName;
    private LocalDate dateOfBirth;
    private String province;

    // ===== Student-specific fields =====
    private EducationLevel educationLevel;
    private String interests;

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
