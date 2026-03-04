package com.my_app.schoolboard.service;

import com.my_app.schoolboard.dto.*;
import org.springframework.web.multipart.MultipartFile;

/**
 * Service interface for account management operations
 * Follows SOLID principles with clear separation of concerns
 */
public interface AccountService {

    /**
     * Get current authenticated user's account details with profile
     * 
     * @return AccountResponseDTO containing user and profile information
     */
    AccountResponseDTO getCurrentUserAccount();

    /**
     * Update profile information for the current user
     * Only updates fields relevant to the user's role
     * 
     * @param request DTO containing fields to update
     * @return Updated account information
     */
    AccountResponseDTO updateProfile(UpdateProfileRequestDTO request);

    /**
     * Change user's password
     * Validates current password and ensures new password meets requirements
     * 
     * @param request DTO containing current and new passwords
     */
    void changePassword(ChangePasswordRequestDTO request);

    /**
     * Change user's email address
     * Validates password and checks email availability
     * 
     * @param request DTO containing new email and password
     * @return Updated account information
     */
    AccountResponseDTO changeEmail(ChangeEmailRequestDTO request);

    /**
     * Soft delete user account
     * Sets isActive to false and records deletion timestamp
     * 
     * @param request DTO containing password for confirmation
     */
    void deleteAccount(DeleteAccountRequestDTO request);

    /**
     * Update profile image for the current user
     * Validates file type and size, replaces old image if exists
     * 
     * @param file MultipartFile containing the profile image
     * @return URL of the uploaded profile image
     */
    String updateProfileImage(MultipartFile file);
}
