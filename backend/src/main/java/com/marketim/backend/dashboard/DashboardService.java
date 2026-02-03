package com.marketim.backend.dashboard;

import com.marketim.backend.dashboard.dto.DashboardSummaryResponse;
import com.marketim.backend.dashboard.dto.RecentOrderResponse;
import com.marketim.backend.dashboard.dto.RevenueResponse;
import com.marketim.backend.order.Order;
import com.marketim.backend.order.OrderRepository;
import com.marketim.backend.order.OrderStatus;
import com.marketim.backend.order.OrderStatusCount;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import com.marketim.backend.dashboard.dto.RevenueChartItemResponse;
import com.marketim.backend.dashboard.dto.RevenueChartResponse;
import com.marketim.backend.order.OrderRepository.RevenueByDayProjection;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.*;

import com.marketim.backend.dashboard.dto.StatusChartItemResponse;
import com.marketim.backend.dashboard.dto.StatusChartResponse;
import com.marketim.backend.exception.BadRequestException;
import com.marketim.backend.order.OrderStatusCountByRange;


@Service
@RequiredArgsConstructor
public class DashboardService {

    private final OrderRepository orderRepository;

    public DashboardSummaryResponse getSummary() {
        LocalDateTime now = LocalDateTime.now();

        // Bugün: 00:00 - 23:59:59.999...
        LocalDate today = LocalDate.now();
        LocalDateTime todayStart = today.atStartOfDay();
        LocalDateTime todayEnd = today.atTime(LocalTime.MAX);

        // Son 7 gün: now - 6 gün (00:00) -> now
        LocalDateTime last7DaysStart = now.minusDays(6).toLocalDate().atStartOfDay();

        // Bu ay: ayın 1'i (00:00) -> now
        LocalDateTime monthStart = now.withDayOfMonth(1).toLocalDate().atStartOfDay();

        long todayOrderCount = orderRepository.countByCreatedAtBetween(todayStart, todayEnd);

        BigDecimal todayRevenue = orderRepository.sumTotalAmountBetween(todayStart, todayEnd);
        BigDecimal last7DaysRevenue = orderRepository.sumTotalAmountBetween(last7DaysStart, now);
        BigDecimal thisMonthRevenue = orderRepository.sumTotalAmountBetween(monthStart, now);

        // Status sayaçları (genel toplam)
        long pending = 0;
        long delivered = 0;
        long cancelled = 0;

        List<OrderStatusCount> counters = orderRepository.countByStatusGroup();
        for (OrderStatusCount c : counters) {
            if (c.getStatus() == OrderStatus.PENDING) pending = c.getCnt();
            if (c.getStatus() == OrderStatus.DELIVERED) delivered = c.getCnt();
            if (c.getStatus() == OrderStatus.CANCELLED) cancelled = c.getCnt();
        }

        long totalOrders = pending + delivered + cancelled;

        // Son 5 sipariş
        List<RecentOrderResponse> recentOrders = orderRepository
                .findRecentOrders(PageRequest.of(0, 5))
                .stream()
                .map(this::toRecentOrderResponse)
                .toList();

        return DashboardSummaryResponse.builder()
                .todayOrderCount(todayOrderCount)
                .pending(pending)
                .delivered(delivered)
                .cancelled(cancelled)
                .totalOrders(totalOrders)
                .revenue(RevenueResponse.builder()
                        .today(todayRevenue)
                        .last7Days(last7DaysRevenue)
                        .thisMonth(thisMonthRevenue)
                        .build())
                .recentOrders(recentOrders)
                .build();
    }

    private RecentOrderResponse toRecentOrderResponse(Order o) {
        return RecentOrderResponse.builder()
                .id(o.getId())
                .userFullName(o.getUser() != null ? o.getUser().getFullName() : null)
                .totalAmount(o.getTotalAmount())
                .status(o.getStatus() != null ? o.getStatus().name() : null)
                .createdAt(o.getCreatedAt())
                .build();
    }

    public StatusChartResponse getStatusChart(String range) {
        LocalDateTime now = LocalDateTime.now();

        LocalDateTime start;
        LocalDateTime end = now;

        switch (range == null ? "" : range.toLowerCase()) {
            case "today" -> {
                LocalDate today = LocalDate.now();
                start = today.atStartOfDay();
                end = today.atTime(LocalTime.MAX);
            }
            case "week" -> start = now.minusDays(6).toLocalDate().atStartOfDay();
            case "month" -> start = now.withDayOfMonth(1).toLocalDate().atStartOfDay();
            default -> throw new BadRequestException("Invalid range. Allowed: today, week, month");
        }

        List<StatusChartItemResponse> items = orderRepository
                .countByStatusGroupBetween(start, end)
                .stream()
                .map(this::toStatusChartItem)
                .toList();

        return StatusChartResponse.builder()
                .range(range.toLowerCase())
                .items(items)
                .build();
    }

    private StatusChartItemResponse toStatusChartItem(OrderStatusCountByRange x) {
        return StatusChartItemResponse.builder()
                .status(x.getStatus().name())
                .count(x.getCnt())
                .build();
    }

    public RevenueChartResponse getRevenueChart(String rangeKey) {
        // şimdilik sadece week yapalım (UI “Son 7 Gün”)
        LocalDate today = LocalDate.now();

        LocalDate startDay = today.minusDays(6);          // son 7 gün
        LocalDateTime start = startDay.atStartOfDay();
        LocalDateTime end = today.plusDays(1).atStartOfDay();

        List<RevenueByDayProjection> rows = orderRepository.sumRevenueByDay(start, end);

        // Map’e çevir
        Map<LocalDate, BigDecimal> map = new HashMap<>();
        for (RevenueByDayProjection r : rows) {
            map.put(r.getDay(), r.getTotal() == null ? BigDecimal.ZERO : r.getTotal());
        }

        // Eksik günleri 0 ile doldur (grafik 7 bar görsün diye)
        List<RevenueChartItemResponse> items = new ArrayList<>();
        for (int i = 0; i < 7; i++) {
            LocalDate d = startDay.plusDays(i);
            items.add(RevenueChartItemResponse.builder()
                    .day(d)
                    .total(map.getOrDefault(d, BigDecimal.ZERO))
                    .build());
        }

        return RevenueChartResponse.builder()
                .range("week")
                .items(items)
                .build();
    }

}

