package com.my_app.schoolboard.repository;

import com.my_app.schoolboard.model.GroupPicture;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GroupPictureRepository extends JpaRepository<GroupPicture, Long> {

    Optional<GroupPicture> findByGroup_Id(Long groupId);
}
