package com.marketim.backend.report.dto;

import lombok.Builder;

import java.math.BigDecimal;

@Builder
public record SummaryReportDto(
        long totalOrders,
        long deliveredCount,
        long cancelledCount,
        BigDecimal revenue,
        BigDecimal avgOrderAmount
) {}
