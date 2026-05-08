import { router, protectedProcedure } from '../trpc';

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

export const dashboardRouter = router({
  stats: protectedProcedure.query(async ({ ctx }) => {
    const dbUser = await ctx.prisma.user.findUnique({
      where: { id: ctx.session.user.id },
      select: { branchId: true },
    });
    const branchId = dbUser?.branchId || 1;

    const totalProducts = await ctx.prisma.product.count({ where: { branchId } });

    const lowStockItems = await ctx.prisma.product.count({
      where: {
        branchId,
        stockQuantity: { lte: ctx.prisma.product.fields.minStockLevel }
      }
    });

    const products = await ctx.prisma.product.findMany({
      where: { branchId },
      select: { stockQuantity: true, sellPrice: true }
    });

    const totalValue = products.reduce((sum, p) => sum + (p.stockQuantity * p.sellPrice), 0);
    const totalQuantity = products.reduce((sum, p) => sum + p.stockQuantity, 0);

    const activeUsers = await ctx.prisma.user.count({ where: { branchId } });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentTransactions = await ctx.prisma.stockTransaction.count({
      where: { branchId, createdAt: { gte: thirtyDaysAgo } }
    });

    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const previousMonthTransactions = await ctx.prisma.stockTransaction.count({
      where: {
        branchId,
        createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo }
      }
    });

    const monthlyGrowth = previousMonthTransactions > 0 
      ? ((recentTransactions - previousMonthTransactions) / previousMonthTransactions) * 100
      : 0;

    const topCategory = await ctx.prisma.product.groupBy({
      by: ['categoryId'],
      where: { branchId },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 1
    });

    const topCategoryName = topCategory.length > 0 && topCategory[0]?.categoryId
      ? await ctx.prisma.category.findUnique({
          where: { id: topCategory[0].categoryId },
          select: { name: true }
        })
      : null;

    return {
      totalProducts,
      totalQuantity,
      lowStockItems,
      totalValue: Math.round(totalValue * 100) / 100,
      activeUsers,
      recentTransactions,
      monthlyGrowth: Math.round(monthlyGrowth * 100) / 100,
      topCategory: topCategoryName?.name || "ไม่มีข้อมูล",
      systemHealth: "Excellent"
    };
  }),

  recentActivities: protectedProcedure.query(async ({ ctx }) => {
    const dbUser = await ctx.prisma.user.findUnique({
      where: { id: ctx.session.user.id },
      select: { branchId: true },
    });
    const branchId = dbUser?.branchId || 1;

    const activities: any[] = [];

    const recentTransactions = await ctx.prisma.stockTransaction.findMany({
      where: { branchId },
      include: {
        product: { select: { name: true } },
        jobOrder: { select: { customerName: true, carType: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 15
    });

    for (const tx of recentTransactions) {
      if (tx.type === 'SALE') {
        activities.push({
          id: tx.id,
          action: "เบิกสินค้า",
          product: `สินค้า ${tx.product?.name}`,
          qty: Math.abs(tx.qtyChange),
          time: getTimeAgo(tx.createdAt),
          timestamp: tx.createdAt,
          type: 'stock-out'
        });
      } else if (tx.type === 'PURCHASE') {
        activities.push({
          id: tx.id,
          action: "รับสินค้า",
          product: `สินค้า ${tx.product?.name}`,
          qty: tx.qtyChange,
          time: getTimeAgo(tx.createdAt),
          timestamp: tx.createdAt,
          type: 'stock-in'
        });
      }
    }

    const recentJobOrders = await ctx.prisma.jobOrder.findMany({
      where: { branchId },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    for (const job of recentJobOrders) {
      activities.push({
        id: job.id,
        action: "งานใหม่",
        customer: job.customerName,
        car: job.carType,
        time: getTimeAgo(job.createdAt),
        timestamp: job.createdAt,
        type: 'job-order'
      });
    }

    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    return activities.slice(0, 10).map(({ timestamp, ...activity }) => activity);
  }),

  topProducts: protectedProcedure.query(async ({ ctx }) => {
    const dbUser = await ctx.prisma.user.findUnique({
      where: { id: ctx.session.user.id },
      select: { branchId: true },
    });
    const branchId = dbUser?.branchId || 1;

    const products = await ctx.prisma.product.findMany({
      where: { branchId, stockQuantity: { gt: 0 } },
      select: { id: true, sku: true, name: true, stockQuantity: true, sellPrice: true },
      orderBy: { stockQuantity: 'desc' },
      take: 10
    });

    return products.map(product => ({
      ...product,
      totalValue: product.stockQuantity * product.sellPrice
    }));
  }),

  lowStockProducts: protectedProcedure.query(async ({ ctx }) => {
    const dbUser = await ctx.prisma.user.findUnique({
      where: { id: ctx.session.user.id },
      select: { branchId: true },
    });
    const branchId = dbUser?.branchId || 1;

    return await ctx.prisma.product.findMany({
      where: {
        branchId,
        stockQuantity: { lte: ctx.prisma.product.fields.minStockLevel }
      },
      select: { id: true, sku: true, name: true, stockQuantity: true, minStockLevel: true },
      orderBy: { stockQuantity: 'asc' },
      take: 20
    });
  }),
});
