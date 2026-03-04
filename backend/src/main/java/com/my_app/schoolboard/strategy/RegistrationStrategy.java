package com.my_app.schoolboard.strategy;

import com.my_app.schoolboard.dto.RegisterRequest;
import com.my_app.schoolboard.model.User;

/**
 * Strategy interface for role-based registration
 * Follows Strategy Pattern and Open/Closed Principle
 */
public interface RegistrationStrategy {

    /**
     * Creates profile based on registration request
     * 
     * @param user    The saved user entity
     * @param request The registration request containing profile data
     */
    void createProfile(User user, RegisterRequest request);

    /**
     * Validates role-specific fields before registration
     * 
     * @param request The registration request
     * @throws IllegalArgumentException if validation fails
     */
    void validateRequest(RegisterRequest request);
}
