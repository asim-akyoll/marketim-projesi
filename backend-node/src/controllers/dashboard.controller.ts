import { Request, Response } from "express";
import prisma from "../config/prisma";
import { Prisma } from "@prisma/client";

export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        const [totalOrders, totalProducts, usersCount, recentOrders] = await Promise.all([
            prisma.orders.count(),
            prisma.products.count({ where: { active: true } }),
            prisma.users.count(),
            prisma.orders.findMany({
                take: 5,
                orderBy: { created_at: 'desc' },
                include: { users: true }
            })
        ]);

        // Calculate Total Sales (Sum of total_amount)
        const salesAggregation = await prisma.orders.aggregate({
            _sum: {
                total_amount: true
            }
        });
        const totalSales = salesAggregation._sum.total_amount?.toNumber() || 0;

        res.json({
            totalOrders,
            totalProducts,
            totalSales,
            totalUsers: usersCount,
            recentOrders: recentOrders.map(o => ({
                id: o.id.toString(),
                user: o.users ? `${o.users.first_name} ${o.users.last_name}` : o.guest_name || "Guest",
                total: o.total_amount.toNumber(),
                status: o.status,
                date: o.created_at
            }))
        });

    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        res.status(500).json({ message: "Error fetching dashboard stats" });
    }
};
