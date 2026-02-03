package com.marketim.backend.report.service;

import com.marketim.backend.exception.BadRequestException;
import com.marketim.backend.order.Order;
import com.marketim.backend.order.OrderRepository;
import com.marketim.backend.order.OrderStatus;
import com.marketim.backend.product.Product;
import com.marketim.backend.product.ProductRepository;
import com.marketim.backend.report.ReportType;
import com.marketim.backend.report.dto.OrderReportRowDto;
import com.marketim.backend.report.dto.StockReportRowDto;
import com.marketim.backend.report.dto.SummaryReportDto;
import com.marketim.backend.settings.SettingKey;
import com.marketim.backend.settings.SettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final SettingService settingService;
    private final ReportPdfGenerator pdfGenerator;

    public byte[] generatePdf(ReportType type, LocalDate startDate, LocalDate endDate) {
        validateRange(startDate, endDate);

        String storeName = settingService.getString(SettingKey.STORE_NAME, "Marketim");
        LocalDateTime generatedAt = LocalDateTime.now();

        return switch (type) {
            case ORDER -> {
                List<OrderReportRowDto> rows = fetchOrderRows(startDate, endDate);
                yield pdfGenerator.generateOrderReport(
                        storeName, startDate, endDate, generatedAt, rows
                );
            }
            case STOCK -> {
                List<StockReportRowDto> rows = fetchStockRows();
                yield pdfGenerator.generateStockReport(
                        storeName, startDate, endDate, generatedAt, rows
                );
            }
            case DAILY, MONTHLY -> {
                SummaryReportDto summary = buildSummary(startDate, endDate);
                yield pdfGenerator.generateSummaryReport(
                        type, storeName, startDate, endDate, generatedAt, summary
                );
            }
        };
    }

    public String buildFilename(ReportType type, LocalDate startDate, LocalDate endDate) {
        String s = startDate.format(DateTimeFormatter.ISO_DATE);
        String e = endDate.format(DateTimeFormatter.ISO_DATE);
        return "report-" + type.name().toLowerCase() + "-" + s + "_to_" + e + ".pdf";
    }

    private void validateRange(LocalDate startDate, LocalDate endDate) {
        if (startDate == null || endDate == null) {
            throw new BadRequestException("startDate ve endDate zorunludur.");
        }
        if (endDate.isBefore(startDate)) {
            throw new BadRequestException("endDate startDate'ten once olamaz.");
        }
        if (startDate.plusYears(2).isBefore(endDate)) {
            throw new BadRequestException("Tarih araligi cok genis. Daha dar aralik secin.");
        }
    }

    // ---------- ORDER ----------
    private List<OrderReportRowDto> fetchOrderRows(LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(LocalTime.MAX);

        // Senin OrderRepository'de eklediğin query:
        // List<Order> findOrdersForReport(LocalDateTime start, LocalDateTime end)
        List<Order> orders = orderRepository.findOrdersForReport(start, end);

        return orders.stream().map(o -> OrderReportRowDto.builder()
                .orderId(o.getId())
                .createdAt(o.getCreatedAt())
                .customerName(buildCustomerName(o))
                .totalAmount(nvl(o.getTotalAmount()))
                .status(o.getStatus())
                .build()
        ).toList();
    }

    private String buildCustomerName(Order o) {
        String fn = safe(o.getUser().getFirstName());
        String ln = safe(o.getUser().getLastName());
        String full = (fn + " " + ln).trim();
        return full.isBlank() ? safe(o.getUser().getEmail()) : full;
    }

    // ---------- STOCK ----------
    private List<StockReportRowDto> fetchStockRows() {
        // Senin ProductRepository'de eklediğin query:
        // List<Product> findAllActiveForStockReport()
        List<Product> products = productRepository.findAllActiveForStockReport();

        return products.stream()
                .map(p -> StockReportRowDto.builder()
                        .productName(p.getName())
                        .stock(readStock(p))
                        .critical(isCritical(p))
                        .build())
                .toList();
    }

    // ⚠️ Bu 2 methodu Product alanlarına göre düzeltmen gerekebilir:
    private Integer readStock(Product p) {
        // örnek: p.getStock()
        return p.getStock();
    }

    private boolean isCritical(Product p) {
        Integer stock = p.getStock();
        int s = (stock == null) ? 0 : stock;

        // Şimdilik sabit kritik seviye: 10
        // (istersen bunu sonra Settings'e taşırız veya Product'a alan ekleriz)
        int criticalThreshold = 10;

        return s <= criticalThreshold;
    }


    // ---------- DAILY/MONTHLY ----------
    private SummaryReportDto buildSummary(LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(LocalTime.MAX);

        // Senin OrderRepository'de eklediğin query'ler:
        long total = orderRepository.countByCreatedAtBetween(start, end);
        long delivered = orderRepository.countByCreatedAtBetweenAndStatus(start, end, OrderStatus.DELIVERED);
        long cancelled = orderRepository.countByCreatedAtBetweenAndStatus(start, end, OrderStatus.CANCELLED);
        BigDecimal revenue = orderRepository.sumTotalAmountByCreatedAtBetween(start, end);

        BigDecimal avg = BigDecimal.ZERO;
        if (total > 0) {
            avg = revenue.divide(BigDecimal.valueOf(total), 2, RoundingMode.HALF_UP);
        }

        return SummaryReportDto.builder()
                .totalOrders(total)
                .deliveredCount(delivered)
                .cancelledCount(cancelled)
                .revenue(revenue)
                .avgOrderAmount(avg)
                .build();
    }

    private String safe(String s) {
        return s == null ? "" : s;
    }

    private BigDecimal nvl(BigDecimal b) {
        return b == null ? BigDecimal.ZERO : b;
    }
}
