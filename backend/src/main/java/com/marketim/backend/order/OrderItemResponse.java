package com.marketim.backend.order;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItemResponse {
    private Long productId;
    private String productName;
    private String unitLabel;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal lineTotal;
}
