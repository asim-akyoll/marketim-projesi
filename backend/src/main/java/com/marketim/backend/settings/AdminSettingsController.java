package com.marketim.backend.settings;

import com.marketim.backend.exception.BadRequestException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/settings")
public class AdminSettingsController {

    private final SettingService settingService;

    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("HH:mm");

    @GetMapping
    public AdminSettingsResponse getSettings() {
        BigDecimal fixedFee = settingService.getDecimal(SettingKey.DELIVERY_FEE_FIXED, BigDecimal.ZERO);
        BigDecimal freeThreshold = settingService.getDecimal(SettingKey.DELIVERY_FREE_THRESHOLD, BigDecimal.ZERO);

        boolean payEnabled = settingService.getBoolean(SettingKey.PAYMENT_ON_DELIVERY_ENABLED, true);

        String methodsStr = settingService.getString(SettingKey.PAYMENT_ON_DELIVERY_METHODS, "CASH,CARD");
        List<String> methods = Arrays.stream(methodsStr.split(","))
                .map(String::trim)
                .filter(s -> !s.isBlank())
                .toList();
        
        String ibanFullName = settingService.getString(SettingKey.IBAN_FULL_NAME, "");
        String ibanNumber = settingService.getString(SettingKey.IBAN_NUMBER, "");

        BigDecimal minOrderAmount = settingService.getDecimal(SettingKey.MIN_ORDER_AMOUNT, BigDecimal.ZERO);
        boolean orderAcceptingEnabled = settingService.getBoolean(SettingKey.ORDER_ACCEPTING_ENABLED, true);

        boolean workingHoursEnabled = settingService.getBoolean(SettingKey.WORKING_HOURS_ENABLED, false);
        String workingHoursStart = settingService.getString(SettingKey.WORKING_HOURS_START, "09:00");
        String workingHoursEnd = settingService.getString(SettingKey.WORKING_HOURS_END, "22:00");

        int estimatedDeliveryMinutes = Integer.parseInt(
                settingService.getString(SettingKey.ESTIMATED_DELIVERY_MINUTES, "45")
        );

        String zonesStr = settingService.getString(SettingKey.DELIVERY_ZONES, "");
        List<String> zones = Arrays.stream(zonesStr.split(","))
                .map(String::trim)
                .filter(s -> !s.isBlank())
                .toList();

        String orderClosedMessage = settingService.getString(
                SettingKey.ORDER_CLOSED_MESSAGE,
                "Şu anda hizmet veremiyoruz."
        );

        String returnCancelPolicyText = settingService.getString(
                SettingKey.RETURN_CANCEL_POLICY_TEXT,
                ""
        );

        String storeName = settingService.getString(SettingKey.STORE_NAME, "");
        String storeLogo = settingService.getString(SettingKey.STORE_LOGO, "");
        String storePhone = settingService.getString(SettingKey.STORE_PHONE, "");
        String storeEmail = settingService.getString(SettingKey.STORE_EMAIL, "");
        String storeAddress = settingService.getString(SettingKey.STORE_ADDRESS, "");

        String invoiceTitle = settingService.getString(SettingKey.INVOICE_TITLE, "");
        String invoiceTaxNumber = settingService.getString(SettingKey.INVOICE_TAX_NUMBER, "");
        String invoiceTaxOffice = settingService.getString(SettingKey.INVOICE_TAX_OFFICE, "");

        boolean maintenanceModeEnabled =
                settingService.getBoolean(SettingKey.MAINTENANCE_MODE_ENABLED, false);

        String maintenanceMessage =
                settingService.getString(SettingKey.MAINTENANCE_MESSAGE, "Şu an hizmet veremiyoruz.");

        // Content
        String faqText = settingService.getString(SettingKey.FAQ_TEXT, "");
        String termsText = settingService.getString(SettingKey.TERMS_TEXT, "");
        String kvkkText = settingService.getString(SettingKey.KVKK_TEXT, "");
        String distanceSalesText = settingService.getString(SettingKey.DISTANCE_SALES_TEXT, "");

        return AdminSettingsResponse.builder()
                .deliveryFeeFixed(fixedFee)
                .deliveryFreeThreshold(freeThreshold)
                .payOnDeliveryEnabled(payEnabled)
                .payOnDeliveryMethods(methods)
                .ibanFullName(ibanFullName)
                .ibanNumber(ibanNumber)
                .minOrderAmount(minOrderAmount)
                .orderAcceptingEnabled(orderAcceptingEnabled)
                .workingHoursEnabled(workingHoursEnabled)
                .workingHoursStart(workingHoursStart)
                .workingHoursEnd(workingHoursEnd)
                .estimatedDeliveryMinutes(estimatedDeliveryMinutes)
                .deliveryZones(zones)
                .orderClosedMessage(orderClosedMessage)
                .returnCancelPolicyText(returnCancelPolicyText)
                .storeName(storeName)
                .storeLogo(storeLogo)
                .storePhone(storePhone)
                .storeEmail(storeEmail)
                .storeAddress(storeAddress)
                .invoiceTitle(invoiceTitle)
                .invoiceTaxNumber(invoiceTaxNumber)
                .invoiceTaxOffice(invoiceTaxOffice)
                .maintenanceModeEnabled(maintenanceModeEnabled)
                .maintenanceMessage(maintenanceMessage)
                // Content
                .faqText(faqText)
                .termsText(termsText)
                .kvkkText(kvkkText)
                .distanceSalesText(distanceSalesText)
                .build();
    }

    @PatchMapping
    public AdminSettingsResponse updateSettings(@Valid @RequestBody AdminSettingsUpdateRequest request) {

        if (Boolean.TRUE.equals(request.getPayOnDeliveryEnabled())
                && (request.getPayOnDeliveryMethods() == null || request.getPayOnDeliveryMethods().isEmpty())) {
            throw new BadRequestException("Kapıda ödeme aktifse en az bir ödeme yöntemi seçmelisin.");
        }

        // Working hours validation
        if (Boolean.TRUE.equals(request.getWorkingHoursEnabled())) {
            if (request.getWorkingHoursStart() == null || request.getWorkingHoursStart().isBlank()
                    || request.getWorkingHoursEnd() == null || request.getWorkingHoursEnd().isBlank()) {
                throw new BadRequestException("Çalışma saatleri aktifse başlangıç ve bitiş saati zorunludur.");
            }
            try {
                LocalTime.parse(request.getWorkingHoursStart(), TIME_FMT);
                LocalTime.parse(request.getWorkingHoursEnd(), TIME_FMT);
            } catch (Exception e) {
                throw new BadRequestException("Çalışma saatleri formatı HH:mm olmalıdır. Örn: 09:00");
            }
        }

        // Maintenance validation
        if (Boolean.TRUE.equals(request.getMaintenanceModeEnabled())) {
            if (request.getMaintenanceMessage() == null || request.getMaintenanceMessage().isBlank()) {
                throw new BadRequestException("Bakım modu aktifse bakım mesajı zorunludur.");
            }
        }

        // Delivery
        settingService.setDecimal(SettingKey.DELIVERY_FEE_FIXED, request.getDeliveryFeeFixed());
        settingService.setDecimal(SettingKey.DELIVERY_FREE_THRESHOLD, request.getDeliveryFreeThreshold());

        // Pay on delivery
        settingService.setBoolean(SettingKey.PAYMENT_ON_DELIVERY_ENABLED, request.getPayOnDeliveryEnabled());
        settingService.setString(
                SettingKey.PAYMENT_ON_DELIVERY_METHODS,
                String.join(",", request.getPayOnDeliveryMethods() == null ? List.of() : request.getPayOnDeliveryMethods())
        );
        settingService.setString(SettingKey.IBAN_FULL_NAME, request.getIbanFullName() == null ? "" : request.getIbanFullName().trim());
        settingService.setString(SettingKey.IBAN_NUMBER, request.getIbanNumber() == null ? "" : request.getIbanNumber().trim());

        // Order rules
        settingService.setDecimal(SettingKey.MIN_ORDER_AMOUNT, request.getMinOrderAmount());
        settingService.setBoolean(SettingKey.ORDER_ACCEPTING_ENABLED, request.getOrderAcceptingEnabled());

        // Working hours + ETA + Zones + Message
        settingService.setBoolean(SettingKey.WORKING_HOURS_ENABLED, request.getWorkingHoursEnabled());
        settingService.setString(SettingKey.WORKING_HOURS_START, request.getWorkingHoursStart() == null ? "" : request.getWorkingHoursStart().trim());
        settingService.setString(SettingKey.WORKING_HOURS_END, request.getWorkingHoursEnd() == null ? "" : request.getWorkingHoursEnd().trim());

        settingService.setString(
                SettingKey.ESTIMATED_DELIVERY_MINUTES,
                String.valueOf(request.getEstimatedDeliveryMinutes() == null ? 0 : request.getEstimatedDeliveryMinutes())
        );

        settingService.setString(
                SettingKey.DELIVERY_ZONES,
                String.join(",", request.getDeliveryZones() == null ? List.of() : request.getDeliveryZones())
        );

        settingService.setString(
                SettingKey.ORDER_CLOSED_MESSAGE,
                request.getOrderClosedMessage() == null ? "" : request.getOrderClosedMessage().trim()
        );

        settingService.setString(
                SettingKey.RETURN_CANCEL_POLICY_TEXT,
                request.getReturnCancelPolicyText() == null ? "" : request.getReturnCancelPolicyText().trim()
        );

        // Store info
        settingService.setString(SettingKey.STORE_NAME, request.getStoreName());
        settingService.setString(SettingKey.STORE_LOGO, request.getStoreLogo());
        settingService.setString(SettingKey.STORE_PHONE, request.getStorePhone());
        settingService.setString(SettingKey.STORE_EMAIL, request.getStoreEmail());
        settingService.setString(SettingKey.STORE_ADDRESS, request.getStoreAddress());

        // Invoice info
        settingService.setString(SettingKey.INVOICE_TITLE, request.getInvoiceTitle());
        settingService.setString(SettingKey.INVOICE_TAX_NUMBER, request.getInvoiceTaxNumber());
        settingService.setString(SettingKey.INVOICE_TAX_OFFICE, request.getInvoiceTaxOffice());

        // System (maintenance)
        settingService.setBoolean(
                SettingKey.MAINTENANCE_MODE_ENABLED,
                Boolean.TRUE.equals(request.getMaintenanceModeEnabled())
        );
        settingService.setString(
                SettingKey.MAINTENANCE_MESSAGE,
                request.getMaintenanceMessage() == null ? "" : request.getMaintenanceMessage().trim()
        );

        // Content
        settingService.setString(SettingKey.FAQ_TEXT, request.getFaqText() == null ? "" : request.getFaqText());
        settingService.setString(SettingKey.TERMS_TEXT, request.getTermsText() == null ? "" : request.getTermsText());
        settingService.setString(SettingKey.KVKK_TEXT, request.getKvkkText() == null ? "" : request.getKvkkText());
        settingService.setString(SettingKey.DISTANCE_SALES_TEXT, request.getDistanceSalesText() == null ? "" : request.getDistanceSalesText());

        return getSettings();
    }
}
