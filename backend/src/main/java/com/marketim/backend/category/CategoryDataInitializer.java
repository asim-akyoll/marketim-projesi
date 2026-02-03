package com.marketim.backend.category;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class CategoryDataInitializer implements CommandLineRunner {

    private final CategoryRepository categoryRepository;

    @Override
    public void run(String... args) throws Exception {
        System.out.println("--- CATEGORY INITIALIZER STARTED ---");

        // 1. UPDATE EXISTING (Fix Broken Names)
        updateCategory(1L, "Meyve & Sebze", "meyve-sebze");
        updateCategory(4L, "Süt Ürünleri", "sut-urunleri");
        updateCategory(5L, "Atıştırmalık", "atistirmalik");
        updateCategory(6L, "Su & İçecek", "su-icecek");
        updateCategory(3L, "Kahvaltılık", "kahvaltilik");
        
        // Deactivate unused test cat if exists (2)
        Optional<Category> cat2 = categoryRepository.findById(2L);
        if (cat2.isPresent()) {
             Category c = cat2.get();
             c.setActive(false);
             categoryRepository.save(c);
        }

        // 2. CREATE MISSING
        List<String> newCategories = Arrays.asList(
            "Fırından", "Dondurma", "Temel Gıda", "Pratik Yemek",
            "Et, Tavuk & Balık", "Dondurulmuş", "Fit & Form",
            "Kişisel Bakım", "Ev Bakım", "Evcil Hayvan", 
            "Ev & Yaşam", "Bebek", "Cinsel Sağlık"
        );

        for (String name : newCategories) {
            if (!categoryRepository.existsByNameIgnoreCase(name)) {
                Category c = Category.builder()
                        .name(name)
                        .slug(toSlug(name))
                        .description("Created via Initializer")
                        .active(true)
                        .build();
                categoryRepository.save(c);
                System.out.println("Created category: " + name);
            }
        }
        System.out.println("--- CATEGORY INITIALIZER FINISHED ---");
    }

    private void updateCategory(Long id, String newName, String newSlug) {
        Optional<Category> opt = categoryRepository.findById(id);
        if (opt.isPresent()) {
            Category c = opt.get();
            c.setName(newName);
            c.setSlug(newSlug);
            c.setActive(true);
            try {
                categoryRepository.save(c);
                System.out.println("Updated ID " + id + " to " + newName);
            } catch (Exception e) {
                System.out.println("Error updating ID " + id + ": " + e.getMessage());
            }
        }
    }

    private String toSlug(String input) {
        return input.toLowerCase()
                .replace("ı", "i")
                .replace("ğ", "g")
                .replace("ü", "u")
                .replace("ş", "s")
                .replace("ö", "o")
                .replace("ç", "c")
                .replace(" ", "-")
                .replaceAll("[^a-z0-9-]", "");
    }
}
