package com.my_app.schoolboard.strategy;

import com.my_app.schoolboard.dto.RegisterRequest;
import com.my_app.schoolboard.model.TeacherProfile;
import com.my_app.schoolboard.model.User;
import com.my_app.schoolboard.repository.TeacherProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Registration strategy for TEACHER role
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class TeacherRegistrationStrategy implements RegistrationStrategy {

    private final TeacherProfileRepository teacherProfileRepository;

    @Override
    @Transactional
    public void createProfile(User user, RegisterRequest request) {
        log.info("Creating teacher profile for user: {}", user.getUsername());

        TeacherProfile profile = TeacherProfile.builder()
                .user(user)
                .fullName(request.getFullName())
                .dateOfBirth(request.getDateOfBirth())
                .province(request.getProvince())
                .institutionName(request.getInstitutionName())
                .subjectSpecialization(request.getSubjectSpecialization())
                .yearsOfExperience(request.getYearsOfExperience())
                .qualifications(request.getQualifications())
                .build();

        teacherProfileRepository.save(profile);
        log.info("Teacher profile created successfully for user: {}", user.getUsername());
    }

    @Override
    public void validateRequest(RegisterRequest request) {
        log.debug("Validating teacher registration request");

        if (request.getFullName() == null || request.getFullName().isBlank()) {
            throw new IllegalArgumentException("Full name is required for teachers");
        }
        if (request.getDateOfBirth() == null) {
            throw new IllegalArgumentException("Date of birth is required for teachers");
        }
        if (request.getProvince() == null || request.getProvince().isBlank()) {
            throw new IllegalArgumentException("Province is required for teachers");
        }
        if (request.getInstitutionName() == null || request.getInstitutionName().isBlank()) {
            throw new IllegalArgumentException("Institution name is required for teachers");
        }
        if (request.getSubjectSpecialization() == null || request.getSubjectSpecialization().isBlank()) {
            throw new IllegalArgumentException("Subject specialization is required for teachers");
        }

        log.debug("Teacher registration request validated successfully");
    }
}
