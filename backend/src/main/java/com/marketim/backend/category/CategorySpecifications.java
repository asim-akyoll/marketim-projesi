package com.marketim.backend.category;

import org.springframework.data.jpa.domain.Specification;

public class CategorySpecifications {

    public static Specification<Category> q(String q) {
        if (q == null || q.trim().isEmpty()) return null;

        String like = "%" + q.trim().toLowerCase() + "%";
        return (root, query, cb) -> cb.like(cb.lower(root.get("name")), like);
    }

    public static Specification<Category> active(Boolean active) {
        if (active == null) return null;
        return (root, query, cb) -> cb.equal(root.get("active"), active);
    }
}

