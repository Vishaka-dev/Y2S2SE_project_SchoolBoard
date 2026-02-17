package com.my_app.schoolboard.service.impl;

import com.my_app.schoolboard.dto.AuthResponse;
import com.my_app.schoolboard.dto.LoginRequest;
import com.my_app.schoolboard.dto.RegisterRequest;
import com.my_app.schoolboard.exception.InvalidCredentialsException;
import com.my_app.schoolboard.exception.UserAlreadyExistsException;
import com.my_app.schoolboard.model.Role;
import com.my_app.schoolboard.model.User;
import com.my_app.schoolboard.repository.UserRepository;
import com.my_app.schoolboard.service.AuthService;
import com.my_app.schoolboard.service.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        log.info("Attempting to register user: {}", request.getUsername());

        // Validate username uniqueness
        if (userRepository.existsByUsername(request.getUsername())) {
            log.warn("Registration failed: Username {} already exists", request.getUsername());
            throw new UserAlreadyExistsException("Username already exists");
        }

        // Validate email uniqueness
        if (userRepository.existsByEmail(request.getEmail())) {
            log.warn("Registration failed: Email {} already exists", request.getEmail());
            throw new UserAlreadyExistsException("Email already exists");
        }

        // Create new user
        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .build();

        User savedUser = userRepository.save(user);
        log.info("User registered successfully: {}", savedUser.getUsername());

        // Generate JWT token
        String token = jwtService.generateToken(savedUser);

        return mapToAuthResponse(savedUser, token, "Registration successful");
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        log.info("Attempting login for user: {}", request.getUsername());

        // Find user by username
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> {
                    log.warn("Login failed: User {} not found", request.getUsername());
                    return new InvalidCredentialsException("Invalid username or password");
                });

        // Verify password
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            log.warn("Login failed: Invalid password for user {}", request.getUsername());
            throw new InvalidCredentialsException("Invalid username or password");
        }

        log.info("User logged in successfully: {}", user.getUsername());

        // Generate JWT token
        String token = jwtService.generateToken(user);

        return mapToAuthResponse(user, token, "Login successful");
    }

    /**
     * Maps User entity to AuthResponse DTO
     */
    private AuthResponse mapToAuthResponse(User user, String token, String message) {
        return AuthResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .token(token)
                .message(message)
                .build();
    }
}
