package com.my_app.schoolboard.strategy;

import com.my_app.schoolboard.dto.RegisterRequest;
import com.my_app.schoolboard.exception.UserAlreadyExistsException;
import com.my_app.schoolboard.model.InstituteProfile;
import com.my_app.schoolboard.model.User;
import com.my_app.schoolboard.repository.InstituteProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Registration strategy for INSTITUTE role
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class InstituteRegistrationStrategy implements RegistrationStrategy {

    private final InstituteProfileRepository instituteProfileRepository;

    @Override
    @Transactional
    public void createProfile(User user, RegisterRequest request) {
        log.info("Creating institute profile for user: {}", user.getUsername());

        // Check if registration number already exists
        if (instituteProfileRepository.existsByRegistrationNumber(request.getRegistrationNumber())) {
            throw new UserAlreadyExistsException("Institute registration number already exists");
        }

        InstituteProfile profile = InstituteProfile.builder()
                .user(user)
                .institutionName(request.getInstitutionName())
                .institutionType(request.getInstitutionType())
                .registrationNumber(request.getRegistrationNumber())
                .province(request.getProvince())
                .district(request.getDistrict())
                .address(request.getAddress())
                .contactPerson(request.getContactPerson())
                .contactNumber(request.getContactNumber())
                .website(request.getWebsite())
                .verified(false) // Institutes need to be verified by admin
                .build();

        instituteProfileRepository.save(profile);
        log.info("Institute profile created successfully for user: {} (pending verification)",
                user.getUsername());
    }

    @Override
    public void validateRequest(RegisterRequest request) {
        log.debug("Validating institute registration request");

        if (request.getInstitutionName() == null || request.getInstitutionName().isBlank()) {
            throw new IllegalArgumentException("Institution name is required for institutes");
        }
        if (request.getInstitutionType() == null || request.getInstitutionType().isBlank()) {
            throw new IllegalArgumentException("Institution type is required for institutes");
        }
        if (request.getRegistrationNumber() == null || request.getRegistrationNumber().isBlank()) {
            throw new IllegalArgumentException("Registration number is required for institutes");
        }
        if (request.getProvince() == null || request.getProvince().isBlank()) {
            throw new IllegalArgumentException("Province is required for institutes");
        }
        if (request.getDistrict() == null || request.getDistrict().isBlank()) {
            throw new IllegalArgumentException("District is required for institutes");
        }
        if (request.getAddress() == null || request.getAddress().isBlank()) {
            throw new IllegalArgumentException("Address is required for institutes");
        }
        if (request.getContactPerson() == null || request.getContactPerson().isBlank()) {
            throw new IllegalArgumentException("Contact person is required for institutes");
        }
        if (request.getContactNumber() == null || request.getContactNumber().isBlank()) {
            throw new IllegalArgumentException("Contact number is required for institutes");
        }

        log.debug("Institute registration request validated successfully");
    }
}
