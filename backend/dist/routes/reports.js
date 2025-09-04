"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prisma_1 = require("../lib/prisma");
const session_1 = require("../lib/session");
const customerService_1 = require("../services/customerService");
const session_2 = require("../middleware/session");
const router = express_1.default.Router();
// Session middleware for reports
const sessionRequired = async (req, res, next) => {
    try {
        const sessionId = req.cookies?.sid;
        if (!sessionId) {
            return res.status(401).json({ message: "No session found" });
        }
        const session = await session_1.SessionManager.validateSession(sessionId);
        if (!session) {
            res.clearCookie('sid');
            return res.status(401).json({ message: "Invalid or expired session" });
        }
        // Type assertion for user object
        req.user = {
            id: session.user.id,
            username: session.user.username,
            role: session.user.role,
            fullName: session.user.fullName,
            branchId: session.user.branchId
        };
        next();
    }
    catch (error) {
        console.error("Session validation error:", error);
        res.status(401).json({ message: "Session validation failed" });
    }
};
// GET /reports/low-stock - สินค้าใกล้หมด
router.get("/low-stock", sessionRequired, (0, session_2.requireRole)(["OWNER"]), async (req, res) => {
    try {
        const products = await prisma_1.prisma.product.findMany({
            where: {
                isDeleted: false,
                stockQuantity: {
                    lte: 10, // สินค้าที่มี stock น้อยกว่าหรือเท่ากับ 10
                },
            },
            include: {
                category: true,
                branch: true,
            },
            orderBy: {
                stockQuantity: "asc",
            },
        });
        // แยกเป็น critical (≤ 30% ของ minStockLevel) และ warning (≤ 50% ของ minStockLevel)
        const criticalProducts = products.filter((p) => p.stockQuantity <= (p.minStockLevel || 10) * 0.3);
        const warningProducts = products.filter((p) => p.stockQuantity > (p.minStockLevel || 10) * 0.3 &&
            p.stockQuantity <= (p.minStockLevel || 10) * 0.5);
        const result = products.map((product) => ({
            id: product.id,
            name: product.name,
            sku: product.sku,
            stockQuantity: product.stockQuantity,
            minStockLevel: product.minStockLevel || 10,
            category: product.category?.name || "ไม่ระบุ",
            branch: product.branch?.name || "ไม่ระบุ",
            lastUpdated: product.createdAt.toISOString().split("T")[0],
        }));
        res.json({
            products: result,
            summary: {
                total: products.length,
                critical: criticalProducts.length,
                warning: warningProducts.length,
            },
        });
    }
    catch (error) {
        console.error("Error fetching low stock report:", error);
        res
            .status(500)
            .json({
            message: "Failed to fetch low stock report",
            error: error.message,
        });
    }
});
// GET /reports/inventory-value - มูลค่าสินค้าคงเหลือ
router.get("/inventory-value", sessionRequired, (0, session_2.requireRole)(["OWNER"]), async (req, res) => {
    try {
        const products = await prisma_1.prisma.product.findMany({
            where: {
                isDeleted: false,
            },
            include: {
                category: true,
                branch: true,
            },
            orderBy: {
                stockQuantity: "desc",
            },
        });
        const result = products.map((product) => ({
            id: product.id,
            name: product.name,
            sku: product.sku,
            stockQuantity: product.stockQuantity,
            unitCost: product.costPrice || 0,
            totalValue: (product.costPrice || 0) * product.stockQuantity,
            category: product.category?.name || "ไม่ระบุ",
            branch: product.branch?.name || "ไม่ระบุ",
            lastUpdated: product.createdAt.toISOString().split("T")[0],
        }));
        const totalValue = result.reduce((sum, item) => sum + item.totalValue, 0);
        const totalItems = result.reduce((sum, item) => sum + item.stockQuantity, 0);
        const averageValue = result.length > 0 ? totalValue / result.length : 0;
        res.json({
            items: result,
            summary: {
                totalValue,
                totalItems,
                totalProducts: result.length,
                averageValue,
            },
        });
    }
    catch (error) {
        console.error("Error fetching inventory value report:", error);
        res
            .status(500)
            .json({
            message: "Failed to fetch inventory value report",
            error: error.message,
        });
    }
});
// GET /reports/top-moving - สินค้าขายดี
router.get("/top-moving", sessionRequired, (0, session_2.requireRole)(["OWNER"]), async (req, res) => {
    try {
        const { timeRange = "month" } = req.query;
        let dateFilter;
        const now = new Date();
        switch (timeRange) {
            case "week":
                dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case "quarter":
                dateFilter = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                break;
            default: // month
                dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        }
        // ดึงข้อมูลจาก StockTransaction ที่เป็น SALE
        const stockTransactions = await prisma_1.prisma.stockTransaction.findMany({
            where: {
                type: "SALE",
                createdAt: {
                    gte: dateFilter,
                },
            },
            include: {
                product: {
                    include: {
                        category: true,
                    },
                },
            },
        });
        // รวมข้อมูลตาม product
        const productStats = new Map();
        stockTransactions.forEach((tx) => {
            const productId = tx.productId;
            if (!productStats.has(productId)) {
                productStats.set(productId, {
                    productId,
                    name: tx.product.name,
                    sku: tx.product.sku,
                    category: tx.product.category?.name || "ไม่ระบุ",
                    totalSold: 0,
                    revenue: 0,
                    transactions: 0,
                    lastSold: tx.createdAt,
                });
            }
            const stats = productStats.get(productId);
            const qty = Math.abs(tx.qtyChange);
            stats.totalSold += qty;
            stats.revenue += qty * (tx.product.sellPrice || 0);
            stats.transactions += 1;
            if (tx.createdAt > stats.lastSold) {
                stats.lastSold = tx.createdAt;
            }
        });
        const result = Array.from(productStats.values())
            .map((item) => ({
            ...item,
            avgPrice: item.totalSold > 0 ? item.revenue / item.totalSold : 0,
            lastSold: item.lastSold.toISOString().split("T")[0],
            trend: "up", // ในอนาคตจะคำนวณจากข้อมูลเปรียบเทียบ
        }))
            .sort((a, b) => b.totalSold - a.totalSold)
            .slice(0, 20); // Top 20
        const totalRevenue = result.reduce((sum, item) => sum + item.revenue, 0);
        const totalSold = result.reduce((sum, item) => sum + item.totalSold, 0);
        const avgRevenue = result.length > 0 ? totalRevenue / result.length : 0;
        res.json({
            items: result,
            summary: {
                totalRevenue,
                totalSold,
                totalProducts: result.length,
                averageRevenue: avgRevenue,
            },
        });
    }
    catch (error) {
        console.error("Error fetching top moving items report:", error);
        res
            .status(500)
            .json({
            message: "Failed to fetch top moving items report",
            error: error.message,
        });
    }
});
// GET /reports/customer-history - ประวัติลูกค้า
router.get("/customer-history", sessionRequired, (0, session_2.requireRole)(["OWNER"]), async (req, res) => {
    try {
        const { filter = "all" } = req.query;
        // ใช้ CustomerService เพื่อดึงข้อมูลลูกค้าพร้อมสถิติ
        const allCustomers = await customerService_1.CustomerService.getAllCustomersWithStats();
        // Filter ตาม status
        let filteredResult = allCustomers;
        if (filter === "active") {
            filteredResult = allCustomers.filter((c) => c.status === "active");
        }
        else if (filter === "vip") {
            filteredResult = allCustomers.filter((c) => c.status === "vip");
        }
        const totalCustomers = allCustomers.length;
        const activeCustomers = allCustomers.filter((c) => c.status === "active").length;
        const vipCustomers = allCustomers.filter((c) => c.status === "vip").length;
        const totalRevenue = allCustomers.reduce((sum, c) => sum + c.totalSpent, 0);
        res.json({
            customers: filteredResult,
            summary: {
                totalCustomers,
                activeCustomers,
                vipCustomers,
                totalRevenue,
            },
        });
    }
    catch (error) {
        console.error("Error fetching customer history report:", error);
        res
            .status(500)
            .json({
            message: "Failed to fetch customer history report",
            error: error.message,
        });
    }
});
// GET /reports/summary - สรุปข้อมูลทั้งหมด
router.get("/summary", sessionRequired, (0, session_2.requireRole)(["OWNER"]), async (req, res) => {
    try {
        // Low stock count
        const lowStockCount = await prisma_1.prisma.product.count({
            where: {
                isDeleted: false,
                stockQuantity: {
                    lte: 10,
                },
            },
        });
        // Inventory value
        const products = await prisma_1.prisma.product.findMany({
            where: { isDeleted: false },
            select: { costPrice: true, stockQuantity: true },
        });
        const totalInventoryValue = products.reduce((sum, p) => sum + (p.costPrice || 0) * p.stockQuantity, 0);
        // Customer count
        const customerCount = await prisma_1.prisma.customer.count();
        // Top moving items count (สินค้าที่ขายได้ในเดือนนี้)
        const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const topMovingCount = await prisma_1.prisma.stockTransaction.count({
            where: {
                type: "SALE",
                createdAt: { gte: monthAgo },
            },
        });
        // คำนวณข้อมูลของวันนี้
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        // รายได้วันนี้ (จาก Bill ที่เสร็จสิ้นวันนี้)
        const todayRevenue = await prisma_1.prisma.bill.aggregate({
            where: {
                status: "PAID",
                paidAt: {
                    gte: today,
                    lt: tomorrow,
                },
            },
            _sum: {
                grandTotal: true,
            },
        });
        // จำนวนงานที่เสร็จสิ้นวันนี้
        const todayJobs = await prisma_1.prisma.jobOrder.count({
            where: {
                status: "COMPLETED",
                createdAt: {
                    gte: today,
                    lt: tomorrow,
                },
            },
        });
        // จำนวนลูกค้าใหม่วันนี้
        const todayNewCustomers = await prisma_1.prisma.customer.count({
            where: {
                createdAt: {
                    gte: today,
                    lt: tomorrow,
                },
            },
        });
        // จำนวนสินค้าที่ขายวันนี้
        const todayProductsSold = await prisma_1.prisma.stockTransaction.aggregate({
            where: {
                type: "SALE",
                createdAt: {
                    gte: today,
                    lt: tomorrow,
                },
            },
            _sum: {
                qtyChange: true,
            },
        });
        res.json({
            lowStockCount,
            totalInventoryValue,
            customerCount,
            topMovingCount,
            todayRevenue: Math.abs(todayRevenue._sum.grandTotal || 0),
            todayJobs,
            todayNewCustomers,
            todayProductsSold: Math.abs(todayProductsSold._sum.qtyChange || 0),
        });
    }
    catch (error) {
        console.error("Error fetching reports summary:", error);
        res
            .status(500)
            .json({
            message: "Failed to fetch reports summary",
            error: error.message,
        });
    }
});
// POST /reports/fix-customers - แก้ไขข้อมูลลูกค้าจาก JobOrder
router.post("/fix-customers", sessionRequired, (0, session_2.requireRole)(["OWNER"]), async (req, res) => {
    try {
        const result = await customerService_1.CustomerService.fixJobOrderCustomers();
        res.json({
            message: "แก้ไขข้อมูลลูกค้าเรียบร้อยแล้ว",
            ...result,
        });
    }
    catch (error) {
        console.error("Error fixing customers:", error);
        res.status(500).json({
            message: "เกิดข้อผิดพลาดในการแก้ไขข้อมูลลูกค้า",
            error: error.message,
        });
    }
});
// GET /reports/customer-jobs/:customerId - ดึงรายละเอียดงานของลูกค้า
router.get("/customer-jobs/:customerId", sessionRequired, (0, session_2.requireRole)(["OWNER"]), async (req, res) => {
    try {
        const customerId = parseInt(req.params.customerId || '0');
        if (isNaN(customerId)) {
            return res.status(400).json({ message: "Invalid customer ID" });
        }
        const jobOrders = await prisma_1.prisma.jobOrder.findMany({
            where: { customerId },
            include: {
                items: {
                    include: {
                        product: {
                            select: {
                                name: true,
                                sellPrice: true,
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        const jobDetails = jobOrders.map((job) => {
            const totalAmount = job.items.reduce((sum, item) => {
                return sum + (item.unitPrice * item.qty);
            }, 0);
            return {
                id: job.id,
                jobNumber: job.jobNumber,
                date: job.createdAt.toISOString().split('T')[0],
                serviceType: job.jobDetail || 'บริการทั่วไป',
                totalAmount,
                status: job.status,
                items: job.items.map(item => ({
                    productName: item.product?.name || 'สินค้าไม่ระบุ',
                    qty: item.qty,
                    unitPrice: item.unitPrice,
                    totalPrice: item.unitPrice * item.qty,
                })),
                notes: job.issueDetail || '',
            };
        });
        res.json(jobDetails);
    }
    catch (error) {
        console.error("Error fetching customer jobs:", error);
        res.status(500).json({
            message: "เกิดข้อผิดพลาดในการดึงข้อมูลงานของลูกค้า",
            error: error.message,
        });
    }
});
exports.default = router;
//# sourceMappingURL=reports.js.map