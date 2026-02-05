import { Router } from "express";
import { authenticate, requireAdmin } from "../middleware/auth.middleware";
import { 
    getAdminProducts, createProduct, updateProduct, deleteProduct, getLowStockProducts 
} from "../controllers/products.controller";
import { 
    getAdminCategories, createCategory, updateCategory, deleteCategory, toggleCategoryActive
} from "../controllers/categories.controller";
import { 
    getAllOrders, getOrder, updateOrderStatus 
} from "../controllers/orders.controller";
import { updateSettings, getSettings } from "../controllers/settings.controller";
import { getDashboardStats } from "../controllers/dashboard.controller";
import { getCustomers, getCustomerOrders } from "../controllers/user.controller";
import { getStockMovements } from "../controllers/stock.controller";
import { generateReport } from "../controllers/reports.controller";

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
router.get("/orders/:id", getOrder);
router.put("/orders/:id/status", updateOrderStatus);
router.patch("/orders/:id/status", updateOrderStatus); // Frontend uses PATCH

// Settings
router.get("/settings", getSettings); // Admin sees same settings
router.put("/settings", updateSettings);
router.patch("/settings", updateSettings); // Alias for frontend usage
router.post("/system/cache/clear", (req, res) => res.json({ message: "Cache cleared" })); // Dummy Legacy Parity

// Customers
router.get("/customers", getCustomers);
router.get("/customers/:userId/orders", getCustomerOrders);

// Stock
router.get("/stock-movements", getStockMovements);

// Reports
router.get("/reports", generateReport);

export default router;
