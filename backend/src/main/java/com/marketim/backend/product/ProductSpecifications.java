package com.marketim.backend.product;

import org.springframework.data.jpa.domain.Specification;

public class ProductSpecifications {

    public static Specification<Product> activeEquals(Boolean active) {
        return (root, query, cb) -> {
            if (active == null) return cb.conjunction();
            return cb.equal(root.get("active"), active);
        };
    }

    public static Specification<Product> categoryIdEquals(Long categoryId) {
        return (root, query, cb) -> {
            if (categoryId == null) return cb.conjunction();
            return cb.equal(root.get("category").get("id"), categoryId);
        };
    }

    public static Specification<Product> nameContains(String q) {
        return (root, query, criteriaBuilder) -> {
            if (q == null || q.isBlank()) {
                return null;
            }
            String pattern = q.toLowerCase();
            // 1. Starts with checking (e.g. "Do" -> "Doritos")
            jakarta.persistence.criteria.Predicate startsWith = criteriaBuilder.like(criteriaBuilder.lower(root.get("name")), pattern + "%");
            // 2. Word starts with checking (e.g. "Pe" -> "Doritos Peynirli") checks " Pe%"
            jakarta.persistence.criteria.Predicate wordStartsWith = criteriaBuilder.like(criteriaBuilder.lower(root.get("name")), "% " + pattern + "%");
            
            return criteriaBuilder.or(startsWith, wordStartsWith);
        };
    }
}
