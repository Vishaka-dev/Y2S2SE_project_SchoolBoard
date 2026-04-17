package com.my_app.schoolboard.repository;

import com.my_app.schoolboard.model.StudyGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudyGroupRepository extends JpaRepository<StudyGroup, Long> {

    List<StudyGroup> findByCreatedBy_Id(Long userId);

    @Query("SELECT g FROM StudyGroup g WHERE LOWER(g.name) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<StudyGroup> searchByName(@Param("keyword") String keyword);
}
