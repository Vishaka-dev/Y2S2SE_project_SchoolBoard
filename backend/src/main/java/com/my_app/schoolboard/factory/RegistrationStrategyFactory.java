package com.my_app.schoolboard.factory;

import com.my_app.schoolboard.model.Role;
import com.my_app.schoolboard.strategy.InstituteRegistrationStrategy;
import com.my_app.schoolboard.strategy.RegistrationStrategy;
import com.my_app.schoolboard.strategy.StudentRegistrationStrategy;
import com.my_app.schoolboard.strategy.TeacherRegistrationStrategy;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * Factory for creating registration strategies based on user role
 * Follows Factory Pattern and Dependency Inversion Principle
 */
@Component
@RequiredArgsConstructor
public class RegistrationStrategyFactory {

    private final StudentRegistrationStrategy studentStrategy;
    private final TeacherRegistrationStrategy teacherStrategy;
    private final InstituteRegistrationStrategy instituteStrategy;

    /**
     * Returns the appropriate registration strategy based on role
     * 
     * @param role The user role
     * @return The corresponding registration strategy
     * @throws IllegalArgumentException if role is not supported
     */
    public RegistrationStrategy getStrategy(Role role) {
        return switch (role) {
            case STUDENT -> studentStrategy;
            case TEACHER -> teacherStrategy;
            case INSTITUTE -> instituteStrategy;
            case ADMIN -> throw new IllegalArgumentException(
                    "Admin users cannot be registered through this endpoint");
            default -> throw new IllegalArgumentException(
                    "Unknown role: " + role);
        };
    }
}
