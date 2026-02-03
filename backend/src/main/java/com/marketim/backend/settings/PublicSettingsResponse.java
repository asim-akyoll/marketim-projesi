package com.marketim.backend.settings;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Builder
public class PublicSettingsResponse {
    private BigDecimal deliveryFeeFixed;
    private BigDecimal deliveryFreeThreshold;
    private boolean payOnDeliveryEnabled;
    private List<String> payOnDeliveryMethods;
    private String ibanFullName;
    private String ibanNumber;

    // System
    private boolean maintenanceModeEnabled;
    private String maintenanceMessage;

    // Info
    private String estimatedDeliveryMinutes;

    // Content
    private String faqText;
    private String termsText;
    private String kvkkText;
    private String distanceSalesText;

    // Store
    private String storeName;
    private String phone;
    private String email;
    private String address;

    // Working hours
    private boolean workingHoursEnabled;
    private String openingTime;
    private String closingTime;

    // Order rules
    // Order rules
    private BigDecimal minOrderAmount;
    private boolean orderAcceptingEnabled;

}
