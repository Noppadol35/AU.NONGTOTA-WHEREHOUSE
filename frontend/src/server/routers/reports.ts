import { z } from 'zod';
import { router, roleProcedure } from '../trpc';
import { CustomerService } from '@/lib/customerService';
import { TRPCError } from '@trpc/server';

const ownerProcedure = roleProcedure(["OWNER"]);

export const reportsRouter = router({
  lowStock: ownerProcedure.query(async ({ ctx }) => {
    const products = await ctx.prisma.product.findMany({
      where: {
        isDeleted: false,
        stockQuantity: { lte: 10 },
      },
      include: { category: true, branch: true },
      orderBy: { stockQuantity: "asc" },
    });

    const criticalProducts = products.filter(p => p.stockQuantity <= (p.minStockLevel || 10) * 0.3);
    const warningProducts = products.filter(
      p => p.stockQuantity > (p.minStockLevel || 10) * 0.3 && p.stockQuantity <= (p.minStockLevel || 10) * 0.5
    );

    const result = products.map(product => ({
      id: product.id,
      name: product.name,
      sku: product.sku,
      stockQuantity: product.stockQuantity,
      minStockLevel: product.minStockLevel || 10,
      category: product.category?.name || "ไม่ระบุ",
      branch: product.branch?.name || "ไม่ระบุ",
      lastUpdated: product.createdAt.toISOString().split("T")[0],
    }));

    return {
      products: result,
      summary: {
        total: products.length,
        critical: criticalProducts.length,
        warning: warningProducts.length,
      },
    };
  }),

  inventoryValue: ownerProcedure.query(async ({ ctx }) => {
    const products = await ctx.prisma.product.findMany({
      where: { isDeleted: false },
      include: { category: true, branch: true },
      orderBy: { stockQuantity: "desc" },
    });

    const result = products.map(product => ({
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

    return {
      items: result,
      summary: {
        totalValue,
        totalItems,
        totalProducts: result.length,
        averageValue,
      },
    };
  }),

  topMoving: ownerProcedure
    .input(z.object({ timeRange: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      let dateFilter: Date;
      const now = new Date();
      switch (input.timeRange) {
        case "week": dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); break;
        case "quarter": dateFilter = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000); break;
        default: dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      const stockTransactions = await ctx.prisma.stockTransaction.findMany({
        where: { type: "SALE", createdAt: { gte: dateFilter } },
        include: { product: { include: { category: true } } },
      });

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
        if (tx.createdAt > stats.lastSold) stats.lastSold = tx.createdAt;
      });

      const result = Array.from(productStats.values())
        .map((item) => ({
          ...item,
          avgPrice: item.totalSold > 0 ? item.revenue / item.totalSold : 0,
          lastSold: item.lastSold.toISOString().split("T")[0],
          trend: "up",
        }))
        .sort((a, b) => b.totalSold - a.totalSold)
        .slice(0, 20);

      const totalRevenue = result.reduce((sum, item) => sum + item.revenue, 0);
      const totalSold = result.reduce((sum, item) => sum + item.totalSold, 0);
      const avgRevenue = result.length > 0 ? totalRevenue / result.length : 0;

      return {
        items: result,
        summary: {
          totalRevenue,
          totalSold,
          totalProducts: result.length,
          averageRevenue: avgRevenue,
        },
      };
    }),

  customerHistory: ownerProcedure
    .input(z.object({ filter: z.string().optional() }))
    .query(async ({ input }) => {
      const allCustomers = await CustomerService.getAllCustomersWithStats();
      let filteredResult = allCustomers;
      if (input.filter === "active") filteredResult = allCustomers.filter(c => c.status === "active");
      else if (input.filter === "vip") filteredResult = allCustomers.filter(c => c.status === "vip");

      return {
        customers: filteredResult,
        summary: {
          totalCustomers: allCustomers.length,
          activeCustomers: allCustomers.filter(c => c.status === "active").length,
          vipCustomers: allCustomers.filter(c => c.status === "vip").length,
          totalRevenue: allCustomers.reduce((sum, c) => sum + c.totalSpent, 0),
        },
      };
    }),

  summary: ownerProcedure.query(async ({ ctx }) => {
    const lowStockCount = await ctx.prisma.product.count({
      where: { isDeleted: false, stockQuantity: { lte: 10 } },
    });

    const products = await ctx.prisma.product.findMany({
      where: { isDeleted: false },
      select: { costPrice: true, stockQuantity: true },
    });
    const totalInventoryValue = products.reduce((sum, p) => sum + (p.costPrice || 0) * p.stockQuantity, 0);

    const customerCount = await ctx.prisma.customer.count();

    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const topMovingCount = await ctx.prisma.stockTransaction.count({
      where: { type: "SALE", createdAt: { gte: monthAgo } },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayRevenue = await ctx.prisma.bill.aggregate({
      where: { status: "PAID", paidAt: { gte: today, lt: tomorrow } },
      _sum: { grandTotal: true },
    });

    const todayJobs = await ctx.prisma.jobOrder.count({
      where: { status: "COMPLETED", createdAt: { gte: today, lt: tomorrow } },
    });

    const todayNewCustomers = await ctx.prisma.customer.count({
      where: { createdAt: { gte: today, lt: tomorrow } },
    });

    const todayProductsSold = await ctx.prisma.stockTransaction.aggregate({
      where: { type: "SALE", createdAt: { gte: today, lt: tomorrow } },
      _sum: { qtyChange: true },
    });

    return {
      lowStockCount,
      totalInventoryValue,
      customerCount,
      topMovingCount,
      todayRevenue: Math.abs(todayRevenue._sum.grandTotal || 0),
      todayJobs,
      todayNewCustomers,
      todayProductsSold: Math.abs(todayProductsSold._sum.qtyChange || 0),
    };
  }),

  customerJobs: ownerProcedure
    .input(z.object({ customerId: z.number() }))
    .query(async ({ ctx, input }) => {
      const jobOrders = await ctx.prisma.jobOrder.findMany({
        where: { customerId: input.customerId },
        include: { 
          items: { include: { product: { select: { name: true, sellPrice: true } } } },
          bills: true
        },
        orderBy: { createdAt: 'desc' },
      });

      return jobOrders.map((job) => {
        const totalAmount = job.items.reduce((sum, item) => sum + (item.unitPrice * item.qty), 0);
        const bill = job.bills?.[0]; // Assuming 1 bill per job order
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
          subtotal: bill?.subtotal || 0,
          laborCost: bill?.laborCost || 0,
          vatAmount: bill?.vatAmount || 0,
          grandTotal: bill?.grandTotal || totalAmount,
        };
      });
    }),
});
