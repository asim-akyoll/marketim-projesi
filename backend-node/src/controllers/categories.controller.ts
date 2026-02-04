import { Request, Response } from "express";
import prisma from "../config/prisma";

export const getCategories = async (req: Request, res: Response) => {
    try {
        const categories = await prisma.categories.findMany({
            where: { active: true },
            orderBy: { id: 'asc' } // Or reorder logic if implemented
        });
        res.json(categories.map(c => ({
            ...c,
            id: c.id.toString()
        })));
    } catch (error) {
        res.status(500).json({ message: "Error fetching categories" });
    }
};

export const getAdminCategories = async (req: Request, res: Response) => {
    try {
        const categories = await prisma.categories.findMany({
            orderBy: { id: 'asc' }
        });
        res.json(categories.map(c => ({
            ...c,
            id: c.id.toString()
        })));
    } catch (error) {
        res.status(500).json({ message: "Error fetching categories" });
    }
};

export const createCategory = async (req: Request, res: Response) => {
    try {
        const { name, description } = req.body;
        // Simple slug generation
        const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

        const category = await prisma.categories.create({
            data: {
                name,
                description,
                slug,
                active: true
            }
        });
        res.status(201).json({ ...category, id: category.id.toString() });
    } catch (error) {
        res.status(500).json({ message: "Error creating category" });
    }
};

export const updateCategory = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, description, active } = req.body;
        const category = await prisma.categories.update({
            where: { id: BigInt(id) },
            data: {
                name,
                description,
                active
            }
        });
        res.json({ ...category, id: category.id.toString() });
    } catch (error) {
        res.status(500).json({ message: "Error updating category" });
    }
};

export const deleteCategory = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.categories.delete({ where: { id: BigInt(id) } });
        res.json({ message: "Category deleted" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting category" });
    }
};
