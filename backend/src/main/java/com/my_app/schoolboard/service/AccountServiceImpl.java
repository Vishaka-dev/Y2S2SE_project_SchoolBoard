package com.my_app.schoolboard.service;

import com.my_app.schoolboard.dto.*;
import com.my_app.schoolboard.exception.*;
import com.my_app.schoolboard.model.*;
import com.my_app.schoolboard.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;

/**
 * Implementation of AccountService
 * Handles account management operations with role-specific logic
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AccountServiceImpl implements AccountService {

    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final TeacherProfileRepository teacherProfileRepository;
    private final InstituteProfileRepository instituteProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final FileStorageService fileStorageService;

    @Override
    @Transactional(readOnly = true)
    public AccountResponseDTO getCurrentUserAccount() {
        User user = getCurrentAuthenticatedUser();

        log.info("Fetching account details for user: {}", user.getEmail());

        return buildAccountResponse(user);
    }

    @Override
    public AccountResponseDTO updateProfile(UpdateProfileRequestDTO request) {
        User user = getCurrentAuthenticatedUser();

        log.info("Updating profile for user: {} with role: {}", user.getEmail(), user.getRole());

        // Delegate to role-specific update methods
        switch (user.getRole()) {
            case STUDENT -> updateStudentProfile(user, request);
            case TEACHER -> updateTeacherProfile(user, request);
            case INSTITUTE -> updateInstituteProfile(user, request);
            default ->
                throw new UnauthorizedOperationException("Profile update not supported for role: " + user.getRole());
        }

        log.info("Profile updated successfully for user: {}", user.getEmail());

        return buildAccountResponse(user);
    }

    @Override
    public void changePassword(ChangePasswordRequestDTO request) {
        User user = getCurrentAuthenticatedUser();

        log.info("Processing password change for user: {}", user.getEmail());

        // Validate that user has a local account (not OAuth2)
        if (user.getProvider() != AuthProvider.LOCAL) {
            throw new InvalidPasswordException("Cannot change password for OAuth2 accounts");
        }

        // Validate current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            log.warn("Invalid current password provided for user: {}", user.getEmail());
            throw new InvalidPasswordException("Current password is incorrect");
        }

        // Validate new password matches confirmation
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new InvalidPasswordException("New password and confirmation do not match");
        }

        // Validate new password is different from current
        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new InvalidPasswordException("New password must be different from current password");
        }

        // Encode and update password
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        log.info("Password changed successfully for user: {}", user.getEmail());
    }

    @Override
    public AccountResponseDTO changeEmail(ChangeEmailRequestDTO request) {
        User user = getCurrentAuthenticatedUser();

        log.info("Processing email change for user: {} to new email: {}", user.getEmail(), request.getNewEmail());

        // Validate password for local accounts
        if (user.getProvider() == AuthProvider.LOCAL) {
            if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                log.warn("Invalid password provided for email change for user: {}", user.getEmail());
                throw new InvalidPasswordException("Password is incorrect");
            }
        }

        // Validate email is not already in use
        if (userRepository.existsByEmail(request.getNewEmail())) {
            throw new EmailAlreadyExistsException(request.getNewEmail());
        }

        // Validate new email is different from current
        if (user.getEmail().equalsIgnoreCase(request.getNewEmail())) {
            throw new EmailAlreadyExistsException("New email must be different from current email",
                    request.getNewEmail());
        }

        String oldEmail = user.getEmail();
        user.setEmail(request.getNewEmail());
        userRepository.save(user);

        log.info("Email changed successfully from {} to {} for user ID: {}", oldEmail, request.getNewEmail(),
                user.getId());

        return buildAccountResponse(user);
    }

    @Override
    public void deleteAccount(DeleteAccountRequestDTO request) {
        User user = getCurrentAuthenticatedUser();

        log.info("Processing account deletion for user: {}", user.getEmail());

        // Validate password for local accounts
        if (user.getProvider() == AuthProvider.LOCAL) {
            if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                log.warn("Invalid password provided for account deletion for user: {}", user.getEmail());
                throw new InvalidPasswordException("Password is incorrect");
            }
        }

        // Soft delete the account
        user.softDelete();
        userRepository.save(user);

        log.info("Account soft deleted successfully for user: {} at {}", user.getEmail(), user.getDeletedAt());
    }

    /**
     * Get the currently authenticated user from SecurityContext
     */
    private User getCurrentAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new UnauthorizedOperationException("User is not authenticated");
        }

        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        // Check if account is deleted
        if (user.isDeleted()) {
            throw new AccountDeletedException();
        }

        return user;
    }

    /**
     * Build AccountResponseDTO from User entity with profile data
     */
    private AccountResponseDTO buildAccountResponse(User user) {
        // Load and attach role-specific profile
        Object profileDTO = switch (user.getRole()) {
            case STUDENT -> getStudentProfileDTO(user);
            case TEACHER -> getTeacherProfileDTO(user);
            case INSTITUTE -> getInstituteProfileDTO(user);
            default -> null;
        };

        // Extract fullName from profile for convenience
        String fullName = extractFullNameFromProfile(profileDTO);

        // Use profileImageUrl if available, otherwise fall back to OAuth2 imageUrl
        String displayImageUrl = user.getProfileImageUrl() != null ? user.getProfileImageUrl() : user.getImageUrl();

        AccountResponseDTO response = AccountResponseDTO.builder()
                .id(user.getId())
                .email(user.getEmail())
                .username(user.getUsername())
                .fullName(fullName)
                .role(user.getRole())
                .provider(user.getProvider())
                .createdAt(user.getCreatedAt())
                .imageUrl(displayImageUrl)
                .profile(profileDTO)
                .build();

        return response;
    }

    /**
     * Extract fullName from profile DTO based on type
     */
    private String extractFullNameFromProfile(Object profileDTO) {
        if (profileDTO == null) {
            return null;
        }

        if (profileDTO instanceof StudentProfileDTO) {
            return ((StudentProfileDTO) profileDTO).getFullName();
        } else if (profileDTO instanceof TeacherProfileDTO) {
            return ((TeacherProfileDTO) profileDTO).getFullName();
        } else if (profileDTO instanceof InstituteProfileDTO) {
            return ((InstituteProfileDTO) profileDTO).getInstitutionName();
        }

        return null;
    }

    /**
     * Update student profile with validated fields
     */
    private void updateStudentProfile(User user, UpdateProfileRequestDTO request) {
        StudentProfile profile = studentProfileRepository.findByUser(user)
                .orElseThrow(
                        () -> new ResourceNotFoundException("Student profile not found for user: " + user.getEmail()));

        // Update common fields
        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            profile.setFullName(request.getFullName());
        }
        if (request.getDateOfBirth() != null) {
            profile.setDateOfBirth(request.getDateOfBirth());
        }
        if (request.getProvince() != null && !request.getProvince().isBlank()) {
            profile.setProvince(request.getProvince());
        }
        if (request.getInterests() != null) {
            profile.setInterests(request.getInterests());
        }

        // Update education level-specific fields
        if (profile.getEducationLevel() == EducationLevel.SCHOOL) {
            if (request.getSchoolName() != null && !request.getSchoolName().isBlank()) {
                profile.setSchoolName(request.getSchoolName());
            }
            if (request.getGrade() != null) {
                profile.setGrade(request.getGrade());
            }
        } else if (profile.getEducationLevel() == EducationLevel.UNIVERSITY) {
            if (request.getUniversityName() != null && !request.getUniversityName().isBlank()) {
                profile.setUniversityName(request.getUniversityName());
            }
            if (request.getDegreeProgram() != null && !request.getDegreeProgram().isBlank()) {
                profile.setDegreeProgram(request.getDegreeProgram());
            }
            if (request.getYearOfStudy() != null) {
                profile.setYearOfStudy(request.getYearOfStudy());
            }
        }

        studentProfileRepository.save(profile);
    }

    /**
     * Update teacher profile with validated fields
     */
    private void updateTeacherProfile(User user, UpdateProfileRequestDTO request) {
        TeacherProfile profile = teacherProfileRepository.findByUser(user)
                .orElseThrow(
                        () -> new ResourceNotFoundException("Teacher profile not found for user: " + user.getEmail()));

        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            profile.setFullName(request.getFullName());
        }
        if (request.getDateOfBirth() != null) {
            profile.setDateOfBirth(request.getDateOfBirth());
        }
        if (request.getProvince() != null && !request.getProvince().isBlank()) {
            profile.setProvince(request.getProvince());
        }
        if (request.getInstitutionName() != null && !request.getInstitutionName().isBlank()) {
            profile.setInstitutionName(request.getInstitutionName());
        }
        if (request.getSubjectSpecialization() != null && !request.getSubjectSpecialization().isBlank()) {
            profile.setSubjectSpecialization(request.getSubjectSpecialization());
        }
        if (request.getYearsOfExperience() != null) {
            profile.setYearsOfExperience(request.getYearsOfExperience());
        }
        if (request.getQualifications() != null) {
            profile.setQualifications(request.getQualifications());
        }

        teacherProfileRepository.save(profile);
    }

    /**
     * Update institute profile with validated fields
     */
    private void updateInstituteProfile(User user, UpdateProfileRequestDTO request) {
        InstituteProfile profile = instituteProfileRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Institute profile not found for user: " + user.getEmail()));

        if (request.getProvince() != null && !request.getProvince().isBlank()) {
            profile.setProvince(request.getProvince());
        }
        if (request.getDistrict() != null && !request.getDistrict().isBlank()) {
            profile.setDistrict(request.getDistrict());
        }
        if (request.getAddress() != null && !request.getAddress().isBlank()) {
            profile.setAddress(request.getAddress());
        }
        if (request.getContactPerson() != null && !request.getContactPerson().isBlank()) {
            profile.setContactPerson(request.getContactPerson());
        }
        if (request.getContactNumber() != null && !request.getContactNumber().isBlank()) {
            profile.setContactNumber(request.getContactNumber());
        }
        if (request.getWebsite() != null) {
            profile.setWebsite(request.getWebsite());
        }

        instituteProfileRepository.save(profile);
    }

    /**
     * Get student profile DTO
     */
    private StudentProfileDTO getStudentProfileDTO(User user) {
        return studentProfileRepository.findByUser(user)
                .map(profile -> {
                    StudentProfileDTO dto = new StudentProfileDTO();
                    dto.setEducationLevel(profile.getEducationLevel().name());
                    dto.setFullName(profile.getFullName());
                    dto.setDateOfBirth(profile.getDateOfBirth() != null ? profile.getDateOfBirth().toString() : null);
                    dto.setProvince(profile.getProvince());
                    dto.setInterests(profile.getInterests());
                    dto.setSchoolName(profile.getSchoolName());
                    dto.setGrade(profile.getGrade());
                    dto.setUniversityName(profile.getUniversityName());
                    dto.setDegreeProgram(profile.getDegreeProgram());
                    dto.setYearOfStudy(profile.getYearOfStudy());
                    return dto;
                })
                .orElse(null);
    }

    /**
     * Get teacher profile DTO
     */
    private TeacherProfileDTO getTeacherProfileDTO(User user) {
        return teacherProfileRepository.findByUser(user)
                .map(profile -> {
                    TeacherProfileDTO dto = new TeacherProfileDTO();
                    dto.setFullName(profile.getFullName());
                    dto.setDateOfBirth(profile.getDateOfBirth() != null ? profile.getDateOfBirth().toString() : null);
                    dto.setProvince(profile.getProvince());
                    dto.setInstitutionName(profile.getInstitutionName());
                    dto.setSubjectSpecialization(profile.getSubjectSpecialization());
                    dto.setYearsOfExperience(profile.getYearsOfExperience());
                    dto.setQualifications(profile.getQualifications());
                    return dto;
                })
                .orElse(null);
    }

    /**
     * Get institute profile DTO
     */
    private InstituteProfileDTO getInstituteProfileDTO(User user) {
        return instituteProfileRepository.findByUser(user)
                .map(profile -> {
                    InstituteProfileDTO dto = new InstituteProfileDTO();
                    dto.setInstitutionName(profile.getInstitutionName());
                    dto.setInstitutionType(profile.getInstitutionType());
                    dto.setRegistrationNumber(profile.getRegistrationNumber());
                    dto.setProvince(profile.getProvince());
                    dto.setDistrict(profile.getDistrict());
                    dto.setAddress(profile.getAddress());
                    dto.setContactPerson(profile.getContactPerson());
                    dto.setContactNumber(profile.getContactNumber());
                    dto.setWebsite(profile.getWebsite());
                    dto.setVerified(profile.getVerified());
                    return dto;
                })
                .orElse(null);
    }

    @Override
    public String updateProfileImage(MultipartFile file) {
        User user = getCurrentAuthenticatedUser();

        log.info("Updating profile image for user: {} (ID: {})", user.getEmail(), user.getId());

        // Delete old profile image if exists
        if (user.getProfileImageUrl() != null && !user.getProfileImageUrl().isEmpty()) {
            try {
                fileStorageService.deleteFile(user.getProfileImageUrl());
                log.info("Deleted old profile image for user ID: {}", user.getId());
            } catch (Exception e) {
                log.warn("Failed to delete old profile image for user ID: {}. Continuing with upload.", user.getId());
                // Continue with upload even if deletion fails
            }
        }

        // Upload new profile image
        String profileImageUrl = fileStorageService.uploadProfileImage(user.getId(), file);

        // Update user entity
        user.setProfileImageUrl(profileImageUrl);
        userRepository.save(user);

        log.info("Profile image updated successfully for user: {}. New URL: {}", user.getEmail(), profileImageUrl);

        return profileImageUrl;
    }
}
