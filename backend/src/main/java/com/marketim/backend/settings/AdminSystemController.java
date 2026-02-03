package com.marketim.backend.settings;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/system")
public class AdminSystemController {

    private final SettingService settingService;

    @PostMapping("/cache/clear")
    public Map<String, String> clearCache() {
        settingService.clearAllCaches();
        return Map.of("message", "Cache temizlendi.");
    }
}
