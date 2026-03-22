package com.my_app.schoolboard.integration;

import com.my_app.schoolboard.dto.*;
import com.my_app.schoolboard.model.*;
import com.my_app.schoolboard.repository.*;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.*;

/**
 * Integration tests for Account Management feature
 */
@SpringBootTest
@ActiveProfiles("test")
@DisplayName("Account Management Integration Tests")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class AccountManagementIntegrationTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    private TeacherProfileRepository teacherProfileRepository;

    @Autowired
    private InstituteProfileRepository instituteProfileRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User testUser;
    private StudentProfile testProfile;

    @BeforeEach
    void setUp() {
        // Clean up database
        studentProfileRepository.deleteAll();
        teacherProfileRepository.deleteAll();
        instituteProfileRepository.deleteAll();
        userRepository.deleteAll();

        // Create test user
        testUser = User.builder()
                .email("integration@test.com")
                .username("integrationuser")
                .password(passwordEncoder.encode("Password123!"))
                .role(Role.STUDENT)
                .provider(AuthProvider.LOCAL)
                .isActive(true)
                .build();
        testUser = userRepository.saveAndFlush(testUser);

        // Create test profile
        testProfile = StudentProfile.builder()
                .user(testUser)
                .educationLevel(EducationLevel.SCHOOL)
                .fullName("Integration Test")
                .dateOfBirth(LocalDate.of(2005, 6, 15))
                .province("Western")
                .schoolName("Test Integration School")
                .grade(10)
                .build();
        testProfile = studentProfileRepository.saveAndFlush(testProfile);
    }

    @AfterEach
    void tearDown() {
        studentProfileRepository.deleteAll();
        teacherProfileRepository.deleteAll();
        instituteProfileRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    @Order(1)
    @DisplayName("Should create user with active status by default")
    void testUserCreation_DefaultActiveStatus() {
        // Assert
        User savedUser = userRepository.findByEmail("integration@test.com").orElseThrow();
        assertThat(savedUser.getIsActive()).isTrue();
        assertThat(savedUser.getDeletedAt()).isNull();
        assertThat(savedUser.isDeleted()).isFalse();
    }

    @Test
    @Order(2)
    @DisplayName("Should soft delete user account")
    void testSoftDelete_Success() {
        // Act
        testUser.softDelete();
        userRepository.saveAndFlush(testUser);

        // Assert
        User deletedUser = userRepository.findById(testUser.getId()).orElseThrow();
        assertThat(deletedUser.getIsActive()).isFalse();
        assertThat(deletedUser.getDeletedAt()).isNotNull();
        assertThat(deletedUser.isDeleted()).isTrue();
    }

    @Test
    @Order(3)
    @DisplayName("Should not find deleted users with active queries")
    void testActiveQueries_ExcludeDeletedUsers() {
        // Arrange
        testUser.softDelete();
        userRepository.saveAndFlush(testUser);

        // Act
        var activeUser = userRepository.findActiveByEmail("integration@test.com");

        // Assert
        assertThat(activeUser).isEmpty();
    }

    @Test
    @Order(4)
    @DisplayName("Should still find deleted users with regular queries")
    void testRegularQueries_IncludeDeletedUsers() {
        // Arrange
        testUser.softDelete();
        userRepository.saveAndFlush(testUser);

        // Act
        var user = userRepository.findByEmail("integration@test.com");

        // Assert
        assertThat(user).isPresent();
        assertThat(user.get().isDeleted()).isTrue();
    }

    @Test
    @Order(5)
    @DisplayName("Should update student profile without changing education level")
    void testUpdateProfile_StudentProfile() {
        // Act
        testProfile.setFullName("Updated Name");
        testProfile.setSchoolName("Updated School");
        testProfile.setGrade(11);
        studentProfileRepository.saveAndFlush(testProfile);

        // Assert
        StudentProfile updatedProfile = studentProfileRepository.findById(testProfile.getId()).orElseThrow();
        assertThat(updatedProfile.getFullName()).isEqualTo("Updated Name");
        assertThat(updatedProfile.getSchoolName()).isEqualTo("Updated School");
        assertThat(updatedProfile.getGrade()).isEqualTo(11);
        assertThat(updatedProfile.getEducationLevel()).isEqualTo(EducationLevel.SCHOOL);
    }

    @Test
    @Order(6)
    @DisplayName("Should validate password encoding")
    void testPasswordEncoding() {
        // Arrange
        String rawPassword = "Password123!";
        String encodedPassword = testUser.getPassword();

        // Assert
        assertThat(passwordEncoder.matches(rawPassword, encodedPassword)).isTrue();
        assertThat(passwordEncoder.matches("WrongPassword", encodedPassword)).isFalse();
    }

    @Test
    @Order(7)
    @DisplayName("Should prevent duplicate emails")
    void testEmailUniqueness() {
        // Arrange
        User duplicateUser = User.builder()
                .email("integration@test.com") // Same email
                .username("differentuser")
                .password(passwordEncoder.encode("Password123!"))
                .role(Role.TEACHER)
                .provider(AuthProvider.LOCAL)
                .isActive(true)
                .build();

        // Act & Assert
        assertThatThrownBy(() -> userRepository.saveAndFlush(duplicateUser))
                .isInstanceOf(Exception.class); // DataIntegrityViolationException
    }

    @Test
    @Order(8)
    @DisplayName("Should maintain profile relationship after user update")
    void testProfileRelationship_AfterUserUpdate() {
        // Act
        testUser.setEmail("newemail@test.com");
        userRepository.saveAndFlush(testUser);

        // Assert
        StudentProfile profile = studentProfileRepository.findByUserId(testUser.getId()).orElseThrow();
        assertThat(profile.getUser().getId()).isEqualTo(testUser.getId());
        assertThat(profile.getUser().getEmail()).isEqualTo("newemail@test.com");
    }

    @Test
    @Order(9)
    @DisplayName("Should create teacher profile successfully")
    void testTeacherProfile_Creation() {
        // Arrange
        User teacherUser = User.builder()
                .email("teacher@test.com")
                .username("teacheruser")
                .password(passwordEncoder.encode("Password123!"))
                .role(Role.TEACHER)
                .provider(AuthProvider.LOCAL)
                .isActive(true)
                .build();
        teacherUser = userRepository.saveAndFlush(teacherUser);

        TeacherProfile teacherProfile = TeacherProfile.builder()
                .user(teacherUser)
                .fullName("Test Teacher")
                .dateOfBirth(LocalDate.of(1980, 5, 10))
                .province("Central")
                .institutionName("Test University")
                .subjectSpecialization("Mathematics")
                .yearsOfExperience(10)
                .qualifications("PhD in Mathematics")
                .build();

        // Act
        teacherProfile = teacherProfileRepository.saveAndFlush(teacherProfile);

        // Assert
        assertThat(teacherProfile.getId()).isNotNull();
        assertThat(teacherProfile.getUser().getId()).isEqualTo(teacherUser.getId());
        assertThat(teacherProfile.getFullName()).isEqualTo("Test Teacher");
    }

    @Test
    @Order(10)
    @DisplayName("Should create institute profile successfully")
    void testInstituteProfile_Creation() {
        // Arrange
        User instituteUser = User.builder()
                .email("institute@test.com")
                .username("instituteuser")
                .password(passwordEncoder.encode("Password123!"))
                .role(Role.INSTITUTE)
                .provider(AuthProvider.LOCAL)
                .isActive(true)
                .build();
        instituteUser = userRepository.saveAndFlush(instituteUser);

        InstituteProfile instituteProfile = InstituteProfile.builder()
                .user(instituteUser)
                .institutionName("Test Institute")
                .institutionType("UNIVERSITY")
                .registrationNumber("REG123456")
                .province("Western")
                .district("Colombo")
                .address("123 Test Street")
                .contactPerson("John Doe")
                .contactNumber("0771234567")
                .website("https://test-institute.com")
                .verified(false)
                .build();

        // Act
        instituteProfile = instituteProfileRepository.saveAndFlush(instituteProfile);

        // Assert
        assertThat(instituteProfile.getId()).isNotNull();
        assertThat(instituteProfile.getUser().getId()).isEqualTo(instituteUser.getId());
        assertThat(instituteProfile.getInstitutionName()).isEqualTo("Test Institute");
        assertThat(instituteProfile.getVerified()).isFalse();
    }

    @Test
    @Order(11)
    @DisplayName("Should handle OAuth2 users correctly")
    void testOAuth2User_NullPassword() {
        // Arrange
        User oauth2User = User.builder()
                .email("oauth@test.com")
                .username("oauth_user")
                .password(null) // OAuth2 users may not have password
                .role(Role.STUDENT)
                .provider(AuthProvider.GOOGLE)
                .providerId("google-123456")
                .imageUrl("https://example.com/image.jpg")
                .isActive(true)
                .build();

        // Act
        oauth2User = userRepository.saveAndFlush(oauth2User);

        // Assert
        User savedUser = userRepository.findById(oauth2User.getId()).orElseThrow();
        assertThat(savedUser.getPassword()).isNull();
        assertThat(savedUser.getProvider()).isEqualTo(AuthProvider.GOOGLE);
        assertThat(savedUser.getProviderId()).isEqualTo("google-123456");
    }

    @Test
    @Order(12)
    @DisplayName("Should preserve profile data after soft delete")
    void testSoftDelete_PreservesProfileData() {
        // Act
        testUser.softDelete();
        userRepository.saveAndFlush(testUser);

        // Assert
        StudentProfile profile = studentProfileRepository.findByUserId(testUser.getId()).orElseThrow();
        assertThat(profile.getFullName()).isEqualTo("Integration Test");
        assertThat(profile.getSchoolName()).isEqualTo("Test Integration School");
        assertThat(profile.getUser().isDeleted()).isTrue();
    }
}
