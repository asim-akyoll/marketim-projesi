package com.marketim.backend.order;

import java.util.Set;

public enum OrderStatus {
    PENDING,
    DELIVERED,
    CANCELLED;

    /**
     * Backend tek otorite: status geçiş kuralları burada.
     * - PENDING -> DELIVERED / CANCELLED olabilir
     * - DELIVERED -> hiçbir şeye geçemez
     * - CANCELLED -> hiçbir şeye geçemez
     */
    public boolean canTransitionTo(OrderStatus target) {
        if (target == null) return false;

        // aynı status seçimi: idempotent davranmak için true
        if (this == target) return true;

        return switch (this) {
            case PENDING -> Set.of(DELIVERED, CANCELLED).contains(target);
            case DELIVERED -> false;
            case CANCELLED -> false;
        };
    }
}
