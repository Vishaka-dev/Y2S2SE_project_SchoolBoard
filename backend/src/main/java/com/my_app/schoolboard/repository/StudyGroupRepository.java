package com.my_app.schoolboard.repository;

import com.my_app.schoolboard.model.StudyGroup;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudyGroupRepository extends JpaRepository<StudyGroup, Long> {

    List<StudyGroup> findByCreatedBy_Id(Long userId);

    @EntityGraph(attributePaths = {"picture"})
    Optional<StudyGroup> findWithPictureById(Long id);

    @EntityGraph(attributePaths = {"picture"})
    @Query("SELECT g FROM StudyGroup g")
    List<StudyGroup> findAllWithPictures();

    @EntityGraph(attributePaths = {"picture"})
    @Query("SELECT g FROM StudyGroup g WHERE LOWER(g.name) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<StudyGroup> searchByNameWithPicture(@Param("keyword") String keyword);
}
