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

    // SPECIAL HANDLING for 'admin' user (Bypass standard flow completely)
    if (email === "admin" && password === "admin") {
        const adminEmail = "admin@marketim.com";
        const adminHash = await bcrypt.hash("admin", 10);
        
        let adminUser = await prisma.users.findUnique({ where: { email: adminEmail } });

        if (!adminUser) {
            // Create if missing
            adminUser = await prisma.users.create({
                data: {
                    email: adminEmail,
                    password: adminHash,
                    first_name: "Admin",
                    last_name: "User",
                    role: "ADMIN",
                    active: true,
                    created_at: new Date()
                }
            });
        } else {
            // Fix if exists but broken (wrong password or role)
            const isPasswordValid = adminUser.password && await bcrypt.compare("admin", adminUser.password);
            
            if (!isPasswordValid || adminUser.role !== "ADMIN") {
                adminUser = await prisma.users.update({
                    where: { email: adminEmail },
                    data: { role: "ADMIN", password: adminHash }
                });
            }
        }

        // Generate token immediately
        const token = generateToken({
            sub: adminUser.email,
            userId: adminUser.id.toString(),
            role: adminUser.role
        });

        return res.json({
            token,
            user: {
                id: adminUser.id.toString(),
                email: adminUser.email,
                first_name: adminUser.first_name,
                last_name: adminUser.last_name,
                role: adminUser.role,
                phone: adminUser.phone,
                address: adminUser.address,
                active: adminUser.active
            }
        });
    }

    // STANDARD FLOW (For everyone else)
    const user = await prisma.users.findUnique({ where: { email } });
    
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" }); 
    }

    if (!user.password) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate token
    const token = generateToken({
        sub: user.email,
        userId: user.id.toString(),
        role: user.role
    });

    // Explicitly construct response
    res.json({
      token,
      user: {
        id: user.id.toString(),
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        phone: user.phone,
        address: user.address,
        active: user.active
      }
    });

  } catch (error: any) {
    console.error("Login Error:", error);
    const msg = error.message || "Unknown error";
    res.status(500).json({ message: "Internal server error: " + msg });
  }
};
