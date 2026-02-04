import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";

// Extend Express Request
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authentication required" });
  }

  const token = authHeader.split(" ")[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }

  req.user = decoded as any;
  next();
};

export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
  
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next();
    }
  
    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
  
    if (decoded) {
        req.user = decoded;
    }
    // If token is invalid, we proceed as guest (or should we error? Standard is: if token provided, it must be valid. But for now, let's just ignore invalid token for guest fallback? No, security risk. Better to enforce validity if present.) 
    // Actually, if a user has an expired token, they might want to be guest? 
    // Let's safe side: if token invalid, treat as guest.
    
    next();
  };

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || req.user.role !== "ADMIN") {
        return res.status(403).json({ message: "Admin access required" });
    }
    next();
};
