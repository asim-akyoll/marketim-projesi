package com.marketim.backend.order;

import com.marketim.backend.product.Product;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "order_items")
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // hangi siparişe ait
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    // hangi ürün
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    // adet
    @Column(nullable = false)
    private Integer quantity;

    // sipariş anındaki birim fiyat
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal unitPrice;

    // satır toplamı (unitPrice * quantity)
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal lineTotal;
}
