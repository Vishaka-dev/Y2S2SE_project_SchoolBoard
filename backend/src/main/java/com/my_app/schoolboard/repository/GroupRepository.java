package com.my_app.schoolboard.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.my_app.schoolboard.model.Group;

@Repository
public interface GroupRepository extends JpaRepository<Group, Long> {

    @Query("""
            SELECT DISTINCT g
            FROM StudyGroup g
            LEFT JOIN GroupMember gm
                ON gm.group = g
               AND gm.user.id = :userId
            WHERE g.visibility = com.my_app.schoolboard.model.GroupVisibility.PUBLIC
               OR gm.id IS NOT NULL
            ORDER BY g.createdAt DESC
            """)
    List<Group> findAccessibleGroups(@Param("userId") Long userId);

    @Query("""
            SELECT DISTINCT g
            FROM StudyGroup g
            LEFT JOIN GroupMember gm
                ON gm.group = g
               AND gm.user.id = :userId
            WHERE (LOWER(g.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
               OR LOWER(g.description) LIKE LOWER(CONCAT('%', :keyword, '%')))
              AND (g.visibility = com.my_app.schoolboard.model.GroupVisibility.PUBLIC
               OR gm.id IS NOT NULL)
            ORDER BY g.createdAt DESC
            """)
    List<Group> searchGroups(@Param("keyword") String keyword, @Param("userId") Long userId);
}
