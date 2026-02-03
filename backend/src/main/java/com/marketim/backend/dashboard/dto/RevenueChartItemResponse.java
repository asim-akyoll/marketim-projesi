package com.marketim.backend.dashboard.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
public class RevenueChartItemResponse {
    private LocalDate day;      // 2025-12-22 gibi
    private BigDecimal total;   // o günün cirosu
}
