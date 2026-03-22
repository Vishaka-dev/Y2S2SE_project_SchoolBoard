package com.my_app.schoolboard.service;

import com.my_app.schoolboard.dto.*;
import com.my_app.schoolboard.exception.*;
import com.my_app.schoolboard.model.*;
import com.my_app.schoolboard.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for AccountServiceImpl
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("AccountService Unit Tests")
class AccountServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private StudentProfileRepository studentProfileRepository;

    @Mock
    private TeacherProfileRepository teacherProfileRepository;

    @Mock
    private InstituteProfileRepository instituteProfileRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private AccountServiceImpl accountService;

    private User testUser;
    private StudentProfile testStudentProfile;

    @BeforeEach
    void setUp() {
        // Setup test user
        testUser = User.builder()
                .id(1L)
                .email("student@test.com")
                .username("testuser")
                .password("encodedPassword")
                .role(Role.STUDENT)
                .provider(AuthProvider.LOCAL)
                .createdAt(LocalDateTime.now())
                .isActive(true)
                .build();

        // Setup test student profile
        testStudentProfile = StudentProfile.builder()
                .id(1L)
                .user(testUser)
                .educationLevel(EducationLevel.SCHOOL)
                .fullName("Test Student")
                .dateOfBirth(LocalDate.of(2005, 1, 1))
                .province("Western")
                .schoolName("Test School")
                .grade(10)
                .build();

        // Mock security context
        SecurityContextHolder.setContext(securityContext);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn("student@test.com");
    }

    @Test
    @DisplayName("Should get current user account successfully")
    void testGetCurrentUserAccount_Success() {
        // Arrange
        when(userRepository.findByEmail("student@test.com")).thenReturn(Optional.of(testUser));
        when(studentProfileRepository.findByUser(testUser)).thenReturn(Optional.of(testStudentProfile));

        // Act
        AccountResponseDTO response = accountService.getCurrentUserAccount();

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getEmail()).isEqualTo("student@test.com");
        assertThat(response.getRole()).isEqualTo(Role.STUDENT);
        assertThat(response.getProfile()).isNotNull();

        verify(userRepository).findByEmail("student@test.com");
        verify(studentProfileRepository).findByUser(testUser);
    }

    @Test
    @DisplayName("Should throw exception when user not authenticated")
    void testGetCurrentUserAccount_NotAuthenticated() {
        // Arrange
        when(authentication.isAuthenticated()).thenReturn(false);

        // Act & Assert
        assertThatThrownBy(() -> accountService.getCurrentUserAccount())
                .isInstanceOf(UnauthorizedOperationException.class)
                .hasMessageContaining("not authenticated");
    }

    @Test
    @DisplayName("Should throw exception when account is deleted")
    void testGetCurrentUserAccount_AccountDeleted() {
        // Arrange
        testUser.setIsActive(false);
        testUser.setDeletedAt(LocalDateTime.now());
        when(userRepository.findByEmail("student@test.com")).thenReturn(Optional.of(testUser));

        // Act & Assert
        assertThatThrownBy(() -> accountService.getCurrentUserAccount())
                .isInstanceOf(AccountDeletedException.class);
    }

    @Test
    @DisplayName("Should update student profile successfully")
    void testUpdateProfile_StudentSuccess() {
        // Arrange
        when(userRepository.findByEmail("student@test.com")).thenReturn(Optional.of(testUser));
        when(studentProfileRepository.findByUser(testUser)).thenReturn(Optional.of(testStudentProfile));
        when(studentProfileRepository.save(any(StudentProfile.class))).thenReturn(testStudentProfile);

        UpdateProfileRequestDTO request = new UpdateProfileRequestDTO();
        request.setFullName("Updated Name");
        request.setSchoolName("New School");
        request.setGrade(11);

        // Act
        AccountResponseDTO response = accountService.updateProfile(request);

        // Assert
        assertThat(response).isNotNull();
        verify(studentProfileRepository).save(testStudentProfile);
        assertThat(testStudentProfile.getFullName()).isEqualTo("Updated Name");
        assertThat(testStudentProfile.getSchoolName()).isEqualTo("New School");
        assertThat(testStudentProfile.getGrade()).isEqualTo(11);
    }

    @Test
    @DisplayName("Should change password successfully")
    void testChangePassword_Success() {
        // Arrange
        when(userRepository.findByEmail("student@test.com")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("currentPassword", "encodedPassword")).thenReturn(true);
        when(passwordEncoder.matches("newPassword123!", "encodedPassword")).thenReturn(false);
        when(passwordEncoder.encode("newPassword123!")).thenReturn("newEncodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        ChangePasswordRequestDTO request = new ChangePasswordRequestDTO();
        request.setCurrentPassword("currentPassword");
        request.setNewPassword("newPassword123!");
        request.setConfirmPassword("newPassword123!");

        // Act
        accountService.changePassword(request);

        // Assert
        verify(passwordEncoder).encode("newPassword123!");
        verify(userRepository).save(testUser);
        assertThat(testUser.getPassword()).isEqualTo("newEncodedPassword");
    }

    @Test
    @DisplayName("Should throw exception when current password is incorrect")
    void testChangePassword_InvalidCurrentPassword() {
        // Arrange
        when(userRepository.findByEmail("student@test.com")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("wrongPassword", "encodedPassword")).thenReturn(false);

        ChangePasswordRequestDTO request = new ChangePasswordRequestDTO();
        request.setCurrentPassword("wrongPassword");
        request.setNewPassword("newPassword123!");
        request.setConfirmPassword("newPassword123!");

        // Act & Assert
        assertThatThrownBy(() -> accountService.changePassword(request))
                .isInstanceOf(InvalidPasswordException.class)
                .hasMessageContaining("incorrect");
    }

    @Test
    @DisplayName("Should throw exception when passwords don't match")
    void testChangePassword_PasswordMismatch() {
        // Arrange
        when(userRepository.findByEmail("student@test.com")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("currentPassword", "encodedPassword")).thenReturn(true);

        ChangePasswordRequestDTO request = new ChangePasswordRequestDTO();
        request.setCurrentPassword("currentPassword");
        request.setNewPassword("newPassword123!");
        request.setConfirmPassword("differentPassword123!");

        // Act & Assert
        assertThatThrownBy(() -> accountService.changePassword(request))
                .isInstanceOf(InvalidPasswordException.class)
                .hasMessageContaining("do not match");
    }

    @Test
    @DisplayName("Should throw exception for OAuth2 users trying to change password")
    void testChangePassword_OAuth2User() {
        // Arrange
        testUser.setProvider(AuthProvider.GOOGLE);
        when(userRepository.findByEmail("student@test.com")).thenReturn(Optional.of(testUser));

        ChangePasswordRequestDTO request = new ChangePasswordRequestDTO();
        request.setCurrentPassword("currentPassword");
        request.setNewPassword("newPassword123!");
        request.setConfirmPassword("newPassword123!");

        // Act & Assert
        assertThatThrownBy(() -> accountService.changePassword(request))
                .isInstanceOf(InvalidPasswordException.class)
                .hasMessageContaining("OAuth2");
    }

    @Test
    @DisplayName("Should change email successfully")
    void testChangeEmail_Success() {
        // Arrange
        when(userRepository.findByEmail("student@test.com")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("password", "encodedPassword")).thenReturn(true);
        when(userRepository.existsByEmail("newemail@test.com")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(studentProfileRepository.findByUser(testUser)).thenReturn(Optional.of(testStudentProfile));

        ChangeEmailRequestDTO request = new ChangeEmailRequestDTO();
        request.setNewEmail("newemail@test.com");
        request.setPassword("password");

        // Act
        AccountResponseDTO response = accountService.changeEmail(request);

        // Assert
        assertThat(response).isNotNull();
        verify(userRepository).save(testUser);
        assertThat(testUser.getEmail()).isEqualTo("newemail@test.com");
    }

    @Test
    @DisplayName("Should throw exception when email already exists")
    void testChangeEmail_EmailExists() {
        // Arrange
        when(userRepository.findByEmail("student@test.com")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("password", "encodedPassword")).thenReturn(true);
        when(userRepository.existsByEmail("existing@test.com")).thenReturn(true);

        ChangeEmailRequestDTO request = new ChangeEmailRequestDTO();
        request.setNewEmail("existing@test.com");
        request.setPassword("password");

        // Act & Assert
        assertThatThrownBy(() -> accountService.changeEmail(request))
                .isInstanceOf(EmailAlreadyExistsException.class);
    }

    @Test
    @DisplayName("Should delete account successfully")
    void testDeleteAccount_Success() {
        // Arrange
        when(userRepository.findByEmail("student@test.com")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("password", "encodedPassword")).thenReturn(true);
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        DeleteAccountRequestDTO request = new DeleteAccountRequestDTO();
        request.setPassword("password");

        // Act
        accountService.deleteAccount(request);

        // Assert
        verify(userRepository).save(testUser);
        assertThat(testUser.getIsActive()).isFalse();
        assertThat(testUser.getDeletedAt()).isNotNull();
    }

    @Test
    @DisplayName("Should throw exception when deleting account with wrong password")
    void testDeleteAccount_InvalidPassword() {
        // Arrange
        when(userRepository.findByEmail("student@test.com")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("wrongPassword", "encodedPassword")).thenReturn(false);

        DeleteAccountRequestDTO request = new DeleteAccountRequestDTO();
        request.setPassword("wrongPassword");

        // Act & Assert
        assertThatThrownBy(() -> accountService.deleteAccount(request))
                .isInstanceOf(InvalidPasswordException.class)
                .hasMessageContaining("incorrect");
    }
}
