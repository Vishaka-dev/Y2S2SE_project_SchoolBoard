package com.my_app.schoolboard.specification;

import com.my_app.schoolboard.model.Resource;
import com.my_app.schoolboard.model.ResourceCategory;
import com.my_app.schoolboard.model.ResourceType;
import com.my_app.schoolboard.model.Role;
import org.springframework.data.jpa.domain.Specification;

public final class ResourceSpecification {

    private ResourceSpecification() {
    }

    public static Specification<Resource> notDeleted() {
        return (root, query, cb) -> cb.isFalse(root.get("isDeleted"));
    }

    public static Specification<Resource> hasCategory(ResourceCategory category) {
        return (root, query, cb) -> category == null ? null : cb.equal(root.get("category"), category);
    }

    public static Specification<Resource> hasType(ResourceType type) {
        return (root, query, cb) -> type == null ? null : cb.equal(root.get("type"), type);
    }

    public static Specification<Resource> titleContains(String search) {
        return (root, query, cb) -> {
            if (search == null || search.isBlank()) {
                return null;
            }
            return cb.like(cb.lower(root.get("title")), "%" + search.trim().toLowerCase() + "%");
        };
    }

    public static Specification<Resource> uploaderHasRole(Role role) {
        return (root, query, cb) -> role == null ? null : cb.equal(root.get("uploadedBy").get("role"), role);
    }
}
