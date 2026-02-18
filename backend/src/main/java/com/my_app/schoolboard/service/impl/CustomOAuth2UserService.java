package com.my_app.schoolboard.service.impl;

import com.my_app.schoolboard.dto.OAuth2UserInfo;
import com.my_app.schoolboard.exception.OAuth2AuthenticationProcessingException;
import com.my_app.schoolboard.model.AuthProvider;
import com.my_app.schoolboard.model.Role;
import com.my_app.schoolboard.model.User;
import com.my_app.schoolboard.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.Optional;

/**
 * Custom OAuth2 User Service to handle Google OAuth2 login
 * Processes OAuth2 user info and creates/updates users in database
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        log.info("=== OAuth2 User Load Started ===");
        log.info("Client Registration ID: {}", userRequest.getClientRegistration().getRegistrationId());
        
        OAuth2User oAuth2User = super.loadUser(userRequest);
        log.info("OAuth2 User Attributes: {}", oAuth2User.getAttributes());
        
        try {
            OAuth2User result = processOAuth2User(userRequest, oAuth2User);
            log.info("=== OAuth2 User Load Completed Successfully ===");
            return result;
        } catch (Exception ex) {
            log.error("=== OAuth2 User Load Failed ===", ex);
            throw new OAuth2AuthenticationProcessingException(ex.getMessage(), ex);
        }
    }

    private OAuth2User processOAuth2User(OAuth2UserRequest userRequest, OAuth2User oAuth2User) {
        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        OAuth2UserInfo oAuth2UserInfo = OAuth2UserInfo.fromGoogle(oAuth2User.getAttributes());

        if (!StringUtils.hasText(oAuth2UserInfo.getEmail())) {
            throw new OAuth2AuthenticationProcessingException("Email not found from OAuth2 provider");
        }

        log.info("Processing OAuth2 user: {} from provider: {}", oAuth2UserInfo.getEmail(), registrationId);

        Optional<User> userOptional = userRepository.findByEmail(oAuth2UserInfo.getEmail());
        User user;

        if (userOptional.isPresent()) {
            user = userOptional.get();
            log.info("Existing user found with email: {} and provider: {}", 
                    oAuth2UserInfo.getEmail(), user.getProvider());
            
            // Update user info from OAuth2 provider if it's a Google user
            if (user.getProvider().equals(AuthProvider.GOOGLE)) {
                user = updateExistingUser(user, oAuth2UserInfo);
            }
            // If it's a LOCAL user, just authenticate them (no update needed)
        } else {
            // Email doesn't exist - create new Google user
            user = registerNewUser(oAuth2UserInfo);
        }

        return new CustomOAuth2User(oAuth2User.getAttributes(), user);
    }

    private User registerNewUser(OAuth2UserInfo oAuth2UserInfo) {
        log.info("Registering new OAuth2 user: {}", oAuth2UserInfo.getEmail());
        
        // Generate username from email or name
        String username = generateUsername(oAuth2UserInfo.getEmail());
        
        User user = User.builder()
                .username(username)
                .email(oAuth2UserInfo.getEmail())
                .provider(AuthProvider.GOOGLE)
                .providerId(oAuth2UserInfo.getId())
                .imageUrl(oAuth2UserInfo.getImageUrl())
                .role(Role.USER)
                .build();

        return userRepository.save(user);
    }

    private User updateExistingUser(User existingUser, OAuth2UserInfo oAuth2UserInfo) {
        log.info("Updating existing OAuth2 user: {}", oAuth2UserInfo.getEmail());
        
        existingUser.setImageUrl(oAuth2UserInfo.getImageUrl());
        existingUser.setProviderId(oAuth2UserInfo.getId());
        
        return userRepository.save(existingUser);
    }

    private String generateUsername(String email) {
        String baseUsername = email.split("@")[0].replaceAll("[^a-zA-Z0-9]", "_");
        String username = baseUsername;
        int counter = 1;
        
        while (userRepository.existsByUsername(username)) {
            username = baseUsername + "_" + counter++;
        }
        
        return username;
    }
}
