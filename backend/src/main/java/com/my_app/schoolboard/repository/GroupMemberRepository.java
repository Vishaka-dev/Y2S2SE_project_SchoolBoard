package com.my_app.schoolboard.repository;

import com.my_app.schoolboard.model.GroupMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GroupMemberRepository extends JpaRepository<GroupMember, Long> {

    boolean existsByGroup_IdAndUser_Id(Long groupId, Long userId);

    Optional<GroupMember> findByGroup_IdAndUser_Id(Long groupId, Long userId);

    List<GroupMember> findByGroup_Id(Long groupId);

    List<GroupMember> findByUser_Id(Long userId);

    @Query("SELECT DISTINCT gm FROM GroupMember gm JOIN FETCH gm.group g LEFT JOIN FETCH g.picture WHERE gm.user.id = :userId")
    List<GroupMember> findByUser_IdWithGroupAndPicture(@Param("userId") Long userId);

    long countByGroup_Id(Long groupId);

    void deleteByGroup_IdAndUser_Id(Long groupId, Long userId);
}
