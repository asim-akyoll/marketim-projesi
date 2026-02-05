import { Request, Response } from "express";
import prisma from "../config/prisma";
import { Prisma } from "@prisma/client";

export const createOrder = async (req: Request, res: Response) => {
    try {
        const { items, guestInfo, paymentMethod, note, deliveryAddress, contactPhone, guestName, guestEmail } = req.body;
        const userId = req.user?.userId ? BigInt(req.user.userId) : null;

        // Frontend düz gönderiyor, backend object bekliyordu. Burada map'liyoruz.
        const orderGuestInfo = guestInfo || {
            name: guestName,
            email: guestEmail,
            phone: contactPhone,
            address: deliveryAddress
        };

        // items: { productId, quantity } (Frontend sends productId)
        const productIds = items.map((i: any) => BigInt(i.productId || i.product?.id)); 
        const products = await prisma.products.findMany({
            where: { id: { in: productIds } }
        });

        // Use transaction
        const result = await prisma.$transaction(async (tx: any) => {
            let subtotal = 0;
            const orderItemsData = [];

            for (const item of items) {
                const pId = BigInt(item.productId || item.product?.id);
                const product = products.find((p: any) => p.id === pId);
                if (!product) throw new Error(`Product not found: ${pId}`);
                if (product.stock < item.quantity) throw new Error(`Insufficient stock for: ${product.name}`);

                // Update stock manually or via stock_movement? 
                // Java implementation used StockService. 
                // Here we just decrement active stock for simplicity or add logic later.
                // Update Stock & Record Movement
                const beforeStock = product.stock;
                const afterStock = beforeStock - item.quantity;

                await tx.products.update({
                    where: { id: product.id },
                    data: { stock: afterStock }
                });

                await tx.stock_movements.create({
                    data: {
                        product_id: product.id,
                        type: "SALE",
                        delta: -item.quantity,
                        before_stock: beforeStock,
                        after_stock: afterStock,
                        actor: "System",
                        reference_type: "ORDER",
                        created_at: new Date()
                        // reference_id will be updated after order creation or we can just link to order_item if needed, 
                        // but schema has reference_id as BigInt. We'll leave it null or fill it if we have the order ID (which we don't yet).
                        // Legacy likely did this in a separate phase or mapped it differently.
                    }
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
                    guest_name: orderGuestInfo?.name,
                    guest_email: orderGuestInfo?.email,
                    contact_phone: orderGuestInfo?.phone,
                    delivery_address: orderGuestInfo?.address,
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
        const status = req.query.status as string | undefined;
        const searchQuery = req.query.q as string | undefined;
        const sortParam = (req.query.sort as string) || "createdAt,desc";
        
        // Parse sort parameter (e.g., "createdAt,desc" or "totalAmount,asc")
        const [sortField, sortDirection] = sortParam.split(",");
        const orderByField = sortField === "createdAt" ? "created_at" : 
                            sortField === "totalAmount" ? "total_amount" : 
                            sortField === "id" ? "id" : "created_at";
        const orderByDirection = sortDirection === "asc" ? "asc" : "desc";

        // Build where clause
        const where: any = {};
        
        // Status filter
        if (status) {
            where.status = status;
        }
        
        // Search filter (customer name, address, ID)
        if (searchQuery) {
            where.OR = [
                { id: isNaN(Number(searchQuery)) ? undefined : BigInt(searchQuery) },
                { guest_name: { contains: searchQuery, mode: 'insensitive' } },
                { delivery_address: { contains: searchQuery, mode: 'insensitive' } },
                { users: { 
                    OR: [
                        { first_name: { contains: searchQuery, mode: 'insensitive' } },
                        { last_name: { contains: searchQuery, mode: 'insensitive' } },
                        { email: { contains: searchQuery, mode: 'insensitive' } }
                    ]
                }}
            ].filter(Boolean);
        }
        
        const [orders, totalElements] = await Promise.all([
            prisma.orders.findMany({
                where,
                take: size,
                skip: page * size,
                orderBy: { [orderByField]: orderByDirection },
                include: { users: true, order_items: { include: { products: true } } }
            }),
            prisma.orders.count({ where })
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

        // First, fetch the current order to check its status
        const currentOrder = await prisma.orders.findUnique({
            where: { id: BigInt(id as string) }
        });

        if (!currentOrder) {
            return res.status(404).json({ message: "Sipariş bulunamadı" });
        }

        // Business Rule: DELIVERED orders cannot be changed
        if (currentOrder.status === "DELIVERED") {
            return res.status(400).json({ 
                message: "Teslim edilen bir siparişin durumu değiştirilemez" 
            });
        }

        // Business Rule: CANCELLED orders cannot be changed
        if (currentOrder.status === "CANCELLED") {
            return res.status(400).json({ 
                message: "İptal edilen bir siparişin durumu değiştirilemez" 
            });
        }

        // If validation passes, update the order
        const order = await prisma.orders.update({
            where: { id: BigInt(id as string) },
            data: { status }
        });
        
        res.json(serializeOrder(order));
    } catch (error) {
        console.error("Update Order Status Error:", error);
        res.status(500).json({ message: "Sipariş durumu güncellenirken hata oluştu" });
    }
}


// Helper to serialize BigInt and Decimal
const serializeOrder = (o: any) => {
    // Compute customerName from user or guest info
    const customerName = o.guest_name || 
                        (o.users ? `${o.users.first_name || ''} ${o.users.last_name || ''}`.trim() : null) ||
                        null;
    
    // Use deliveryAddress as address
    const address = o.delivery_address || null;

    return {
        id: o.id.toString(),
        userId: o.user_id?.toString(),
        guestName: o.guest_name,
        guestEmail: o.guest_email,
        contactPhone: o.contact_phone,
        deliveryAddress: o.delivery_address,
        paymentMethod: o.payment_method,
        note: o.note,
        status: o.status,
        subtotalAmount: o.subtotal_amount?.toNumber() || 0,
        deliveryFee: o.delivery_fee?.toNumber() || 0,
        totalAmount: o.total_amount?.toNumber() || 0,
        createdAt: o.created_at,
        
        // Admin list view fields
        customerName,
        address,
        
        orderItems: o.order_items?.map((i: any) => ({
            id: i.id.toString(),
            orderId: i.order_id.toString(),
            productId: i.product_id.toString(),
            productName: i.products?.name || 'Unknown',
            quantity: i.quantity,
            unitPrice: i.unit_price?.toNumber() || 0,
            lineTotal: i.line_total?.toNumber() || 0,
            product: i.products ? {
                id: i.products.id.toString(),
                name: i.products.name,
                price: i.products.price?.toNumber() || 0,
                categoryId: i.products.category_id?.toString()
            } : null
        })),
        user: o.users ? { 
            id: o.users.id.toString(),
            email: o.users.email,
            firstName: o.users.first_name,
            lastName: o.users.last_name
        } : null,
        
        // Alias for detail modal compatibility
        items: o.order_items?.map((i: any) => ({
            productName: i.products?.name || 'Unknown',
            quantity: i.quantity,
            lineTotal: i.line_total?.toNumber() || 0,
            unitPrice: i.unit_price?.toNumber() || 0
        }))
    };
};
