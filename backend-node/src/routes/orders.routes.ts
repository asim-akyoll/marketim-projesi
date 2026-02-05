import { Router } from "express";
import { createOrder, getOrders, getOrder } from "../controllers/orders.controller";
import { optionalAuth, authenticate } from "../middleware/auth.middleware";

const router = Router();

// Guest or User can create order
router.post("/", optionalAuth, createOrder);

// Only authenticated users can list their orders
router.get("/my", authenticate, getOrders);
router.get("/", authenticate, getOrders);
router.get("/:id", authenticate, getOrder);

export default router;
