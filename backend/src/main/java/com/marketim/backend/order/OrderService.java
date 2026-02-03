package com.marketim.backend.order;

import com.marketim.backend.category.Category;
import com.marketim.backend.exception.BadRequestException;
import com.marketim.backend.exception.NotFoundException;
import com.marketim.backend.product.Product;
import com.marketim.backend.product.ProductRepository;
import com.marketim.backend.settings.SettingKey;
import com.marketim.backend.settings.SettingService;
import com.marketim.backend.stock.StockMovementService;
import com.marketim.backend.stock.StockMovementType;
import com.marketim.backend.user.User;
import com.marketim.backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

import java.time.LocalTime;


@Service
@RequiredArgsConstructor
@Transactional
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final StockMovementService stockMovementService;
    private final SettingService settingService;
    private final OrderItemRepository orderItemRepository;


    // -------------------------
    // CUSTOMER
    // -------------------------

    public OrderResponse create(OrderCreateRequest request) {
        User currentUser = getCurrentUserOrNull();

        // ✅ Guest Validation
        if (currentUser == null) {
             if (request.getGuestName() == null || request.getGuestName().isBlank()) {
                 throw new BadRequestException("Misafir siparişi için Ad Soyad zorunludur.");
             }
             if (request.getGuestEmail() == null || request.getGuestEmail().isBlank()) {
                 throw new BadRequestException("Misafir siparişi için E-posta zorunludur.");
             }
             if (request.getContactPhone() == null || request.getContactPhone().isBlank()) {
                 throw new BadRequestException("Misafir siparişi için İletişim Numarası zorunludur.");
             }
        }

        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new BadRequestException("Order items cannot be empty");
        }

        // ✅ Yeni Kural 1: Sipariş alımı açık mı?
        boolean orderAcceptingEnabled = settingService.getBoolean(
                SettingKey.ORDER_ACCEPTING_ENABLED, true
        );
        // ✅ Çalışma saatleri kuralı
        boolean whEnabled = settingService.getBoolean(SettingKey.WORKING_HOURS_ENABLED, false);
        if (whEnabled) {
            String startStr = settingService.getString(SettingKey.WORKING_HOURS_START, "09:00");
            String endStr = settingService.getString(SettingKey.WORKING_HOURS_END, "22:00");

            LocalTime start = LocalTime.parse(startStr);
            LocalTime end = LocalTime.parse(endStr);
            LocalTime now = LocalTime.now();

            boolean inRange;
            if (start.equals(end)) {
                inRange = true;
            } else if (start.isBefore(end)) {
                inRange = !now.isBefore(start) && !now.isAfter(end);
            } else {
                inRange = !now.isBefore(start) || !now.isAfter(end);
            }

            if (!inRange) {
                String msg = settingService.getString(
                        SettingKey.ORDER_CLOSED_MESSAGE,
                        "Şu anda hizmet veremiyoruz."
                );
                throw new BadRequestException(msg);
            }
        }

        if (!orderAcceptingEnabled) {
            throw new BadRequestException("Şu anda sipariş almıyoruz.");
        }

        // ✅ paymentMethod zorunlu (seçilmezse 400)
        if (request.getPaymentMethod() == null) {
            throw new BadRequestException("Ödeme yöntemi seçilmelidir.");
        }
        PaymentMethod paymentMethod = request.getPaymentMethod();

        // ✅ Settings: kapıda ödeme açık mı?
        boolean payOnDeliveryEnabled = settingService.getBoolean(
                SettingKey.PAYMENT_ON_DELIVERY_ENABLED, true
        );
        if (!payOnDeliveryEnabled) {
            throw new BadRequestException("Kapıda ödeme şu anda kapalı.");
        }

        // ✅ Settings: izinli yöntemler
        String allowedMethodsStr = settingService.getString(
                SettingKey.PAYMENT_ON_DELIVERY_METHODS, "CASH,CARD"
        );
        List<String> allowedMethods = Arrays.stream(allowedMethodsStr.split(","))
                .map(String::trim)
                .filter(s -> !s.isBlank())
                .toList();

        if (!allowedMethods.contains(paymentMethod.name())) {
            throw new BadRequestException("Seçilen ödeme yöntemi geçerli değil.");
        }

        // aynı ürün birden fazla kez geldiyse birleştir
        Map<Long, Integer> merged = new HashMap<>();
        for (OrderItemCreateRequest item : request.getItems()) {
            if (item.getProductId() == null) throw new BadRequestException("productId cannot be null");
            if (item.getQuantity() == null || item.getQuantity() < 1) throw new BadRequestException("quantity must be >= 1");
            merged.merge(item.getProductId(), item.getQuantity(), Integer::sum);
        }

        List<Long> productIds = new ArrayList<>(merged.keySet());

        // ürünleri çek
        List<Product> products = productRepository.findAllById(productIds);
        if (products.size() != productIds.size()) {
            Set<Long> found = products.stream().map(Product::getId).collect(Collectors.toSet());
            Long missing = productIds.stream().filter(id -> !found.contains(id)).findFirst().orElse(null);
            throw new NotFoundException("Product not found: " + missing);
        }

        Order order = Order.builder()
                .user(currentUser) // null olabilir
                .guestName(currentUser == null ? request.getGuestName() : null)
                .guestEmail(currentUser == null ? request.getGuestEmail() : null)
                .status(OrderStatus.PENDING)
                .deliveryAddress(request.getDeliveryAddress())
                .paymentMethod(paymentMethod)
                .totalAmount(BigDecimal.ZERO)
                .items(new ArrayList<>())
                .items(new ArrayList<>())
                .note(request.getNote())
                .contactPhone(request.getContactPhone())
                .build();

        BigDecimal total = BigDecimal.ZERO;

        // atomic stok düşme + satır oluşturma
        for (Product p : products) {
            Long productId = p.getId();
            int qty = merged.get(productId);

            Product product = productRepository.findByIdWithCategory(productId)
                    .orElseThrow(() -> new NotFoundException("Product not found: " + productId));

            if (!product.isActive()) {
                throw new BadRequestException("Product is inactive: " + product.getId());
            }

            Category category = product.getCategory();
            if (category != null && !category.isActive()) {
                throw new BadRequestException("Product category is inactive. categoryId: " + category.getId());
            }

            int affected = productRepository.decreaseStockIfAvailable(product.getId(), qty);
            if (affected == 0) {
                throw new BadRequestException("Insufficient stock for productId: " + product.getId());
            }

            int afterStock = productRepository.findById(product.getId())
                    .orElseThrow(() -> new NotFoundException("Product not found: " + product.getId()))
                    .getStock();
            int beforeStock = afterStock + qty;

            stockMovementService.log(
                    product,
                    StockMovementType.ORDER_CREATE,
                    -qty,
                    beforeStock,
                    afterStock,
                    "ORDER",
                    null,
                    null,
                    currentUser != null ? currentUser.getEmail() : request.getGuestEmail()
            );

            BigDecimal unitPrice = product.getPrice();
            BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(qty));

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .quantity(qty)
                    .unitPrice(unitPrice)
                    .lineTotal(lineTotal)
                    .build();

            order.getItems().add(orderItem);
            total = total.add(lineTotal);
        }

        // ✅ teslimat hesap (subtotal + deliveryFee + total)
        BigDecimal subtotal = total;

        // ✅ Yeni Kural 2: Minimum sipariş tutarı (subtotal üzerinden)
        BigDecimal minOrderAmount = settingService.getDecimal(
                SettingKey.MIN_ORDER_AMOUNT, BigDecimal.ZERO
        );
        if (minOrderAmount != null
                && minOrderAmount.compareTo(BigDecimal.ZERO) > 0
                && subtotal.compareTo(minOrderAmount) < 0) {
            throw new BadRequestException("Minimum sipariş tutarı " + minOrderAmount.toPlainString() + " ₺");
        }

        BigDecimal fixedFee = settingService.getDecimal(SettingKey.DELIVERY_FEE_FIXED, BigDecimal.ZERO);
        BigDecimal freeThreshold = settingService.getDecimal(SettingKey.DELIVERY_FREE_THRESHOLD, BigDecimal.ZERO);

        BigDecimal deliveryFee = subtotal.compareTo(freeThreshold) >= 0 ? BigDecimal.ZERO : fixedFee;

        order.setSubtotalAmount(subtotal);
        order.setDeliveryFee(deliveryFee);
        order.setTotalAmount(subtotal.add(deliveryFee));

        Order saved = orderRepository.save(order);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getMyOrders() {
        User user = getCurrentUser();
        return orderRepository.findByUserWithItems(user)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public OrderResponse cancelMyOrder(Long orderId) {
        User currentUser = getCurrentUser();

        Order order = orderRepository.findByIdAndUserWithItems(orderId, currentUser)
                .orElseThrow(() -> new NotFoundException("Order not found: " + orderId));

        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new BadRequestException("Order is already cancelled");
        }
        if (order.getStatus() == OrderStatus.DELIVERED) {
            throw new BadRequestException("Delivered order cannot be cancelled");
        }

        for (OrderItem item : order.getItems()) {
            Long productId = item.getProduct().getId();
            int qty = item.getQuantity();

            Product p = productRepository.findById(productId)
                    .orElseThrow(() -> new NotFoundException("Product not found: " + productId));
            int beforeStock = p.getStock();

            productRepository.increaseStock(productId, qty);

            int afterStock = beforeStock + qty;

            stockMovementService.log(
                    p,
                    StockMovementType.ORDER_CANCEL,
                    +qty,
                    beforeStock,
                    afterStock,
                    "ORDER",
                    order.getId(),
                    null,
                    currentUser.getEmail()
            );
        }

        order.setStatus(OrderStatus.CANCELLED);
        Order saved = orderRepository.save(order);

        return toResponse(saved);
    }

    // -------------------------
    // ADMIN
    // -------------------------

    @Transactional(readOnly = true)
    public Page<OrderAdminListResponse> adminSearch(Long id, OrderStatus status, String q, Pageable pageable) {
        Specification<Order> spec = (root, query, cb) -> cb.conjunction();

        if (id != null) spec = spec.and(OrderSpecifications.hasId(id));
        if (status != null) spec = spec.and(OrderSpecifications.hasStatus(status));
        if (q != null && !q.isBlank()) spec = spec.and(OrderSpecifications.containsText(q));

        return orderRepository.findAll(spec, pageable)
                .map(o -> OrderAdminListResponse.builder()
                        .id(o.getId())
                        .status(o.getStatus())
                        .totalAmount(o.getTotalAmount())
                        .createdAt(o.getCreatedAt())
                        .customerName(o.getUser() != null ? o.getUser().getFullName() : o.getGuestName())
                        .address(o.getDeliveryAddress())
                        .note(o.getNote())
                        .contactPhone(o.getContactPhone())
                        .build());
    }

    @Transactional(readOnly = true)
    public AdminOrderStatsResponse adminStats() {
        long pending = 0, delivered = 0, cancelled = 0;

        for (OrderStatusCount row : orderRepository.countByStatusGroup()) {
            if (row.getStatus() == OrderStatus.PENDING) pending = row.getCnt();
            if (row.getStatus() == OrderStatus.DELIVERED) delivered = row.getCnt();
            if (row.getStatus() == OrderStatus.CANCELLED) cancelled = row.getCnt();
        }

        return AdminOrderStatsResponse.builder()
                .pending(pending)
                .delivered(delivered)
                .cancelled(cancelled)
                .total(pending + delivered + cancelled)
                .build();
    }



    @Transactional(readOnly = true)
    public OrderResponse getByIdAdmin(Long orderId) {
        Order order = orderRepository.findByIdWithItems(orderId)
                .orElseThrow(() -> new NotFoundException("Order not found: " + orderId));

        return toResponse(order);
    }

    @Transactional(readOnly = true)
    public Page<OrderAdminListResponse> adminOrdersByCustomerId(Long userId, Pageable pageable) {

        var page = orderRepository.findPageByUserIdWithUser(userId, pageable);

        var orderIds = page.getContent().stream()
                .map(Order::getId)
                .toList();

        var counts = orderItemRepository.countItemsByOrderIds(orderIds).stream()
                .collect(java.util.stream.Collectors.toMap(
                        OrderItemRepository.OrderItemCountProjection::getOrderId,
                        OrderItemRepository.OrderItemCountProjection::getCnt
                ));

        return page.map(o -> toAdminListResponse(o, counts.getOrDefault(o.getId(), 0L)));
    }


    private OrderAdminListResponse toAdminListResponse(Order o, Long itemsCount) {
        return OrderAdminListResponse.builder()
                .id(o.getId())
                .status(o.getStatus())
                .totalAmount(o.getTotalAmount())
                .createdAt(o.getCreatedAt())
                .customerName(o.getUser() != null ? o.getUser().getFullName() : o.getGuestName())
                .address(o.getDeliveryAddress())
                .itemsCount(itemsCount)
                .itemsCount(itemsCount)
                .note(o.getNote())
                .contactPhone(o.getContactPhone())
                .guestName(o.getGuestName())
                .guestEmail(o.getGuestEmail())
                .build();
    }

    public OrderResponse updateStatusAdmin(Long orderId, OrderStatus targetStatus) {
        if (targetStatus == null) throw new BadRequestException("status cannot be null");

        Order order = orderRepository.findByIdWithItems(orderId)
                .orElseThrow(() -> new NotFoundException("Order not found: " + orderId));

        OrderStatus current = order.getStatus();

        if (!current.canTransitionTo(targetStatus)) {
            throw new BadRequestException("Invalid status transition: " + current + " -> " + targetStatus);
        }

        if (current == targetStatus) return toResponse(order);

        if (targetStatus == OrderStatus.CANCELLED) {
            for (OrderItem item : order.getItems()) {
                Long productId = item.getProduct().getId();
                int qty = item.getQuantity();

                Product p = productRepository.findById(productId)
                        .orElseThrow(() -> new NotFoundException("Product not found: " + productId));
                int beforeStock = p.getStock();

                productRepository.increaseStock(productId, qty);

                int afterStock = beforeStock + qty;

                stockMovementService.log(
                        p,
                        StockMovementType.ORDER_CANCEL,
                        +qty,
                        beforeStock,
                        afterStock,
                        "ORDER",
                        order.getId(),
                        "Admin cancelled order",
                        "ADMIN"
                );
            }
        }

        order.setStatus(targetStatus);
        Order saved = orderRepository.save(order);
        return toResponse(saved);
    }

    // -------------------------
    // Helpers
    // -------------------------

    private User getCurrentUserOrNull() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return null;
        }

        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new NotFoundException("User not found: " + auth.getName()));
    }

    private User getCurrentUser() {
        User u = getCurrentUserOrNull();
        if (u == null) throw new BadRequestException("Unauthenticated");
        return u;
    }

    private OrderResponse toResponse(Order order) {
        List<OrderItemResponse> items = order.getItems().stream()
                .map(oi -> OrderItemResponse.builder()
                        .productId(oi.getProduct().getId())
                        .productName(oi.getProduct().getName())
                        .unitLabel(oi.getProduct().getUnitLabel())
                        .quantity(oi.getQuantity())
                        .unitPrice(oi.getUnitPrice())
                        .lineTotal(oi.getLineTotal())
                        .build())
                .toList();

        return OrderResponse.builder()
                .id(order.getId())
                .status(order.getStatus().name())
                .paymentMethod(order.getPaymentMethod() != null ? order.getPaymentMethod().name() : null)
                .subtotalAmount(order.getSubtotalAmount())
                .deliveryFee(order.getDeliveryFee())
                .totalAmount(order.getTotalAmount())
                .deliveryAddress(order.getDeliveryAddress())
                .items(items)
                .createdAt(order.getCreatedAt())
                .createdAt(order.getCreatedAt())
                .note(order.getNote())
                .contactPhone(order.getContactPhone())
                .guestName(order.getGuestName())
                .guestEmail(order.getGuestEmail())
                .customerName(order.getUser() != null ? order.getUser().getFullName() : order.getGuestName())
                .build();
    }
}
