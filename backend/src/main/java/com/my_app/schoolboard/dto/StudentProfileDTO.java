package com.my_app.schoolboard.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Profile data for student accounts in account responses
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentProfileDTO {

    private String educationLevel;
    private String fullName;
    private String dateOfBirth;
    private String province;
    private String interests;

    // School-specific
    private String schoolName;
    private Integer grade;

    // University-specific
    private String universityName;
    private String degreeProgram;
    private Integer yearOfStudy;
}
