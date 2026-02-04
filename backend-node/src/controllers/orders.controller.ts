import { Request, Response } from "express";
import prisma from "../config/prisma";
import { Prisma } from "@prisma/client";

export const createOrder = async (req: Request, res: Response) => {
    try {
        const { items, guestInfo, paymentMethod, note } = req.body;
        const userId = req.user?.userId ? BigInt(req.user.userId) : null;

        // items: { product_id, quantity }
        // Fetch products to verify price and stock
        const productIds = items.map((i: any) => BigInt(i.product.id)); // Frontend sends full product object usually
        const products = await prisma.products.findMany({
            where: { id: { in: productIds } }
        });

        // Use transaction
        const result = await prisma.$transaction(async (tx: any) => {
            let subtotal = 0;
            const orderItemsData = [];

            for (const item of items) {
                const product = products.find((p: any) => p.id === BigInt(item.product.id));
                if (!product) throw new Error(`Product not found: ${item.product.name}`);
                if (product.stock < item.quantity) throw new Error(`Insufficient stock for: ${product.name}`);

                // Update stock manually or via stock_movement? 
                // Java implementation used StockService. 
                // Here we just decrement active stock for simplicity or add logic later.
                await tx.products.update({
                    where: { id: product.id },
                    data: { stock: { decrement: item.quantity } }
                });

                const unitPrice = parseFloat(product.price.toString());
                const lineTotal = unitPrice * item.quantity;
                subtotal += lineTotal;

                orderItemsData.push({
                    product_id: product.id,
                    quantity: item.quantity,
                    unit_price: new Prisma.Decimal(unitPrice),
                    line_total: new Prisma.Decimal(lineTotal)
                });
            }

            // Fetch delivery fee from Settings (Mock or DB? Better DB)
            const feeSetting = await tx.settings.findUnique({ where: { setting_key: 'DELIVERY_FEE' } });
            const thresholdSetting = await tx.settings.findUnique({ where: { setting_key: 'FREE_DELIVERY_THRESHOLD' } });
            
            let deliveryFee = feeSetting ? parseFloat(feeSetting.setting_value) : 0;
            const threshold = thresholdSetting ? parseFloat(thresholdSetting.setting_value) : 0;

            if (threshold > 0 && subtotal >= threshold) {
                deliveryFee = 0;
            }

            const totalAmount = subtotal + deliveryFee;

            // Create Order
            const order = await tx.orders.create({
                data: {
                    user_id: userId,
                    guest_name: guestInfo?.name,
                    guest_email: guestInfo?.email,
                    contact_phone: guestInfo?.phone,
                    delivery_address: guestInfo?.address,
                    payment_method: paymentMethod || "CASH_ON_DELIVERY",
                    note: note,
                    status: "PREPARING", // Default
                    subtotal_amount: new Prisma.Decimal(subtotal),
                    delivery_fee: new Prisma.Decimal(deliveryFee),
                    total_amount: new Prisma.Decimal(totalAmount),
                    created_at: new Date(),
                    order_items: {
                        create: orderItemsData
                    }
                },
                include: { order_items: true }
            });

            return order;
        });

        res.status(201).json({ 
            ...result, 
            id: result.id.toString(), 
            user_id: result.user_id?.toString(),
            subtotal_amount: result.subtotal_amount.toNumber(),
            delivery_fee: result.delivery_fee.toNumber(),
            total_amount: result.total_amount.toNumber(),
            order_items: result.order_items.map((i: any) => ({
                ...i,
                id: i.id.toString(),
                order_id: i.order_id.toString(),
                product_id: i.product_id.toString(),
                unit_price: i.unit_price.toNumber(),
                line_total: i.line_total.toNumber()
            }))
        });

    } catch (error: any) {
        console.error("Create Order Error:", error);
        res.status(400).json({ message: error.message || "Error creating order" });
    }
};

export const getOrders = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const userId = BigInt(req.user.userId);
        const orders = await prisma.orders.findMany({
            where: { user_id: userId },
            orderBy: { created_at: 'desc' },
            include: { order_items: { include: { products: true } } }
        });

        res.json(orders.map((o: any) => serializeOrder(o)));
    } catch (error) {
        res.status(500).json({ message: "Error fetching orders" });
    }
};

export const getAllOrders = async (req: Request, res: Response) => {
    try {
        const page = parseInt((req.query.page as string) || "0");
        const size = parseInt((req.query.size as string) || "15");
        
        const [orders, totalElements] = await Promise.all([
            prisma.orders.findMany({
                take: size,
                skip: page * size,
                orderBy: { created_at: 'desc' },
                include: { users: true, order_items: { include: { products: true } } }
            }),
            prisma.orders.count()
        ]);

        const totalPages = Math.ceil(totalElements / size);

        res.json({
            content: orders.map((o: any) => serializeOrder(o)),
            totalPages,
            totalElements,
            size,
            number: page
        });

    } catch (error) {
        console.error("Get All Orders Error:", error);
        res.status(500).json({ message: "Error fetching orders" });
    }
};

export const getOrder = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const order = await prisma.orders.findUnique({
            where: { id: BigInt(id as string) },
            include: { order_items: { include: { products: true } }, users: true }
        });
        if (!order) return res.status(404).json({ message: "Order not found" });
        res.json(serializeOrder(order));
    } catch (error) {
        res.status(500).json({ message: "Error fetching order" });
    }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const order = await prisma.orders.update({
            where: { id: BigInt(id as string) },
            data: { status }
        });
        res.json(serializeOrder(order));
    } catch (error) {
        res.status(500).json({ message: "Error updating order status" });
    }
}


// Helper to serialize BigInt and Decimal
const serializeOrder = (o: any) => ({
    ...o,
    id: o.id.toString(),
    user_id: o.user_id?.toString(),
    subtotal_amount: o.subtotal_amount.toNumber(),
    delivery_fee: o.delivery_fee.toNumber(),
    total_amount: o.total_amount.toNumber(),
    order_items: o.order_items?.map((i: any) => ({
        ...i,
        id: i.id.toString(),
        order_id: i.order_id.toString(),
        product_id: i.product_id.toString(),
        unit_price: i.unit_price.toNumber(),
        line_total: i.line_total.toNumber(),
        products: i.products ? {
            ...i.products,
            id: i.products.id.toString(),
            price: i.products.price.toNumber(),
            category_id: i.products.category_id?.toString()
        } : null
    })),
    users: o.users ? { ...o.users, id: o.users.id.toString() } : null
});
