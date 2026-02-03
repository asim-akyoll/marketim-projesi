package com.marketim.backend.order;

import com.marketim.backend.category.Category;
import com.marketim.backend.exception.BadRequestException;
import com.marketim.backend.product.Product;
import com.marketim.backend.product.ProductRepository;
import com.marketim.backend.settings.SettingKey;
import com.marketim.backend.settings.SettingService;
import com.marketim.backend.stock.StockMovementService;
import com.marketim.backend.user.User;
import com.marketim.backend.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class OrderServiceTest {

    private OrderRepository orderRepository;
    private ProductRepository productRepository;
    private UserRepository userRepository;
    private StockMovementService stockMovementService;
    private SettingService settingService;
    private OrderItemRepository orderItemRepository;

    private OrderService orderService;

    @BeforeEach
    void setup() {
        orderRepository = mock(OrderRepository.class);
        productRepository = mock(ProductRepository.class);
        userRepository = mock(UserRepository.class);
        stockMovementService = mock(StockMovementService.class);
        settingService = mock(SettingService.class);
        orderItemRepository = mock(OrderItemRepository.class);

        orderService = new OrderService(
                orderRepository,
                productRepository,
                userRepository,
                stockMovementService,
                settingService,
                orderItemRepository
        );

        // fake login
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("user@test.com", null, List.of())
        );

        // default settings (çoğu testte gerekli)
        when(settingService.getBoolean(eq(SettingKey.ORDER_ACCEPTING_ENABLED), anyBoolean()))
                .thenReturn(true);

        when(settingService.getBoolean(eq(SettingKey.PAYMENT_ON_DELIVERY_ENABLED), anyBoolean()))
                .thenReturn(true);

        when(settingService.getString(eq(SettingKey.PAYMENT_ON_DELIVERY_METHODS), anyString()))
                .thenReturn("CASH,CARD");

        when(settingService.getDecimal(eq(SettingKey.MIN_ORDER_AMOUNT), any(BigDecimal.class)))
                .thenReturn(BigDecimal.ZERO);

        when(settingService.getDecimal(eq(SettingKey.DELIVERY_FEE_FIXED), any(BigDecimal.class)))
                .thenReturn(BigDecimal.ZERO);

        when(settingService.getDecimal(eq(SettingKey.DELIVERY_FREE_THRESHOLD), any(BigDecimal.class)))
                .thenReturn(BigDecimal.ZERO);
    }

    @Test
    void create_shouldThrowBadRequest_whenStockInsufficient() {
        User user = User.builder().id(1L).email("user@test.com").build();
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(user));

        Category category = Category.builder().id(1L).active(true).build();

        Product product = Product.builder()
                .id(1L)
                .name("Elma")
                .price(new BigDecimal("10.00"))
                .stock(1)
                .active(true)
                .category(category)
                .build();

        when(productRepository.findAllById(List.of(1L))).thenReturn(List.of(product));
        when(productRepository.findByIdWithCategory(1L)).thenReturn(Optional.of(product));

        // stok düşürme atomic metodu 0 dönerse yetersiz stok
        when(productRepository.decreaseStockIfAvailable(1L, 2)).thenReturn(0);

        OrderCreateRequest request = OrderCreateRequest.builder()
                .items(List.of(
                        OrderItemCreateRequest.builder()
                                .productId(1L)
                                .quantity(2)
                                .build()
                ))
                .deliveryAddress("Test adres")
                .paymentMethod(PaymentMethod.CASH)
                .build();

        BadRequestException ex = assertThrows(BadRequestException.class, () -> orderService.create(request));
        assertTrue(ex.getMessage().toLowerCase().contains("insufficient stock"));
    }

    @Test
    void create_shouldThrowBadRequest_whenOrderAcceptingDisabled() {
        when(settingService.getBoolean(eq(SettingKey.ORDER_ACCEPTING_ENABLED), anyBoolean()))
                .thenReturn(false);

        User user = User.builder().id(1L).email("user@test.com").build();
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(user));

        OrderCreateRequest request = OrderCreateRequest.builder()
                .items(List.of(
                        OrderItemCreateRequest.builder()
                                .productId(1L)
                                .quantity(1)
                                .build()
                ))
                .paymentMethod(PaymentMethod.CASH)
                .build();

        BadRequestException ex = assertThrows(BadRequestException.class, () -> orderService.create(request));
        assertTrue(ex.getMessage().contains("Şu anda sipariş almıyoruz"));
    }

    @Test
    void create_shouldThrowBadRequest_whenBelowMinOrderAmount() {
        when(settingService.getDecimal(eq(SettingKey.MIN_ORDER_AMOUNT), any(BigDecimal.class)))
                .thenReturn(new BigDecimal("100.00"));

        User user = User.builder().id(1L).email("user@test.com").build();
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(user));

        Category category = Category.builder().id(1L).active(true).build();

        Product product = Product.builder()
                .id(1L)
                .name("Elma")
                .price(new BigDecimal("10.00")) // subtotal 10 olacak
                .stock(10)
                .active(true)
                .category(category)
                .build();

        when(productRepository.findAllById(List.of(1L))).thenReturn(List.of(product));
        when(productRepository.findByIdWithCategory(1L)).thenReturn(Optional.of(product));

        // stok düşme başarılı
        when(productRepository.decreaseStockIfAvailable(1L, 1)).thenReturn(1);

        // stok sonrası okumada da product dönsün
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));

        OrderCreateRequest request = OrderCreateRequest.builder()
                .items(List.of(
                        OrderItemCreateRequest.builder()
                                .productId(1L)
                                .quantity(1)
                                .build()
                ))
                .paymentMethod(PaymentMethod.CASH)
                .build();

        BadRequestException ex = assertThrows(BadRequestException.class, () -> orderService.create(request));
        assertTrue(ex.getMessage().toLowerCase().contains("minimum sipariş"));
    }

    @Test
    void cancel_shouldCancelAndReturnResponse() {
        User user = User.builder().id(1L).email("user@test.com").build();
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(user));

        Product product = Product.builder()
                .id(1L)
                .name("Elma")
                .price(new BigDecimal("10.00"))
                .stock(3)
                .active(true)
                .build();

        Order order = Order.builder()
                .id(10L)
                .user(user)
                .status(OrderStatus.PENDING)
                .items(List.of(
                        OrderItem.builder()
                                .order(null)
                                .product(product)
                                .quantity(2)
                                .unitPrice(new BigDecimal("10.00"))
                                .lineTotal(new BigDecimal("20.00"))
                                .build()
                ))
                .totalAmount(new BigDecimal("20.00"))
                .build();

        when(orderRepository.findByIdAndUserWithItems(10L, user)).thenReturn(Optional.of(order));
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));

        OrderResponse response = orderService.cancelMyOrder(10L);

        assertEquals("CANCELLED", response.getStatus());
        verify(productRepository).increaseStock(1L, 2);
        verify(stockMovementService).log(any(), any(), anyInt(), anyInt(), anyInt(), anyString(), any(), any(), anyString());
    }

    @Test
    void adminCannotDeliverCancelledOrder() {
        Order order = Order.builder()
                .id(20L)
                .status(OrderStatus.CANCELLED)
                .items(List.of())
                .totalAmount(BigDecimal.ZERO)
                .build();

        when(orderRepository.findByIdWithItems(20L)).thenReturn(Optional.of(order));

        assertThrows(BadRequestException.class,
                () -> orderService.updateStatusAdmin(20L, OrderStatus.DELIVERED));
    }
}
