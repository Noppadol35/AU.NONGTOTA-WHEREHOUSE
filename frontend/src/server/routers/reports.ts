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

  // ── Chart Data Endpoints ─────────────────────────────────────────────────

  dailyTrend: ownerProcedure
    .input(z.object({ days: z.number().min(1).max(90).default(7) }))
    .query(async ({ ctx, input }) => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - input.days);
      startDate.setHours(0, 0, 0, 0);

      // Get job orders grouped by day
      const jobOrders = await ctx.prisma.jobOrder.findMany({
        where: { createdAt: { gte: startDate } },
        select: { createdAt: true },
      });

      // Get paid bills grouped by day
      const bills = await ctx.prisma.bill.findMany({
        where: { status: "PAID", paidAt: { gte: startDate } },
        select: { paidAt: true, grandTotal: true },
      });

      // Build a map of date -> { jobCount, revenue }
      const dayMap = new Map<string, { jobCount: number; revenue: number }>();

      // Pre-fill all days in the range
      for (let i = 0; i < input.days; i++) {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);
        const key = d.toISOString().split("T")[0];
        dayMap.set(key, { jobCount: 0, revenue: 0 });
      }
      // Also include today
      const todayKey = new Date().toISOString().split("T")[0];
      if (!dayMap.has(todayKey)) {
        dayMap.set(todayKey, { jobCount: 0, revenue: 0 });
      }

      jobOrders.forEach((jo) => {
        const key = jo.createdAt.toISOString().split("T")[0];
        const entry = dayMap.get(key);
        if (entry) entry.jobCount += 1;
      });

      bills.forEach((bill) => {
        if (!bill.paidAt) return;
        const key = bill.paidAt.toISOString().split("T")[0];
        const entry = dayMap.get(key);
        if (entry) entry.revenue += Math.abs(bill.grandTotal || 0);
      });

      return Array.from(dayMap.entries())
        .map(([date, data]) => ({ date, ...data }))
        .sort((a, b) => a.date.localeCompare(b.date));
    }),

  salesBreakdown: ownerProcedure
    .input(z.object({ days: z.number().min(1).max(90).default(30) }))
    .query(async ({ ctx, input }) => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - input.days);
      startDate.setHours(0, 0, 0, 0);

      const transactions = await ctx.prisma.stockTransaction.findMany({
        where: { type: "SALE", createdAt: { gte: startDate } },
        include: { product: { select: { name: true, sellPrice: true } } },
      });

      const productMap = new Map<number, { productName: string; totalSold: number; revenue: number }>();

      transactions.forEach((tx) => {
        const existing = productMap.get(tx.productId);
        const qty = Math.abs(tx.qtyChange);
        const rev = qty * (tx.product.sellPrice || 0);
        if (existing) {
          existing.totalSold += qty;
          existing.revenue += rev;
        } else {
          productMap.set(tx.productId, {
            productName: tx.product.name,
            totalSold: qty,
            revenue: rev,
          });
        }
      });

      return Array.from(productMap.values())
        .sort((a, b) => b.totalSold - a.totalSold)
        .slice(0, 10);
    }),

  stockAging: ownerProcedure.query(async ({ ctx }) => {
    // Products with stock > 0
    const products = await ctx.prisma.product.findMany({
      where: { isDeleted: false, stockQuantity: { gt: 0 } },
      select: { id: true, name: true, sku: true, stockQuantity: true, costPrice: true },
    });

    // Last SALE transaction per product
    const lastSales = await ctx.prisma.stockTransaction.findMany({
      where: {
        type: "SALE",
        productId: { in: products.map((p) => p.id) },
      },
      orderBy: { createdAt: "desc" },
      distinct: ["productId"],
      select: { productId: true, createdAt: true },
    });

    const lastSaleMap = new Map(lastSales.map((s) => [s.productId, s.createdAt]));
    const now = new Date();

    return products
      .map((p) => {
        const lastSale = lastSaleMap.get(p.id);
        const daysSinceLastSale = lastSale
          ? Math.floor((now.getTime() - lastSale.getTime()) / (1000 * 60 * 60 * 24))
          : 999; // Never sold = very old
        return {
          productName: p.name,
          sku: p.sku,
          stockQuantity: p.stockQuantity,
          daysSinceLastSale,
          unitCost: p.costPrice || 0,
        };
      })
      .sort((a, b) => b.daysSinceLastSale - a.daysSinceLastSale)
      .slice(0, 15);
  }),
});
