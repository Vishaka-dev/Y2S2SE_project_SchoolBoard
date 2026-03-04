package com.my_app.schoolboard.dto;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * DTO for updating profile information
 * Contains only editable fields
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileRequestDTO {

    // Common fields across all roles
    @Size(max = 50, message = "Province must not exceed 50 characters")
    private String province;

    @Size(max = 500, message = "Interests must not exceed 500 characters")
    private String interests;

    // Student-specific fields
    @Size(max = 100, message = "Full name must not exceed 100 characters")
    private String fullName;

    private LocalDate dateOfBirth;

    @Size(max = 200, message = "School name must not exceed 200 characters")
    private String schoolName;

    private Integer grade;

    @Size(max = 200, message = "University name must not exceed 200 characters")
    private String universityName;

    @Size(max = 200, message = "Degree program must not exceed 200 characters")
    private String degreeProgram;

    private Integer yearOfStudy;

    // Teacher-specific fields
    @Size(max = 200, message = "Institution name must not exceed 200 characters")
    private String institutionName;

    @Size(max = 200, message = "Subject specialization must not exceed 200 characters")
    private String subjectSpecialization;

    private Integer yearsOfExperience;

    @Size(max = 500, message = "Qualifications must not exceed 500 characters")
    private String qualifications;

    // Institute-specific fields
    @Size(max = 50, message = "District must not exceed 50 characters")
    private String district;

    @Size(max = 500, message = "Address must not exceed 500 characters")
    private String address;

    @Size(max = 100, message = "Contact person must not exceed 100 characters")
    private String contactPerson;

    @Size(max = 20, message = "Contact number must not exceed 20 characters")
    private String contactNumber;

    @Size(max = 200, message = "Website must not exceed 200 characters")
    private String website;
}
