import { Request, Response } from "express";
import prisma from "../config/prisma";

export const getStockMovements = async (req: Request, res: Response) => {
    try {
        const page = parseInt((req.query.page as string) || "0");
        const size = parseInt((req.query.size as string) || "20");
        const productId = req.query.productId ? BigInt(req.query.productId as string) : undefined;
        const sort = (req.query.sort as string) || "created_at,desc";

        const where: any = {};
        if (productId) {
            where.product_id = productId;
        }

        let orderBy: any = { created_at: "desc" };
        if (sort) {
            const [field, dir] = sort.split(",");
            if (field === "createdAt" || field === "created_at") {
                orderBy = { created_at: dir === "asc" ? "asc" : "desc" };
            }
        }

        const [movements, totalElements] = await Promise.all([
            prisma.stock_movements.findMany({
                where,
                skip: page * size,
                take: size,
                orderBy,
                include: { products: true }
            }),
            prisma.stock_movements.count({ where })
        ]);

        const totalPages = Math.ceil(totalElements / size);

        res.json({
            content: movements.map((m: any) => ({
                id: m.id.toString(),
                productId: m.product_id.toString(),
                productName: m.products.name,
                type: m.type, // 'SALE', 'RESTOCK', 'ADJUSTMENT'
                delta: m.delta,
                beforeStock: m.before_stock,
                afterStock: m.after_stock,
                note: m.note,
                actor: m.actor, // 'Admin', 'System'
                createdAt: m.created_at
            })),
            totalPages,
            totalElements,
            size,
            number: page
        });

    } catch (error) {
        console.error("Get Stock Movements Error:", error);
        res.status(500).json({ message: "Error fetching stock movements" });
    }
};
