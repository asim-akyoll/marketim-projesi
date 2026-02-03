package com.marketim.backend.report.pdf;

import com.lowagie.text.*;
import com.lowagie.text.pdf.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class PdfFooterEvent extends PdfPageEventHelper {

    private static final DateTimeFormatter DT =
            DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm");

    private final String storeName;
    private final String generatedAt;

    public PdfFooterEvent(String storeName, LocalDateTime generatedAt) {
        this.storeName = storeName;
        this.generatedAt = generatedAt.format(DT);
    }

    @Override
    public void onEndPage(PdfWriter writer, Document document) {
        Font font = FontFactory.getFont(FontFactory.HELVETICA, 9);

        Phrase footer = new Phrase(
                storeName +
                        " | Olusturulma: " + generatedAt +
                        " | Sayfa " + writer.getPageNumber(),
                font
        );

        ColumnText.showTextAligned(
                writer.getDirectContent(),
                Element.ALIGN_CENTER,
                footer,
                (document.right() - document.left()) / 2 + document.leftMargin(),
                document.bottom() - 20,
                0
        );
    }
}

