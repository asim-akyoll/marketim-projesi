package com.marketim.backend.report.pdf;

import com.lowagie.text.pdf.BaseFont;
import org.springframework.core.io.ClassPathResource;

import java.io.InputStream;

public final class PdfFontProvider {

    private PdfFontProvider() {
    }

    public static BaseFont turkish() {
        try (InputStream is = new ClassPathResource("fonts/DejaVuSans.ttf").getInputStream()) {
            byte[] bytes = is.readAllBytes();
            return BaseFont.createFont(
                    "DejaVuSans.ttf",
                    BaseFont.IDENTITY_H,
                    BaseFont.EMBEDDED,
                    true,
                    bytes,
                    null
            );
        } catch (Exception e) {
            throw new RuntimeException("PDF font yuklenemedi", e);
        }
    }
}
