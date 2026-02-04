import { Router } from "express";
import { authenticate, requireAdmin } from "../middleware/auth.middleware";
import { 
    getAdminProducts, createProduct, updateProduct, deleteProduct, getLowStockProducts 
} from "../controllers/products.controller";
import { 
    getAdminCategories, createCategory, updateCategory, deleteCategory, toggleCategoryActive
} from "../controllers/categories.controller";
import { 
    getAllOrders, updateOrderStatus 
} from "../controllers/orders.controller";
import { updateSettings, getSettings } from "../controllers/settings.controller";
import { getDashboardStats } from "../controllers/dashboard.controller";
import { getCustomers } from "../controllers/user.controller";

const router = Router();

// Protect all admin routes
router.use(authenticate, requireAdmin);

// Dashboard
router.get("/dashboard", getDashboardStats);

// Products
router.get("/products", getAdminProducts);
router.post("/products", createProduct);
router.put("/products/:id", updateProduct);
router.delete("/products/:id", deleteProduct);
router.get("/products/low-stock", getLowStockProducts);

// Categories
router.get("/categories", getAdminCategories);
router.post("/categories", createCategory);
router.put("/categories/:id", updateCategory);
router.delete("/categories/:id", deleteCategory);
router.patch("/categories/:id/toggle-active", toggleCategoryActive);

// Orders
router.get("/orders", getAllOrders);
router.put("/orders/:id/status", updateOrderStatus);

// Settings
router.get("/settings", getSettings); // Admin sees same settings
router.put("/settings", updateSettings);
router.patch("/settings", updateSettings); // Alias for frontend usage

// Customers
router.get("/customers", getCustomers);

export default router;
