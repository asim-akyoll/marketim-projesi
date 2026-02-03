package com.marketim.backend.stock;

import com.marketim.backend.product.Product;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
@Entity
@Table(name = "stock_movements", indexes = {
        @Index(name = "idx_stock_movements_product_id", columnList = "product_id"),
        @Index(name = "idx_stock_movements_created_at", columnList = "createdAt")
})
public class StockMovement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // hangi ürün
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StockMovementType type;

    // + / - kaç değişti
    @Column(nullable = false)
    private Integer delta;

    @Column(nullable = false)
    private Integer beforeStock;

    @Column(nullable = false)
    private Integer afterStock;

    // opsiyonel referans (ORDER id gibi)
    private String referenceType; // "ORDER"
    private Long referenceId;     // orderId

    private String note;          // opsiyonel

    // opsiyonel actor (admin email vs.)
    private String actor;

    @CreationTimestamp
    private LocalDateTime createdAt;
}

