package com.my_app.schoolboard.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.my_app.schoolboard.dto.*;
import com.my_app.schoolboard.exception.*;
import com.my_app.schoolboard.model.AuthProvider;
import com.my_app.schoolboard.model.Role;
import com.my_app.schoolboard.service.AccountService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for AccountController
 */
@WebMvcTest(AccountController.class)
@AutoConfigureMockMvc
@DisplayName("AccountController Integration Tests")
class AccountControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AccountService accountService;

    private AccountResponseDTO mockAccountResponse;

    @BeforeEach
    void setUp() {
        mockAccountResponse = AccountResponseDTO.builder()
                .id(1L)
                .email("test@test.com")
                .username("testuser")
                .role(Role.STUDENT)
                .provider(AuthProvider.LOCAL)
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    @DisplayName("GET /api/account/me - Should return current account")
    @WithMockUser(username = "test@test.com", roles = { "STUDENT" })
    void testGetCurrentAccount_Success() throws Exception {
        // Arrange
        when(accountService.getCurrentUserAccount()).thenReturn(mockAccountResponse);

        // Act & Assert
        mockMvc.perform(get("/api/account/me")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("test@test.com"))
                .andExpect(jsonPath("$.username").value("testuser"))
                .andExpect(jsonPath("$.role").value("STUDENT"));

        verify(accountService).getCurrentUserAccount();
    }

    @Test
    @DisplayName("GET /api/account/me - Should return 401 when not authenticated")
    void testGetCurrentAccount_Unauthorized() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/account/me")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());

        verify(accountService, never()).getCurrentUserAccount();
    }

    @Test
    @DisplayName("PATCH /api/account/me - Should update profile successfully")
    @WithMockUser(username = "test@test.com", roles = { "STUDENT" })
    void testUpdateProfile_Success() throws Exception {
        // Arrange
        UpdateProfileRequestDTO request = new UpdateProfileRequestDTO();
        request.setFullName("Updated Name");
        request.setProvince("Western");

        when(accountService.updateProfile(any(UpdateProfileRequestDTO.class)))
                .thenReturn(mockAccountResponse);

        // Act & Assert
        mockMvc.perform(patch("/api/account/me")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("test@test.com"));

        verify(accountService).updateProfile(any(UpdateProfileRequestDTO.class));
    }

    @Test
    @DisplayName("PATCH /api/account/me - Should return 400 for invalid data")
    @WithMockUser(username = "test@test.com", roles = { "STUDENT" })
    void testUpdateProfile_InvalidData() throws Exception {
        // Arrange
        UpdateProfileRequestDTO request = new UpdateProfileRequestDTO();
        request.setFullName("A".repeat(101)); // Exceeds max length

        // Act & Assert
        mockMvc.perform(patch("/api/account/me")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());

        verify(accountService, never()).updateProfile(any(UpdateProfileRequestDTO.class));
    }

    @Test
    @DisplayName("PATCH /api/account/change-password - Should change password successfully")
    @WithMockUser(username = "test@test.com", roles = { "STUDENT" })
    void testChangePassword_Success() throws Exception {
        // Arrange
        ChangePasswordRequestDTO request = new ChangePasswordRequestDTO();
        request.setCurrentPassword("OldPass123!");
        request.setNewPassword("NewPass123!");
        request.setConfirmPassword("NewPass123!");

        doNothing().when(accountService).changePassword(any(ChangePasswordRequestDTO.class));

        // Act & Assert
        mockMvc.perform(patch("/api/account/change-password")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Password changed successfully"))
                .andExpect(jsonPath("$.status").value("success"));

        verify(accountService).changePassword(any(ChangePasswordRequestDTO.class));
    }

    @Test
    @DisplayName("PATCH /api/account/change-password - Should return 400 for invalid password format")
    @WithMockUser(username = "test@test.com", roles = { "STUDENT" })
    void testChangePassword_InvalidFormat() throws Exception {
        // Arrange
        ChangePasswordRequestDTO request = new ChangePasswordRequestDTO();
        request.setCurrentPassword("oldpass");
        request.setNewPassword("weak"); // Does not meet requirements
        request.setConfirmPassword("weak");

        // Act & Assert
        mockMvc.perform(patch("/api/account/change-password")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());

        verify(accountService, never()).changePassword(any(ChangePasswordRequestDTO.class));
    }

    @Test
    @DisplayName("PATCH /api/account/change-password - Should return 400 when current password is wrong")
    @WithMockUser(username = "test@test.com", roles = { "STUDENT" })
    void testChangePassword_WrongCurrentPassword() throws Exception {
        // Arrange
        ChangePasswordRequestDTO request = new ChangePasswordRequestDTO();
        request.setCurrentPassword("WrongPass123!");
        request.setNewPassword("NewPass123!");
        request.setConfirmPassword("NewPass123!");

        doThrow(new InvalidPasswordException("Current password is incorrect"))
                .when(accountService).changePassword(any(ChangePasswordRequestDTO.class));

        // Act & Assert
        mockMvc.perform(patch("/api/account/change-password")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());

        verify(accountService).changePassword(any(ChangePasswordRequestDTO.class));
    }

    @Test
    @DisplayName("PATCH /api/account/change-email - Should change email successfully")
    @WithMockUser(username = "test@test.com", roles = { "STUDENT" })
    void testChangeEmail_Success() throws Exception {
        // Arrange
        ChangeEmailRequestDTO request = new ChangeEmailRequestDTO();
        request.setNewEmail("newemail@test.com");
        request.setPassword("Password123!");

        when(accountService.changeEmail(any(ChangeEmailRequestDTO.class)))
                .thenReturn(mockAccountResponse);

        // Act & Assert
        mockMvc.perform(patch("/api/account/change-email")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").exists());

        verify(accountService).changeEmail(any(ChangeEmailRequestDTO.class));
    }

    @Test
    @DisplayName("PATCH /api/account/change-email - Should return 409 when email exists")
    @WithMockUser(username = "test@test.com", roles = { "STUDENT" })
    void testChangeEmail_EmailExists() throws Exception {
        // Arrange
        ChangeEmailRequestDTO request = new ChangeEmailRequestDTO();
        request.setNewEmail("existing@test.com");
        request.setPassword("Password123!");

        when(accountService.changeEmail(any(ChangeEmailRequestDTO.class)))
                .thenThrow(new EmailAlreadyExistsException("existing@test.com"));

        // Act & Assert
        mockMvc.perform(patch("/api/account/change-email")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict());

        verify(accountService).changeEmail(any(ChangeEmailRequestDTO.class));
    }

    @Test
    @DisplayName("PATCH /api/account/change-email - Should return 400 for invalid email format")
    @WithMockUser(username = "test@test.com", roles = { "STUDENT" })
    void testChangeEmail_InvalidEmailFormat() throws Exception {
        // Arrange
        ChangeEmailRequestDTO request = new ChangeEmailRequestDTO();
        request.setNewEmail("invalid-email"); // Invalid format
        request.setPassword("Password123!");

        // Act & Assert
        mockMvc.perform(patch("/api/account/change-email")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());

        verify(accountService, never()).changeEmail(any(ChangeEmailRequestDTO.class));
    }

    @Test
    @DisplayName("DELETE /api/account/me - Should delete account successfully")
    @WithMockUser(username = "test@test.com", roles = { "STUDENT" })
    void testDeleteAccount_Success() throws Exception {
        // Arrange
        DeleteAccountRequestDTO request = new DeleteAccountRequestDTO();
        request.setPassword("Password123!");

        doNothing().when(accountService).deleteAccount(any(DeleteAccountRequestDTO.class));

        // Act & Assert
        mockMvc.perform(delete("/api/account/me")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Account deleted successfully"))
                .andExpect(jsonPath("$.status").value("success"));

        verify(accountService).deleteAccount(any(DeleteAccountRequestDTO.class));
    }

    @Test
    @DisplayName("DELETE /api/account/me - Should return 400 when password is wrong")
    @WithMockUser(username = "test@test.com", roles = { "STUDENT" })
    void testDeleteAccount_WrongPassword() throws Exception {
        // Arrange
        DeleteAccountRequestDTO request = new DeleteAccountRequestDTO();
        request.setPassword("WrongPassword123!");

        doThrow(new InvalidPasswordException("Password is incorrect"))
                .when(accountService).deleteAccount(any(DeleteAccountRequestDTO.class));

        // Act & Assert
        mockMvc.perform(delete("/api/account/me")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());

        verify(accountService).deleteAccount(any(DeleteAccountRequestDTO.class));
    }

    @Test
    @DisplayName("All endpoints should require authentication")
    void testEndpointsRequireAuthentication() throws Exception {
        // Test GET /me
        mockMvc.perform(get("/api/account/me"))
                .andExpect(status().isUnauthorized());

        // Test PATCH /me
        mockMvc.perform(patch("/api/account/me")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isUnauthorized());

        // Test PATCH /change-password
        mockMvc.perform(patch("/api/account/change-password")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isUnauthorized());

        // Test PATCH /change-email
        mockMvc.perform(patch("/api/account/change-email")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isUnauthorized());

        // Test DELETE /me
        mockMvc.perform(delete("/api/account/me")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isUnauthorized());

        verify(accountService, never()).getCurrentUserAccount();
        verify(accountService, never()).updateProfile(any());
        verify(accountService, never()).changePassword(any());
        verify(accountService, never()).changeEmail(any());
        verify(accountService, never()).deleteAccount(any());
    }
}
