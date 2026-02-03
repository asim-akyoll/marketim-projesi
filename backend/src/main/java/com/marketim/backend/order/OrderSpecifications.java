package com.marketim.backend.order;

import org.springframework.data.jpa.domain.Specification;

public final class OrderSpecifications {

    private OrderSpecifications() {
        // utility class
    }

    /**
     * ID filtresi
     * id null ise filtre uygulanmaz
     */
    public static Specification<Order> hasId(Long id) {
        return (root, query, cb) ->
                id == null
                        ? cb.conjunction()
                        : cb.equal(root.get("id"), id);
    }

    /**
     * Status filtresi
     * status null ise (ALL) filtre uygulanmaz
     */
    public static Specification<Order> hasStatus(OrderStatus status) {
        return (root, query, cb) ->
                status == null
                        ? cb.conjunction()
                        : cb.equal(root.get("status"), status);
    }
    /**
     * Genel arama (ID, İsim, Adres, Telefon)
     */
    public static Specification<Order> containsText(String q) {
        return (root, query, cb) -> {
            if (q == null || q.isBlank()) return cb.conjunction();
            String likePattern = "%" + q.toLowerCase(java.util.Locale.ENGLISH) + "%";

            // Join user (LEFT join)
            // Note: We use raw Join usually or fetch. Since we are in count/select queries, a simple join is enough for filtering.
            jakarta.persistence.criteria.Join<Object, Object> userJoin = root.join("user", jakarta.persistence.criteria.JoinType.LEFT);

            return cb.or(
                    // ID match (as string)
                    cb.like(root.get("id").as(String.class), likePattern),
                    // Guest Info
                    cb.like(cb.lower(root.get("guestName")), likePattern),
                    cb.like(cb.lower(root.get("contactPhone")), likePattern),
                    cb.like(cb.lower(root.get("deliveryAddress")), likePattern),
                    // User Info
                    cb.like(cb.lower(userJoin.get("firstName")), likePattern),
                    cb.like(cb.lower(userJoin.get("lastName")), likePattern),
                    cb.like(cb.lower(userJoin.get("email")), likePattern),
                    cb.like(cb.lower(userJoin.get("phone")), likePattern)
            );
        };
    }
}

