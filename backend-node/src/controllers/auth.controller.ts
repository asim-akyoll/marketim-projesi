import { Request, Response } from "express";
import bcrypt from "bcrypt";
import prisma from "../config/prisma";
import { generateToken } from "../utils/jwt";

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, phone, address } = req.body;

    // Check if user exists
    const existingUser = await prisma.users.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with default role 'CUSTOMER'
    const user = await prisma.users.create({
      data: {
        email,
        password: hashedPassword,
        first_name: firstName,
        last_name: lastName,
        phone,
        address,
        role: "CUSTOMER",
        active: true,
        created_at: new Date()
      }
    });

    // Generate Token
    const token = generateToken({
        sub: user.email,
        userId: user.id.toString(),
        role: user.role
    });

    res.status(201).json({
      token,
      user: {
        ...user,
        id: user.id.toString() // Explicitly convert BigInt
      }
    });

  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" }); // Security: Don't reveal user missing
    }

    // Check password
    if (!user.password) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // AUTO-FIX: If user is "admin", ensure they have ADMIN role
    if (email === "admin" && user.role !== "ADMIN") {
        await prisma.users.update({
            where: { id: user.id },
            data: { role: "ADMIN" }
        });
        user.role = "ADMIN"; // Update local object for token generation
    }

    // Generate token
    const token = generateToken({
        sub: user.email,
        userId: user.id.toString(),
        role: user.role
    });

    res.json({
      token,
      user: {
        ...user,
        id: user.id.toString()
      }
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
