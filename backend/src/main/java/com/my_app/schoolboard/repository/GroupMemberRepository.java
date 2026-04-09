package com.my_app.schoolboard.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.my_app.schoolboard.model.GroupMember;

@Repository
public interface GroupMemberRepository extends JpaRepository<GroupMember, Long> {
    boolean existsByGroupIdAndUserId(Long groupId, Long userId);

    Optional<GroupMember> findByGroupIdAndUserId(Long groupId, Long userId);

    List<GroupMember> findAllByGroupIdOrderByJoinedAtAsc(Long groupId);

    List<GroupMember> findAllByUserIdOrderByJoinedAtDesc(Long userId);

    long countByGroupId(Long groupId);
}
