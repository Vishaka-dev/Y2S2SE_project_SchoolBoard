package com.my_app.schoolboard.strategy;

import com.my_app.schoolboard.dto.RegisterRequest;
import com.my_app.schoolboard.model.EducationLevel;
import com.my_app.schoolboard.model.StudentProfile;
import com.my_app.schoolboard.model.User;
import com.my_app.schoolboard.repository.StudentProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Registration strategy for STUDENT role
 * Handles both SCHOOL and UNIVERSITY students
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class StudentRegistrationStrategy implements RegistrationStrategy {

    private final StudentProfileRepository studentProfileRepository;

    @Override
    @Transactional
    public void createProfile(User user, RegisterRequest request) {
        log.info("Creating student profile for user: {} with education level: {}",
                user.getUsername(), request.getEducationLevel());

        StudentProfile profile = StudentProfile.builder()
                .user(user)
                .educationLevel(request.getEducationLevel())
                .fullName(request.getFullName())
                .dateOfBirth(request.getDateOfBirth())
                .province(request.getProvince())
                .interests(request.getInterests())
                .build();

        // Set education-level specific fields
        if (request.getEducationLevel() == EducationLevel.SCHOOL) {
            profile.setSchoolName(request.getSchoolName());
            profile.setGrade(request.getGrade());
        } else if (request.getEducationLevel() == EducationLevel.UNIVERSITY) {
            profile.setUniversityName(request.getUniversityName());
            profile.setDegreeProgram(request.getDegreeProgram());
            profile.setYearOfStudy(request.getYearOfStudy());
        }

        studentProfileRepository.save(profile);
        log.info("Student profile created successfully for user: {}", user.getUsername());
    }

    @Override
    public void validateRequest(RegisterRequest request) {
        log.debug("Validating student registration request");

        // Common student fields
        if (request.getEducationLevel() == null) {
            throw new IllegalArgumentException("Education level is required for students");
        }
        if (request.getFullName() == null || request.getFullName().isBlank()) {
            throw new IllegalArgumentException("Full name is required for students");
        }
        if (request.getDateOfBirth() == null) {
            throw new IllegalArgumentException("Date of birth is required for students");
        }
        if (request.getProvince() == null || request.getProvince().isBlank()) {
            throw new IllegalArgumentException("Province is required for students");
        }

        // Education-level specific validation
        if (request.getEducationLevel() == EducationLevel.SCHOOL) {
            validateSchoolStudent(request);
        } else if (request.getEducationLevel() == EducationLevel.UNIVERSITY) {
            validateUniversityStudent(request);
        }

        log.debug("Student registration request validated successfully");
    }

    private void validateSchoolStudent(RegisterRequest request) {
        if (request.getSchoolName() == null || request.getSchoolName().isBlank()) {
            throw new IllegalArgumentException("School name is required for school students");
        }
        if (request.getGrade() == null) {
            throw new IllegalArgumentException("Grade is required for school students");
        }
        if (request.getGrade() < 1 || request.getGrade() > 13) {
            throw new IllegalArgumentException("Grade must be between 1 and 13");
        }
    }

    private void validateUniversityStudent(RegisterRequest request) {
        if (request.getUniversityName() == null || request.getUniversityName().isBlank()) {
            throw new IllegalArgumentException("University name is required for university students");
        }
        if (request.getDegreeProgram() == null || request.getDegreeProgram().isBlank()) {
            throw new IllegalArgumentException("Degree program is required for university students");
        }
        if (request.getYearOfStudy() == null) {
            throw new IllegalArgumentException("Year of study is required for university students");
        }
        if (request.getYearOfStudy() < 1 || request.getYearOfStudy() > 6) {
            throw new IllegalArgumentException("Year of study must be between 1 and 6");
        }
    }
}
