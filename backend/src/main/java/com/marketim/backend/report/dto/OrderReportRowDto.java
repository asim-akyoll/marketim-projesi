package com.marketim.backend.report.dto;

import com.marketim.backend.order.OrderStatus;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Builder
public record OrderReportRowDto(
        Long orderId,
        LocalDateTime createdAt,
        String customerName,
        BigDecimal totalAmount,
        OrderStatus status
) {}
