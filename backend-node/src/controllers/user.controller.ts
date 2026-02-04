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
        const { fullName, phone, address } = req.body;
        const email = req.user?.sub;

        if (!email) {
            return res.status(401).json({ message: "Not authenticated" });
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
                ...(address && { address })
            }
        });

        res.json({
            fullName: `${updatedUser.first_name} ${updatedUser.last_name}`,
            phone: updatedUser.phone,
            address: updatedUser.address
        });
    } catch (error) {
         console.error("UpdateMe Error:", error);
         res.status(500).json({ message: "Internal server error" });
    }
};
