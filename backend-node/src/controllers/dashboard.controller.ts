import { Request, Response } from "express";
import prisma from "../config/prisma";
import { Prisma } from "@prisma/client";

export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const last7Days = new Date();
        last7Days.setDate(today.getDate() - 7);

        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        // 1. Order Counts by Status & Date
        const [
            totalOrders,
            todayOrdersCount,
            pendingCount,
            deliveredCount,
            cancelledCount,
            recentOrdersRaw
        ] = await Promise.all([
            prisma.orders.count(),
            prisma.orders.count({ where: { created_at: { gte: today } } }),
            prisma.orders.count({ where: { status: "PENDING" } }), // Or whatever enum backend uses
            prisma.orders.count({ where: { status: "DELIVERED" } }),
            prisma.orders.count({ where: { status: "CANCELLED" } }),
            prisma.orders.findMany({
                take: 5,
                orderBy: { created_at: 'desc' },
                include: { users: true }
            })
        ]);

        // 2. Revenue Calculations
        // Today
        const revenueTodayAgg = await prisma.orders.aggregate({
            _sum: { total_amount: true },
            where: { created_at: { gte: today }, status: { not: "CANCELLED" } } // Exclude cancelled?
        });
        
        // Last 7 Days
        const revenue7DaysAgg = await prisma.orders.aggregate({
             _sum: { total_amount: true },
             where: { created_at: { gte: last7Days }, status: { not: "CANCELLED" } }
        });

        // This Month
        const revenueMonthAgg = await prisma.orders.aggregate({
            _sum: { total_amount: true },
            where: { created_at: { gte: firstDayOfMonth }, status: { not: "CANCELLED" } }
        });

        const revenueToday = revenueTodayAgg._sum.total_amount?.toNumber() || 0;
        const revenue7Days = revenue7DaysAgg._sum.total_amount?.toNumber() || 0;
        const revenueMonth = revenueMonthAgg._sum.total_amount?.toNumber() || 0;

        // 3. Format Recent Orders
        const recentOrders = recentOrdersRaw.map((o: any) => ({
            id: Number(o.id), // Ensure number
            userFullName: o.users ? `${o.users.first_name} ${o.users.last_name}` : o.guest_name || "Guest",
            totalAmount: o.total_amount ? o.total_amount.toNumber() : 0,
            status: o.status,
            createdAt: o.created_at
        }));

        const responseData = {
            todayOrderCount: todayOrdersCount,
            pending: pendingCount,
            delivered: deliveredCount,
            cancelled: cancelledCount,
            totalOrders: totalOrders,
            revenue: {
                today: revenueToday,
                last7Days: revenue7Days,
                thisMonth: revenueMonth
            },
            recentOrders: recentOrders
        };

        res.json(responseData);

    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        res.status(500).json({ message: "Error fetching dashboard stats" });
    }
};
