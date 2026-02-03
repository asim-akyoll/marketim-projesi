package com.marketim.backend.settings;

import jakarta.validation.constraints.Min;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminSettingsUpdateRequest {

    // Delivery
    private BigDecimal deliveryFeeFixed;
    private BigDecimal deliveryFreeThreshold;

    // Payment
    private Boolean payOnDeliveryEnabled;
    private List<String> payOnDeliveryMethods;
    private String ibanFullName;
    private String ibanNumber;

    // Order rules
    private BigDecimal minOrderAmount;
    private Boolean orderAcceptingEnabled;

    // Working hours
    private Boolean workingHoursEnabled;
    private String workingHoursStart;
    private String workingHoursEnd;

    // Info
    @Min(0)
    private Integer estimatedDeliveryMinutes;

    private List<String> deliveryZones;
    private String orderClosedMessage;

    private String returnCancelPolicyText;

    // Store info
    private String storeName;
    private String storeLogo;
    private String storePhone;
    private String storeEmail;
    private String storeAddress;

    // Invoice info
    private String invoiceTitle;
    private String invoiceTaxNumber;
    private String invoiceTaxOffice;

    // System
    private Boolean maintenanceModeEnabled;
    private String maintenanceMessage;

    // Content
    private String faqText;
    private String termsText;
    private String kvkkText;
    private String distanceSalesText;
}
