package com.marketim.backend.report.pdf;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public final class PdfFormatUtils {

    private PdfFormatUtils() {}

    public static final DateTimeFormatter DT = DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm");
    public static final DateTimeFormatter D  = DateTimeFormatter.ofPattern("dd.MM.yyyy");

    public static String nvl(String s) {
        return s == null ? "" : s;
    }

    public static String date(LocalDate d) {
        return d == null ? "-" : D.format(d);
    }

    public static String dateTime(LocalDateTime dt) {
        return dt == null ? "-" : DT.format(dt);
    }

    public static String money(BigDecimal amount) {
        if (amount == null) return "0.00";
        return amount.setScale(2, RoundingMode.HALF_UP).toPlainString();
    }
}

