import { Request, Response } from "express";
import prisma from "../config/prisma";

export const getMe = async (req: Request, res: Response) => {
    try {
        if (!req.user || !req.user.sub) {
             return res.status(401).json({ message: "Not authenticated" });
        }
        
        const user = await prisma.users.findUnique({
            where: { email: req.user.sub }
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({
            fullName: `${user.first_name} ${user.last_name}`,
            phone: user.phone,
            address: user.address,
            username: user.username,
            // Extra fields that might be useful
            email: user.email,
            role: user.role
        });
    } catch (error) {
        console.error("GetMe Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const updateMe = async (req: Request, res: Response) => {
    try {
        const { fullName, phone, address, username } = req.body;
        const email = req.user?.sub;

        if (!email) {
            return res.status(401).json({ message: "Not authenticated" });
        }

        // Get current user
        const currentUser = await prisma.users.findUnique({ where: { email } });
        if (!currentUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check username uniqueness if provided and different from current
        if (username && username !== currentUser.username) {
            const existingUsername = await prisma.users.findUnique({ where: { username } });
            if (existingUsername) {
                return res.status(400).json({ message: "Username already exists" });
            }
        }

        let firstName = "";
        let lastName = "";

        if (fullName) {
            const parts = fullName.trim().split(" ");
            if (parts.length > 1) {
                lastName = parts.pop() || "";
                firstName = parts.join(" ");
            } else {
                firstName = parts[0] || "";
            }
        }

        // Update
        const updatedUser = await prisma.users.update({
            where: { email },
            data: {
                ...(fullName && { first_name: firstName, last_name: lastName }),
                ...(phone && { phone }),
                ...(address && { address }),
                ...(username !== undefined && { username: username || null })
            }
        });

        res.json({
            fullName: `${updatedUser.first_name} ${updatedUser.last_name}`,
            phone: updatedUser.phone,
            address: updatedUser.address,
            username: updatedUser.username
        });
    } catch (error) {
         console.error("UpdateMe Error:", error);
         res.status(500).json({ message: "Internal server error" });
    }
};

export const getCustomers = async (req: Request, res: Response) => {
    try {
        const page = parseInt((req.query.page as string) || "0");
        const size = parseInt((req.query.size as string) || "10");
        const search = req.query.search as string;

        const where: any = { role: "CUSTOMER" };

        if (search) {
            where.OR = [
                { first_name: { contains: search, mode: "insensitive" } },
                { last_name: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
                { phone: { contains: search, mode: "insensitive" } }
            ];
        }

        const [users, totalElements] = await Promise.all([
            prisma.users.findMany({
                where,
                skip: page * size,
                take: size,
                orderBy: { created_at: "desc" }
            }),
            prisma.users.count({ where })
        ]);

        const totalPages = Math.ceil(totalElements / size);

        res.json({
            content: users.map(u => ({
                id: u.id.toString(),
                email: u.email,
                firstName: u.first_name,
                lastName: u.last_name,
                phone: u.phone,
                address: u.address,
                role: u.role,
                active: u.active,
                createdAt: u.created_at
            })),
            totalPages,
            totalElements,
            size,
            number: page
        });

    } catch (error) {
        console.error("Get Customers Error:", error);
        res.status(500).json({ message: "Error fetching customers" });
    }
};

export const getCustomerOrders = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        
        const orders = await prisma.orders.findMany({
            where: { user_id: BigInt(userId) },
            take: 3,
            orderBy: { created_at: 'desc' },
            include: {
                order_items: {
                    include: {
                        products: true
                    }
                }
            }
        });

        // Serialize orders
        const serialized = orders.map(o => ({
            id: o.id.toString(),
            status: o.status,
            totalAmount: o.total_amount?.toNumber() || 0,
            createdAt: o.created_at,
            itemsCount: o.order_items?.length || 0,
            items: o.order_items?.map(i => ({
                productName: i.products?.name || 'Unknown',
                quantity: i.quantity,
                unitPrice: i.unit_price?.toNumber() || 0
            }))
        }));

        // Return paginated format
        res.json({
            content: serialized,
            totalElements: serialized.length,
            totalPages: 1,
            number: 0,
            size: 3
        });
    } catch (error) {
        console.error("Get Customer Orders Error:", error);
        res.status(500).json({ message: "Error fetching customer orders" });
    }
};

