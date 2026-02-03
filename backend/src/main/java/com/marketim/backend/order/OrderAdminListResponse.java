package com.marketim.backend.order;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class OrderAdminListResponse {
    private Long id;
    private OrderStatus status;
    private BigDecimal totalAmount;
    private LocalDateTime createdAt;
    private String customerName;
    private String address;
    private Long itemsCount;
    private String note;
    private String contactPhone;
    private String guestName;
    private String guestEmail;
}

