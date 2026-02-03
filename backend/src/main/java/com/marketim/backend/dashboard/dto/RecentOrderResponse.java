package com.marketim.backend.dashboard.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class RecentOrderResponse {
    private Long id;
    private String userFullName;
    private BigDecimal totalAmount;
    private String status;
    private LocalDateTime createdAt;
}
