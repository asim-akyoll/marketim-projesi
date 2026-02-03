package com.marketim.backend.order;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderResponse {
    private Long id;
    private String status;
    private BigDecimal totalAmount;
    private BigDecimal subtotalAmount;
    private BigDecimal deliveryFee;
    private String deliveryAddress;
    private List<OrderItemResponse> items;
    private LocalDateTime createdAt;
    private String paymentMethod;
    private String note;
    private String contactPhone;
    private String guestName;
    private String guestEmail;
    private String customerName;

}
