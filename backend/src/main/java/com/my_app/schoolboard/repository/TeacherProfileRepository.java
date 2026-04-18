package com.my_app.schoolboard.repository;

import com.my_app.schoolboard.model.TeacherProfile;
import com.my_app.schoolboard.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface TeacherProfileRepository extends JpaRepository<TeacherProfile, Long> {

    Optional<TeacherProfile> findByUser(User user);

    Optional<TeacherProfile> findByUserId(Long userId);

    List<TeacherProfile> findByUserIdIn(Collection<Long> userIds);

    boolean existsByUser(User user);
}
