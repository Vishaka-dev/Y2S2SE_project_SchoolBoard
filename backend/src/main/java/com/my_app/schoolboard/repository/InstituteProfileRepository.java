package com.my_app.schoolboard.repository;

import com.my_app.schoolboard.model.InstituteProfile;
import com.my_app.schoolboard.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InstituteProfileRepository extends JpaRepository<InstituteProfile, Long> {

    Optional<InstituteProfile> findByUser(User user);

    Optional<InstituteProfile> findByUserId(Long userId);

    boolean existsByUser(User user);

    boolean existsByRegistrationNumber(String registrationNumber);
}
