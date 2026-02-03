package com.marketim.backend.settings;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/settings")
public class PublicSettingsController {

    private final SettingService settingService;

    @GetMapping
    public PublicSettingsResponse getPublicSettings() {

        BigDecimal deliveryFeeFixed =
                settingService.getDecimal(SettingKey.DELIVERY_FEE_FIXED, BigDecimal.ZERO);

        BigDecimal deliveryFreeThreshold =
                settingService.getDecimal(SettingKey.DELIVERY_FREE_THRESHOLD, BigDecimal.ZERO);

        boolean payOnDeliveryEnabled =
                settingService.getBoolean(SettingKey.PAYMENT_ON_DELIVERY_ENABLED, false);

        String methodsStr =
                settingService.getString(SettingKey.PAYMENT_ON_DELIVERY_METHODS, "CASH,CARD");

        List<String> methods = Arrays.stream(methodsStr.split(","))
                .map(String::trim)
                .filter(s -> !s.isBlank())
                .toList();

        String ibanFullName = settingService.getString(SettingKey.IBAN_FULL_NAME, "");
        String ibanNumber = settingService.getString(SettingKey.IBAN_NUMBER, "");

        boolean maintenanceModeEnabled =
                settingService.getBoolean(SettingKey.MAINTENANCE_MODE_ENABLED, false);

        String maintenanceMessage =
                settingService.getString(SettingKey.MAINTENANCE_MESSAGE, "Şu an hizmet veremiyoruz.");

        String estimatedDeliveryMinutes =
                settingService.getString(SettingKey.ESTIMATED_DELIVERY_MINUTES, "30-45");

        // Content
        String faqText = settingService.getString(SettingKey.FAQ_TEXT, "");
        String termsText = settingService.getString(SettingKey.TERMS_TEXT, "");
        String kvkkText = settingService.getString(SettingKey.KVKK_TEXT, "");
        String distanceSalesText = settingService.getString(SettingKey.DISTANCE_SALES_TEXT, "");

        // Store info
        String storeName =
                settingService.getString(SettingKey.STORE_NAME, "Marketim");

        String phone =
                settingService.getString(SettingKey.STORE_PHONE, "");

        String email =
                settingService.getString(SettingKey.STORE_EMAIL, "");

        String address =
                settingService.getString(SettingKey.STORE_ADDRESS, "");

// Working hours
        boolean workingHoursEnabled =
                settingService.getBoolean(SettingKey.WORKING_HOURS_ENABLED, false);

        String openingTime =
                settingService.getString(SettingKey.WORKING_HOURS_START, "09:00");

        String closingTime =
                settingService.getString(SettingKey.WORKING_HOURS_END, "22:00");

        BigDecimal minOrderAmount =
                settingService.getDecimal(SettingKey.MIN_ORDER_AMOUNT, BigDecimal.ZERO);

        boolean orderAcceptingEnabled =
                settingService.getBoolean(SettingKey.ORDER_ACCEPTING_ENABLED, true);


        return PublicSettingsResponse.builder()
                .deliveryFeeFixed(deliveryFeeFixed)
                .deliveryFreeThreshold(deliveryFreeThreshold)
                .payOnDeliveryEnabled(payOnDeliveryEnabled)
                .payOnDeliveryMethods(methods)
                .ibanFullName(ibanFullName)
                .ibanNumber(ibanNumber)
                .maintenanceModeEnabled(maintenanceModeEnabled)
                .maintenanceMessage(maintenanceMessage)
                .estimatedDeliveryMinutes(estimatedDeliveryMinutes)
                .faqText(faqText)
                .termsText(termsText)
                .kvkkText(kvkkText)
                .distanceSalesText(distanceSalesText)
                .storeName(storeName)
                .phone(phone)
                .email(email)
                .address(address)
                .workingHoursEnabled(workingHoursEnabled)
                .openingTime(openingTime)
                .closingTime(closingTime)
                .minOrderAmount(minOrderAmount)
                .orderAcceptingEnabled(orderAcceptingEnabled)
                .build();


    }
}
