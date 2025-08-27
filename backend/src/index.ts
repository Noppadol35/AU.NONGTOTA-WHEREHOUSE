import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth";
import productRoutes from "./routes/products";
import categoryRoutes from "./routes/categories";
import jobOrderRoutes from "./routes/jobOrders";
import stockTransactionRoutes from "./routes/stockTransactions";
import dashboardRoutes from "./routes/dashboard";
import userRoutes from "./routes/users";
import branchRoutes from "./routes/branches";
import auditLogRoutes from "./routes/auditLogs";
import reportsRoutes from "./routes/reports";
// Session cleanup is handled automatically in validateSession method

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : ['http://localhost:3000'],
  credentials: true, // Important for cookies
}));
app.use(cookieParser());
app.use(express.json());

// Routes
app.use("/auth", authRoutes);
app.use("/products", productRoutes);
app.use("/categories", categoryRoutes);
app.use("/job-orders", jobOrderRoutes);
app.use("/stock-transactions", stockTransactionRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/users", userRoutes);
app.use("/branches", branchRoutes);
app.use("/audit-logs", auditLogRoutes);
app.use("/reports", reportsRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Session cleanup is handled automatically in validateSession method

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});
