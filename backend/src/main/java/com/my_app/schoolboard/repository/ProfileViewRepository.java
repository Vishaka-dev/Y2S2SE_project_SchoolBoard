package com.my_app.schoolboard.repository;

import com.my_app.schoolboard.model.ProfileView;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProfileViewRepository extends JpaRepository<ProfileView, Long> {
    
    /**
     * Checks if a user has already viewed this profile
     */
    boolean existsByViewerIdAndViewedId(Long viewerId, Long viewedId);
    
    /**
     * Optional: Counts true distinct views explicitly from logs
     */
    long countByViewedId(Long viewedId);
}
