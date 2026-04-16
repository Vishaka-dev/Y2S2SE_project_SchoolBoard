package com.my_app.schoolboard.repository;

import com.my_app.schoolboard.model.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, Long>, JpaSpecificationExecutor<Resource> {

    @Override
    @EntityGraph(attributePaths = { "uploadedBy", "tags" })
    Page<Resource> findAll(Specification<Resource> spec, Pageable pageable);
}
