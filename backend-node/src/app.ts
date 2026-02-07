import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";

dotenv.config();

// BigInt serialization patch for JSON.stringify
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

import { Prisma } from "@prisma/client";

// Decimal serialization
const decimal = Prisma.Decimal as any;
if (decimal && decimal.prototype) {
  decimal.prototype.toJSON = function () {
    return this.toNumber();
  };
}

const app = express();

// Middleware
app.use(helmet());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// CORS Configuration
const allowedOrigins = [
  "https://marketim-projesi.vercel.app",
  "https://secmer.com.tr",
  "https://www.secmer.com.tr",
  "https://marketim-projesi-production.up.railway.app", // Legacy
  "http://localhost:5173",
  "http://localhost:3000"
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin matches allowed list or subdomains
    if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith(".vercel.app") || origin.endsWith(".onrender.com")) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"]
}));

// Placeholder Route
app.get("/", (req, res) => {
  res.send("Marketim Backend (Node.js) is Running! 🚀");
});

// Routes
import authRoutes from "./routes/auth.routes";
import productRoutes from "./routes/products.routes";
import categoryRoutes from "./routes/categories.routes";
import orderRoutes from "./routes/orders.routes";
import settingsRoutes from "./routes/settings.routes";
import uploadRoutes from "./routes/upload.routes";
import adminRoutes from "./routes/admin.routes";
import userRoutes from "./routes/user.routes";


app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);


export default app;