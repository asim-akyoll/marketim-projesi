package com.marketim.backend.order;

import com.marketim.backend.user.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // siparişi veren kullanıcı (Guest ise null olabilir)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = true)
    private User user;

    // toplam tutar
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    // ürünler toplamı (kargo hariç)
    @Column(nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal subtotalAmount = BigDecimal.ZERO;

    // teslimat ücreti
    @Column(nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal deliveryFee = BigDecimal.ZERO;


    // sipariş durumu
    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status = OrderStatus.PENDING;

    // teslimat adresi (opsiyonel)
    private String deliveryAddress;

    // oluşturulma zamanı
    @CreationTimestamp
    private LocalDateTime createdAt;

    // sipariş satırları
    @Builder.Default
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private PaymentMethod paymentMethod = PaymentMethod.CASH;

    private String note;

    @Column(name = "contact_phone")
    private String contactPhone;

    // Guest info
    private String guestName;
    private String guestEmail;

}
