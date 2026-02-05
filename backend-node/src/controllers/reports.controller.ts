import { Request, Response } from "express";
import prisma from "../config/prisma";
import PDFDocument from "pdfkit";

export const generateReport = async (req: Request, res: Response) => {
    try {
        const { type, startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({ message: "Start date and End date required" });
        }

        const start = new Date(startDate as string);
        const end = new Date(endDate as string);
        end.setHours(23, 59, 59, 999);

        // Fetch Orders
        const orders = await prisma.orders.findMany({
            where: {
                created_at: {
                    gte: start,
                    lte: end
                },
                status: "DELIVERED"
            },
            include: { users: true },
            orderBy: { created_at: "asc" }
        });

        // Create PDF
        const doc = new PDFDocument({ margin: 50 });

        // Stream response
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename=report-${type}-${startDate}.pdf`);

        doc.pipe(res);

        // Header
        doc.fontSize(20).text("Marketim - Satis Raporu", { align: "center" });
        doc.moveDown();
        doc.fontSize(12).text(`Tarih Araligi: ${startDate} - ${endDate}`, { align: "center" });
        doc.moveDown();
        doc.moveDown();

        // Table Header
        const tableTop = 150;
        let y = tableTop;

        doc.font("Helvetica-Bold");
        doc.text("Tarih", 50, y);
        doc.text("Siparis No", 200, y);
        doc.text("Musteri", 300, y);
        doc.text("Tutar", 450, y);
        doc.font("Helvetica");

        y += 20;
        doc.moveTo(50, y).lineTo(550, y).stroke();
        y += 10;

        let totalRevenue = 0;

        // Rows
        for (const order of orders) {
            if (y > 700) { // New Page
                doc.addPage();
                y = 50;
            }

            const dateStr = order.created_at ? order.created_at.toISOString().split('T')[0] : "-";
            const amount = order.total_amount.toNumber();
            const customer = order.users ? `${order.users.first_name} ${order.users.last_name}` : (order.guest_name || "Guest");

            doc.text(dateStr, 50, y);
            doc.text(order.id.toString(), 200, y);
            doc.text(customer.substring(0, 20), 300, y); // Truncate name
            doc.text(amount.toFixed(2) + " TL", 450, y);

            totalRevenue += amount;
            y += 20;
        }

        doc.moveDown();
        doc.moveTo(50, y).lineTo(550, y).stroke();
        y += 20;

        doc.font("Helvetica-Bold").text(`TOPLAM GELIR: ${totalRevenue.toFixed(2)} TL`, 350, y);

        doc.end();

    } catch (error) {
        console.error("Generate Report Error:", error);
        res.status(500).json({ message: "Error generating report" });
    }
};
