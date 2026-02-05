import { Request, Response } from "express";
import prisma from "../config/prisma";
import { Prisma } from "@prisma/client";

// --- PUBLIC ---

export const getProducts = async (req: Request, res: Response) => {
  try {
    const page = parseInt((req.query.page as string) || "0");
    const size = parseInt((req.query.size as string) || "10");
    const search = req.query.search as string;
    const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;
    const sort = req.query.sort as string; // 'price,asc', 'price,desc', 'created_at,desc' (newest)

    const where: Prisma.productsWhereInput = {
      active: true, // Public only sees active
    };

    if (search) {
      where.name = { contains: search, mode: "insensitive" };
    }
    if (categoryId) {
      where.category_id = BigInt(categoryId);
    }

    let orderBy: Prisma.productsOrderByWithRelationInput = { id: 'asc' };
    if (sort) {
        if (sort === "price,asc") orderBy = { price: 'asc' };
        else if (sort === "price,desc") orderBy = { price: 'desc' };
        else if (sort === "newest" || sort.startsWith("created_at")) orderBy = { created_at: 'desc' };
    }

    const [content, totalElements] = await Promise.all([
      prisma.products.findMany({
        where,
        take: size,
        skip: page * size,
        orderBy,
        include: { categories: true }
      }),
      prisma.products.count({ where })
    ]);

    const totalPages = Math.ceil(totalElements / size);

    res.json({
      content: content.map((p: any) => ({
        ...p,
        id: p.id.toString(),
        category_id: p.category_id?.toString(),
        stock: p.stock,
        price: p.price.toNumber(), // Decimal to number
        imageUrl: p.image_url,
        unitLabel: p.unit_label,
        categoryName: p.categories?.name,
        category: p.categories ? { ...p.categories, id: p.categories.id.toString() } : null
      })),
      totalPages,
      totalElements,
      size,
      number: page,
      first: page === 0,
      last: page >= totalPages - 1,
      empty: totalElements === 0
    });

  } catch (error) {
    console.error("Get Products Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const product = await prisma.products.findUnique({
            where: { id: BigInt(id as string) },
            include: { categories: true }
        });

        if (!product) return res.status(404).json({ message: "Product not found" });

        res.json({
            ...product,
            id: product.id.toString(),
            category_id: product.category_id?.toString(),
            price: product.price.toNumber(),
            imageUrl: product.image_url,
            unitLabel: product.unit_label,
            categoryName: product.categories?.name,
            category: product.categories ? { ...product.categories, id: product.categories.id.toString() } : null
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching product" });
    }
}


// --- ADMIN ---

export const getAdminProducts = async (req: Request, res: Response) => {
    try {
      const page = parseInt((req.query.page as string) || "0");
      const size = parseInt((req.query.size as string) || "10");
      const search = req.query.search as string;
      const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;
      const sort = req.query.sort as string; // 'id,desc' default for admin usually
  
      const where: Prisma.productsWhereInput = {}; // Admin sees all
  
      if (search) {
        where.name = { contains: search, mode: "insensitive" };
      }
      if (categoryId) {
        where.category_id = BigInt(categoryId);
      }
  
      // Default newest first for admin usually? or ID asc? Java backend default was ID asc unless sorted.
      let orderBy: Prisma.productsOrderByWithRelationInput = { id: 'desc' }; // Newest first usually better for admin
      if (sort) {
          if (sort === 'price,asc') orderBy = { price: 'asc' };
          else if (sort === 'price,desc') orderBy = { price: 'desc' };
          else if (sort === 'newest') orderBy = { created_at: 'desc' };
          else if (sort === 'id,desc') orderBy = { id: 'desc' };
      }
  
      const [content, totalElements] = await Promise.all([
        prisma.products.findMany({
          where,
          take: size,
          skip: page * size,
          orderBy,
          include: { categories: true }
        }),
        prisma.products.count({ where })
      ]);
  
      const totalPages = Math.ceil(totalElements / size);
  
      res.json({
        content: content.map((p: any) => ({
            ...p,
            id: p.id.toString(),
            category_id: p.category_id?.toString(),
            price: p.price.toNumber(),
            imageUrl: p.image_url,
            unitLabel: p.unit_label,
            categoryName: p.categories?.name,
            category: p.categories ? { ...p.categories, id: p.categories.id.toString() } : null
        })),
        totalPages,
        totalElements,
        size,
        number: page
      });
  
    } catch (error) {
      console.error("Get Admin Products Error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };

export const createProduct = async (req: Request, res: Response) => {
    try {
        const { name, price, stock, categoryId, description, imageUrl, unitLabel, active } = req.body;

        const product = await prisma.$transaction(async (tx: any) => {
            const created = await tx.products.create({
                data: {
                    name,
                    price: new Prisma.Decimal(price),
                    stock: parseInt(stock as string),
                    category_id: categoryId ? BigInt(categoryId as string) : null,
                    description,
                    image_url: imageUrl,
                    unit_label: unitLabel || "Adet",
                    active: active !== undefined ? active : true,
                    created_at: new Date()
                }
            });

            // Initial Stock Movement
            await tx.stock_movements.create({
                data: {
                    product_id: created.id,
                    type: "Emtiya Girisi",
                    delta: created.stock,
                    before_stock: 0,
                    after_stock: created.stock,
                    actor: "Admin",
                    note: "Yeni Ürün",
                    created_at: new Date()
                }
            });

            return created;
        });

        res.status(201).json({ 
            ...product, 
            id: product.id.toString(), 
            price: product.price.toNumber(),
            imageUrl: product.image_url,
            unitLabel: product.unit_label
        });
    } catch (error) {
        console.error("Create Product Error:", error);
        res.status(500).json({ message: "Error creating product" });
    }
};

export const updateProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, price, stock, categoryId, description, imageUrl, unitLabel, active } = req.body;

        const product = await prisma.$transaction(async (tx: any) => {
            const current = await tx.products.findUnique({ where: { id: BigInt(id as string) } });
            if (!current) throw new Error("Product not found");

            let stockDelta = 0;
            const newStock = stock !== undefined ? parseInt(stock as string) : current.stock;
            stockDelta = newStock - current.stock;

            const updated = await tx.products.update({
                where: { id: BigInt(id as string) },
                data: {
                    name,
                    price: price ? new Prisma.Decimal(price) : undefined,
                    stock: newStock,
                    category_id: categoryId ? BigInt(categoryId as string) : undefined,
                    description,
                    image_url: imageUrl,
                    unit_label: unitLabel,
                    active,
                    updated_at: new Date()
                }
            });

            if (stockDelta !== 0) {
                 await tx.stock_movements.create({
                    data: {
                        product_id: updated.id,
                        type: stockDelta > 0 ? "Stok Ekleme" : "Stok Dusurme",
                        delta: stockDelta,
                        before_stock: current.stock,
                        after_stock: updated.stock,
                        actor: "Admin", 
                        note: "Manuel Guncelleme",
                        created_at: new Date()
                    }
                });
            }

            return updated;
        });

        res.json({ 
            ...product, 
            id: product.id.toString(), 
            price: product.price.toNumber(),
            imageUrl: product.image_url,
            unitLabel: product.unit_label
        });
    } catch (error) {
        console.error("Update Product Error:", error);
        res.status(500).json({ message: "Error updating product" });
    }
};

export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.products.delete({ where: { id: BigInt(id as string) } });
        res.json({ message: "Product deleted" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting product" });
    }
};

export const getLowStockProducts = async (req: Request, res: Response) => {
    try {
        const threshold = 10;
        const products = await prisma.products.findMany({
            where: { stock: { lte: threshold }, active: true },
            take: 5,
            include: { categories: true }
        });
        const productsMapped = products.map((p: any) => ({
            ...p,
            id: p.id.toString(),
            category_id: p.category_id?.toString(),
            price: p.price.toNumber(),
            imageUrl: p.image_url,
            unitLabel: p.unit_label,
            categoryName: p.categories?.name,
            category: p.categories ? { ...p.categories, id: p.categories.id.toString() } : null
        }));
        
        // Mock PageResponse structure for frontend compatibility
        res.json({
            content: productsMapped,
            totalElements: products.length,
            totalPages: 1,
            size: 5,
            number: 0
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching low stock" });
    }
}
