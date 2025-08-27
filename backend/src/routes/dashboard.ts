import express from "express";
import { PrismaClient } from "@prisma/client";
import { sessionRequired } from "../middleware/session";

const router = express.Router();
const prisma = new PrismaClient();

// GET /dashboard/stats
router.get("/stats", sessionRequired, async (req, res) => {
  try {
    // Get total products count
    const totalProducts = await prisma.product.count({
      where: { branchId: req.user?.branchId || 1 }
    });

    // Get low stock items count
    const lowStockItems = await prisma.product.count({
      where: {
        branchId: req.user?.branchId || 1,
        stockQuantity: {
          lte: prisma.product.fields.minStockLevel
        }
      }
    });

    // Calculate total inventory value and total quantity
    const products = await prisma.product.findMany({
      where: { branchId: req.user?.branchId || 1 },
      select: {
        stockQuantity: true,
        sellPrice: true
      }
    });

    const totalValue = products.reduce((sum, product) => {
      return sum + (product.stockQuantity * product.sellPrice);
    }, 0);

    // Calculate total quantity of all products
    const totalQuantity = products.reduce((sum, product) => {
      return sum + product.stockQuantity;
    }, 0);

    // Get active users count
    const activeUsers = await prisma.user.count({
      where: { branchId: req.user?.branchId || 1 }
    });

    // Get recent transactions count (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentTransactions = await prisma.stockTransaction.count({
      where: {
        branchId: req.user?.branchId || 1,
        createdAt: {
          gte: thirtyDaysAgo
        }
      }
    });

    // Calculate monthly growth (simplified - compare with previous month)
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const previousMonthTransactions = await prisma.stockTransaction.count({
      where: {
        branchId: req.user?.branchId || 1,
        createdAt: {
          gte: sixtyDaysAgo,
          lt: thirtyDaysAgo
        }
      }
    });

    const monthlyGrowth = previousMonthTransactions > 0 
      ? ((recentTransactions - previousMonthTransactions) / previousMonthTransactions) * 100
      : 0;

    // Get top category
    const topCategory = await prisma.product.groupBy({
      by: ['categoryId'],
      where: { branchId: req.user?.branchId || 1 },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 1
    });

            const topCategoryName = topCategory.length > 0 
      ? await prisma.category.findUnique({
          where: { id: topCategory[0]?.categoryId || 0 },
          select: { name: true }
        })
      : null;

    // System health check
    const systemHealth = "Excellent"; // In a real app, you'd check various system metrics

    const stats = {
      totalProducts,
      totalQuantity,
      lowStockItems,
      totalValue: Math.round(totalValue * 100) / 100, // Round to 2 decimal places
      activeUsers,
      recentTransactions,
      monthlyGrowth: Math.round(monthlyGrowth * 100) / 100, // Round to 2 decimal places
      topCategory: topCategoryName?.name || "ไม่มีข้อมูล",
      systemHealth
    };

    res.json(stats);
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ message: "Failed to fetch dashboard stats" });
  }
});

// GET /dashboard/recent-activities
router.get("/recent-activities", sessionRequired, async (req, res) => {
  try {
    const activities = [];

    // Get recent stock transactions
    const recentTransactions = await prisma.stockTransaction.findMany({
      where: {
        branchId: req.user?.branchId || 1
      },
      include: {
        jobOrder: {
          select: {
            customerName: true,
            carType: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 15 // Increased to get more data for better sorting
    });

    for (const transaction of recentTransactions) {
      const timeAgo = getTimeAgo(transaction.createdAt);
      
      if (transaction.type === 'SALE') {
        activities.push({
          id: transaction.id,
          action: "เบิกสินค้า",
          product: `สินค้า ID: ${transaction.productId}`,
          qty: Math.abs(transaction.qtyChange),
          time: timeAgo,
          timestamp: transaction.createdAt, // Add actual timestamp for sorting
          type: 'stock-out'
        });
      } else if (transaction.type === 'PURCHASE') {
        activities.push({
          id: transaction.id,
          action: "รับสินค้า",
          product: `สินค้า ID: ${transaction.productId}`,
          qty: transaction.qtyChange,
          time: timeAgo,
          timestamp: transaction.createdAt, // Add actual timestamp for sorting
          type: 'stock-in'
        });
      }
    }

    // Get recent job orders
    const recentJobOrders = await prisma.jobOrder.findMany({
      where: {
        branchId: req.user?.branchId || 1
      },
      orderBy: { createdAt: 'desc' },
      take: 10 // Increased to get more data for better sorting
    });

    for (const jobOrder of recentJobOrders) {
      const timeAgo = getTimeAgo(jobOrder.createdAt);
      activities.push({
        id: jobOrder.id,
        action: "งานใหม่",
        customer: jobOrder.customerName,
        car: jobOrder.carType,
        time: timeAgo,
        timestamp: jobOrder.createdAt, // Add actual timestamp for sorting
        type: 'job-order'
      });
    }

    // Sort by actual timestamp (newest first) and take top 10
    activities.sort((a, b) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    // Remove timestamp from response (keep only for sorting)
    const cleanActivities = activities.slice(0, 10).map(({ timestamp, ...activity }) => activity);

    res.json(cleanActivities);
  } catch (error) {
    console.error("Error fetching recent activities:", error);
    res.status(500).json({ message: "Failed to fetch recent activities" });
  }
});

// GET /dashboard/top-products
router.get("/top-products", sessionRequired, async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        branchId: req.user?.branchId || 1,
        stockQuantity: { gt: 0 }
      },
      select: {
        id: true,
        sku: true,
        name: true,
        stockQuantity: true,
        sellPrice: true
      },
      orderBy: { stockQuantity: 'desc' },
      take: 10
    });

    const topProducts = products.map(product => ({
      ...product,
      totalValue: product.stockQuantity * product.sellPrice
    }));

    res.json(topProducts);
  } catch (error) {
    console.error("Error fetching top products:", error);
    res.status(500).json({ message: "Failed to fetch top products" });
  }
});

// Helper function to calculate time ago
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) return 'just now';
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString('th-TH');
}

export default router;
