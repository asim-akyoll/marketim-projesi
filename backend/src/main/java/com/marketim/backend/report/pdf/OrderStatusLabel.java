package com.marketim.backend.report.pdf;

import com.marketim.backend.order.OrderStatus;

public final class OrderStatusLabel {

    private OrderStatusLabel() {}

    public static String tr(OrderStatus status) {
        if (status == null) return "-";
        return switch (status) {
            case PENDING -> "Bekliyor";
            case DELIVERED -> "Teslim Edildi";
            case CANCELLED -> "Iptal Edildi";
        };
    }
}

