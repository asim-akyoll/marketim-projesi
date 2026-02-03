package com.marketim.backend.order;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderCreateRequest {

    @NotBlank(message = "Teslimat adresi boş bırakılamaz.")
    private String deliveryAddress;

    @NotEmpty(message = "Sipariş ürünleri boş olamaz.")
    private List<OrderItemCreateRequest> items;

    private PaymentMethod paymentMethod;
    
    private String note;
    
    private String contactPhone;
    
    // Guest info
    private String guestName;
    private String guestEmail;
}

