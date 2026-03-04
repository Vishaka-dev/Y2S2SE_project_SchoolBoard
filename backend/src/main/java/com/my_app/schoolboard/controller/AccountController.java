package com.my_app.schoolboard.controller;

import com.my_app.schoolboard.dto.*;
import com.my_app.schoolboard.service.AccountService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

/**
 * REST controller for account management operations
 * Base path: /api/account
 * All endpoints require authentication
 */
@RestController
@RequestMapping("/api/account")
@RequiredArgsConstructor
@Slf4j
public class AccountController {

    private final AccountService accountService;

    /**
     * GET /api/account/me
     * Returns authenticated user's account summary with profile
     */
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<AccountResponseDTO> getCurrentAccount() {
        log.info("GET /api/account/me - Fetching current user account");

        AccountResponseDTO response = accountService.getCurrentUserAccount();

        return ResponseEntity.ok(response);
    }

    /**
     * PATCH /api/account/me
     * Updates editable profile fields for authenticated user
     */
    @PatchMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<AccountResponseDTO> updateProfile(
            @Valid @RequestBody UpdateProfileRequestDTO request) {

        log.info("PATCH /api/account/me - Updating profile");

        AccountResponseDTO response = accountService.updateProfile(request);

        return ResponseEntity.ok(response);
    }

    /**
     * PATCH /api/account/change-password
     * Changes user's password
     * Requires current password for validation
     */
    @PatchMapping("/change-password")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> changePassword(
            @Valid @RequestBody ChangePasswordRequestDTO request) {

        log.info("PATCH /api/account/change-password - Changing password");

        accountService.changePassword(request);

        return ResponseEntity.ok(Map.of(
                "message", "Password changed successfully",
                "status", "success"));
    }

    /**
     * PATCH /api/account/change-email
     * Changes user's email address
     * Requires password for validation
     */
    @PatchMapping("/change-email")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<AccountResponseDTO> changeEmail(
            @Valid @RequestBody ChangeEmailRequestDTO request) {

        log.info("PATCH /api/account/change-email - Changing email");

        AccountResponseDTO response = accountService.changeEmail(request);

        return ResponseEntity.ok(response);
    }

    /**
     * DELETE /api/account/me
     * Soft deletes user account
     * Requires password for confirmation
     */
    @DeleteMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> deleteAccount(
            @Valid @RequestBody DeleteAccountRequestDTO request) {

        log.info("DELETE /api/account/me - Deleting account");

        accountService.deleteAccount(request);

        return ResponseEntity.ok(Map.of(
                "message", "Account deleted successfully",
                "status", "success"));
    }

    /**
     * POST /api/account/profile-photo
     * Uploads or updates profile photo for authenticated user
     * Accepts multipart/form-data
     * File requirements: JPEG/PNG, max 5MB
     */
    @PostMapping(value = "/profile-photo", consumes = "multipart/form-data")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ProfileImageUploadResponseDTO> uploadProfilePhoto(
            @RequestParam("file") MultipartFile file) {

        log.info("POST /api/account/profile-photo - Uploading profile photo");

        String profileImageUrl = accountService.updateProfileImage(file);

        ProfileImageUploadResponseDTO response = ProfileImageUploadResponseDTO.builder()
                .profileImageUrl(profileImageUrl)
                .message("Profile photo uploaded successfully")
                .build();

        return ResponseEntity.ok(response);
    }
}
