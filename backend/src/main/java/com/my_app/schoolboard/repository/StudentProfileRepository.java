package com.my_app.schoolboard.repository;

import com.my_app.schoolboard.model.StudentProfile;
import com.my_app.schoolboard.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface StudentProfileRepository extends JpaRepository<StudentProfile, Long> {

    Optional<StudentProfile> findByUser(User user);

    Optional<StudentProfile> findByUserId(Long userId);

    List<StudentProfile> findByUserIdIn(Collection<Long> userIds);

    boolean existsByUser(User user);
}
