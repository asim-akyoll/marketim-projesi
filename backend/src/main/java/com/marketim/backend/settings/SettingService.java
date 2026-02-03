package com.marketim.backend.settings;

import com.marketim.backend.exception.BadRequestException;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SettingService {

    private final SettingRepository settingRepository;
    private final CacheManager cacheManager;

    @Cacheable("settings")
    public BigDecimal getDecimal(SettingKey key, BigDecimal defaultValue) {
        return settingRepository.findByKey(key)
                .map(Setting::getValue)
                .map(v -> {
                    try {
                        return new BigDecimal(v);
                    } catch (Exception e) {
                        return null;
                    }
                })
                .orElse(defaultValue);
    }

    @CacheEvict(value = "settings", allEntries = true)
    @Transactional
    public void setDecimal(SettingKey key, BigDecimal value) {
        if (value == null || value.compareTo(BigDecimal.ZERO) < 0) {
            throw new BadRequestException("Setting value must be >= 0");
        }

        Setting setting = settingRepository.findByKey(key)
                .orElseGet(() -> Setting.builder().key(key).value("0").build());

        setting.setValue(value.toPlainString());
        settingRepository.save(setting);
    }

    @Cacheable("settings")
    public boolean getBoolean(SettingKey key, boolean defaultValue) {
        return settingRepository.findByKey(key)
                .map(Setting::getValue)
                .map(v -> v.equalsIgnoreCase("true"))
                .orElse(defaultValue);
    }

    @CacheEvict(value = "settings", allEntries = true)
    @Transactional
    public void setBoolean(SettingKey key, boolean value) {
        Setting setting = settingRepository.findByKey(key)
                .orElseGet(() -> Setting.builder().key(key).value("false").build());
        setting.setValue(Boolean.toString(value));
        settingRepository.save(setting);
    }

    @Cacheable("settings")
    public String getString(SettingKey key, String defaultValue) {
        return settingRepository.findByKey(key)
                .map(Setting::getValue)
                .orElse(defaultValue);
    }

    @CacheEvict(value = "settings", allEntries = true)
    @Transactional
    public void setString(SettingKey key, String value) {
        if (value == null) value = "";
        Setting setting = settingRepository.findByKey(key)
                .orElseGet(() -> Setting.builder().key(key).value("").build());
        setting.setValue(value);
        settingRepository.save(setting);
    }

    @Transactional
    public void clearAllCaches() {
        for (String name : cacheManager.getCacheNames()) {
            Cache cache = cacheManager.getCache(name);
            if (cache != null) cache.clear();
        }
    }
}
