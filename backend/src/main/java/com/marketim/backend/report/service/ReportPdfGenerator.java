package com.marketim.backend.report.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import com.marketim.backend.report.ReportType;
import com.marketim.backend.report.dto.OrderReportRowDto;
import com.marketim.backend.report.dto.StockReportRowDto;
import com.marketim.backend.report.dto.SummaryReportDto;
import com.marketim.backend.report.pdf.OrderStatusLabel;
import com.marketim.backend.report.pdf.PdfFooterEvent;
import com.marketim.backend.report.pdf.PdfFontProvider;
import com.marketim.backend.report.pdf.PdfFormatUtils;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Component
public class ReportPdfGenerator {

    // ---------------- ORDER ----------------
    public byte[] generateOrderReport(
            String storeName,
            LocalDate startDate,
            LocalDate endDate,
            LocalDateTime generatedAt,
            List<OrderReportRowDto> rows
    ) {
        try {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            Document document = new Document(PageSize.A4, 36, 36, 60, 60);

            PdfWriter writer = PdfWriter.getInstance(document, out);
            writer.setPageEvent(new PdfFooterEvent(storeName, generatedAt));

            document.open();

            BaseFont bf = PdfFontProvider.turkish();
            Font titleFont = new Font(bf, 14, Font.BOLD);
            Font normalFont = new Font(bf, 10, Font.NORMAL);
            Font smallBold = new Font(bf, 10, Font.BOLD);
            Font headerFont = new Font(bf, 10, Font.BOLD);

            Paragraph title = new Paragraph("Siparis Raporu", titleFont);
            title.setSpacingAfter(8);
            document.add(title);

            document.add(metaTable(storeName, startDate, endDate, generatedAt, smallBold, normalFont));

            PdfPTable table = new PdfPTable(5);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{1.2f, 1.6f, 2.4f, 1.4f, 1.4f});
            table.setHeaderRows(1); // ✅ taşma olunca header tekrar eder

            addHeader(table, "Siparis No", headerFont);
            addHeader(table, "Tarih", headerFont);
            addHeader(table, "Musteri", headerFont);
            addHeader(table, "Tutar", headerFont);
            addHeader(table, "Durum", headerFont);

            if (rows == null || rows.isEmpty()) {
                PdfPCell cell = new PdfPCell(new Phrase("Secilen aralikta siparis bulunamadi.", normalFont));
                cell.setColspan(5);
                cell.setPadding(10);
                cell.setBorderColor(new java.awt.Color(230, 230, 230));
                table.addCell(cell);
            } else {
                int i = 0;
                for (OrderReportRowDto r : rows) {
                    boolean alt = (i % 2 == 1);
                    table.addCell(cell(String.valueOf(r.orderId()), normalFont, alt));
                    table.addCell(cell(PdfFormatUtils.dateTime(r.createdAt()), normalFont, alt));
                    table.addCell(cell(PdfFormatUtils.nvl(r.customerName()), normalFont, alt));
                    table.addCell(cell(PdfFormatUtils.money(r.totalAmount()), normalFont, alt));
                    table.addCell(cell(OrderStatusLabel.tr(r.status()), normalFont, alt));
                    i++;
                }
            }

            document.add(table);
            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("PDF olusturulamadi", e);
        }
    }

    // ---------------- STOCK ----------------
    public byte[] generateStockReport(
            String storeName,
            LocalDate startDate,
            LocalDate endDate,
            LocalDateTime generatedAt,
            List<StockReportRowDto> rows
    ) {
        try {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            Document document = new Document(PageSize.A4, 36, 36, 60, 60);

            PdfWriter writer = PdfWriter.getInstance(document, out);
            writer.setPageEvent(new PdfFooterEvent(storeName, generatedAt));

            document.open();

            BaseFont bf = PdfFontProvider.turkish();
            Font titleFont = new Font(bf, 14, Font.BOLD);
            Font normalFont = new Font(bf, 10, Font.NORMAL);
            Font boldFont = new Font(bf, 10, Font.BOLD); // ✅ kritik satır
            Font smallBold = new Font(bf, 10, Font.BOLD);
            Font headerFont = new Font(bf, 10, Font.BOLD);

            Paragraph title = new Paragraph("Stok Durum Raporu", titleFont);
            title.setSpacingAfter(8);
            document.add(title);

            document.add(metaTable(storeName, startDate, endDate, generatedAt, smallBold, normalFont));

            PdfPTable table = new PdfPTable(3);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{3.0f, 1.2f, 1.6f});
            table.setHeaderRows(1); // ✅ taşma

            addHeader(table, "Urun", headerFont);
            addHeader(table, "Mevcut Stok", headerFont);
            addHeader(table, "Kritik", headerFont);

            if (rows == null || rows.isEmpty()) {
                PdfPCell cell = new PdfPCell(new Phrase("Urun bulunamadi.", normalFont));
                cell.setColspan(3);
                cell.setPadding(10);
                table.addCell(cell);
            } else {
                for (StockReportRowDto r : rows) {
                    Font rowFont = r.critical() ? boldFont : normalFont;
                    table.addCell(cell(PdfFormatUtils.nvl(r.productName()), rowFont));
                    table.addCell(cell(String.valueOf(r.stock() == null ? 0 : r.stock()), rowFont));
                    table.addCell(cell(r.critical() ? "Kritik" : "-", rowFont));
                }
            }

            document.add(table);
            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("PDF olusturulamadi", e);
        }
    }

    // ---------------- SUMMARY (DAILY/MONTHLY) ----------------
    public byte[] generateSummaryReport(
            ReportType type,
            String storeName,
            LocalDate startDate,
            LocalDate endDate,
            LocalDateTime generatedAt,
            SummaryReportDto s
    ) {
        try {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            Document document = new Document(PageSize.A4, 36, 36, 60, 60);

            PdfWriter writer = PdfWriter.getInstance(document, out);
            writer.setPageEvent(new PdfFooterEvent(storeName, generatedAt));

            document.open();

            BaseFont bf = PdfFontProvider.turkish();
            Font titleFont = new Font(bf, 14, Font.BOLD);
            Font normalFont = new Font(bf, 10, Font.NORMAL);
            Font smallBold = new Font(bf, 10, Font.BOLD);
            Font headerFont = new Font(bf, 10, Font.BOLD);

            String titleText = (type == ReportType.DAILY) ? "Gunluk Ozet" : "Ay Sonu Raporu";
            Paragraph title = new Paragraph(titleText, titleFont);
            title.setSpacingAfter(8);
            document.add(title);

            document.add(metaTable(storeName, startDate, endDate, generatedAt, smallBold, normalFont));

            PdfPTable table = new PdfPTable(2);
            table.setWidthPercentage(80);
            table.setWidths(new float[]{2.2f, 1.8f});
            table.setHeaderRows(1);

            addHeader(table, "Metrix", headerFont);
            addHeader(table, "Deger", headerFont);

            table.addCell(cell("Toplam Siparis", normalFont));
            table.addCell(cell(String.valueOf(s.totalOrders()), normalFont));

            table.addCell(cell("Teslim Edilen", normalFont));
            table.addCell(cell(String.valueOf(s.deliveredCount()), normalFont));

            table.addCell(cell("Iptal Edilen", normalFont));
            table.addCell(cell(String.valueOf(s.cancelledCount()), normalFont));

            table.addCell(cell("Ciro", normalFont));
            table.addCell(cell(PdfFormatUtils.money(s.revenue()), normalFont));

            table.addCell(cell("Ortalama Siparis", normalFont));
            table.addCell(cell(PdfFormatUtils.money(s.avgOrderAmount()), normalFont));

            document.add(table);
            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("PDF olusturulamadi", e);
        }
    }

    // ---------------- COMMON HELPERS ----------------

    private void addHeader(PdfPTable table, String text, Font headerFont) {
        PdfPCell cell = new PdfPCell(new Phrase(text, headerFont));
        cell.setHorizontalAlignment(Element.ALIGN_LEFT);
        cell.setBackgroundColor(new java.awt.Color(230, 240, 255)); // Light Blue Header
        cell.setPadding(8);
        cell.setBorderColor(new java.awt.Color(200, 200, 200));
        table.addCell(cell);
    }

    private PdfPCell cell(String text, Font font, boolean alternate) {
        PdfPCell cell = new PdfPCell(new Phrase(PdfFormatUtils.nvl(text), font));
        cell.setPadding(6);
        cell.setBorderColor(new java.awt.Color(230, 230, 230));
        if (alternate) {
            cell.setBackgroundColor(new java.awt.Color(250, 250, 250));
        }
        return cell;
    }

    // Overload for backward compatibility if needed, though we will update calls
    private PdfPCell cell(String text, Font font) {
        return cell(text, font, false);
    }

    private PdfPTable metaTable(String storeName, LocalDate startDate, LocalDate endDate, LocalDateTime generatedAt,
                                Font kFont, Font vFont) throws DocumentException {

        PdfPTable meta = new PdfPTable(2);
        meta.setWidthPercentage(100);
        meta.setSpacingAfter(20);
        meta.setWidths(new float[]{1.2f, 2.8f});

        addMetaRow(meta, "Magaza:", storeName, kFont, vFont);
        addMetaRow(meta, "Rapor Araligi:",
                PdfFormatUtils.date(startDate) + " - " + PdfFormatUtils.date(endDate),
                kFont, vFont);
        addMetaRow(meta, "Olusturma:", PdfFormatUtils.dateTime(generatedAt), kFont, vFont);

        return meta;
    }

    private void addMetaRow(PdfPTable meta, String k, String v, Font kFont, Font vFont) {
        PdfPCell c1 = new PdfPCell(new Phrase(k, kFont));
        c1.setBorder(Rectangle.NO_BORDER);
        c1.setPadding(3);

        PdfPCell c2 = new PdfPCell(new Phrase(PdfFormatUtils.nvl(v), vFont));
        c2.setBorder(Rectangle.NO_BORDER);
        c2.setPadding(3);

        meta.addCell(c1);
        meta.addCell(c2);
    }
}
