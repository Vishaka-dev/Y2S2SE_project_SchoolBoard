package com.my_app.schoolboard.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Profile data for teacher accounts in account responses
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TeacherProfileDTO {

    private String fullName;
    private String dateOfBirth;
    private String province;
    private String institutionName;
    private String subjectSpecialization;
    private Integer yearsOfExperience;
    private String qualifications;
}
