package com.my_app.schoolboard.strategy;

import com.my_app.schoolboard.dto.CreateGroupRequestDTO;

import java.util.List;

/**
 * Strategy interface for group-type-specific behavior.
 * Follows Strategy Pattern and Open/Closed Principle.
 *
 * New group types can implement this interface to provide
 * custom validation, metadata requirements, and display labels
 * without modifying existing code.
 */
public interface GroupTypeBehavior {

    /**
     * Validates type-specific metadata in the create group request.
     *
     * @param request The create group request
     * @throws IllegalArgumentException if validation fails
     */
    void validateMetadata(CreateGroupRequestDTO request);

    /**
     * Returns the list of metadata fields that are important for this group type.
     *
     * @return List of field names
     */
    List<String> getRequiredFields();

    /**
     * Returns a human-readable display label for this group type.
     *
     * @return Display label
     */
    String getDisplayLabel();
}
