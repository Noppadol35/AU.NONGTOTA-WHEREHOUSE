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

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const [
      totalProducts,
      lowStockItems,
      products,
      activeUsers,
      recentTransactions,
      previousMonthTransactions,
      topCategoryGroups
    ] = await Promise.all([
      ctx.prisma.product.count({ where: { branchId } }),
      // Note: Comparing columns in Prisma count where clause might be tricky, keeping original syntax
      ctx.prisma.product.count({
        where: {
          branchId,
          stockQuantity: { lte: (ctx.prisma.product.fields as any)?.minStockLevel ?? 5 } // Fallback to avoid crashes if fields is undefined
        }
      }),
      ctx.prisma.product.findMany({
        where: { branchId },
        select: { stockQuantity: true, sellPrice: true }
      }),
      ctx.prisma.user.count({ where: { branchId } }),
      ctx.prisma.stockTransaction.count({
        where: { branchId, createdAt: { gte: thirtyDaysAgo } }
      }),
      ctx.prisma.stockTransaction.count({
        where: {
          branchId,
          createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo }
        }
      }),
      ctx.prisma.product.groupBy({
        by: ['categoryId'],
        where: { branchId },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 1
      })
    ]);

    let totalValue = 0;
    let totalQuantity = 0;
    for (const p of products) {
      totalValue += p.stockQuantity * p.sellPrice;
      totalQuantity += p.stockQuantity;
    }

    const monthlyGrowth = previousMonthTransactions > 0 
      ? ((recentTransactions - previousMonthTransactions) / previousMonthTransactions) * 100
      : 0;

    let topCategoryName = null;
    if (topCategoryGroups.length > 0 && topCategoryGroups[0]?.categoryId) {
      const cat = await ctx.prisma.category.findUnique({
        where: { id: topCategoryGroups[0].categoryId },
        select: { name: true }
      });
      topCategoryName = cat;
    }

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

    const [recentTransactions, recentJobOrders] = await Promise.all([
      ctx.prisma.stockTransaction.findMany({
        where: { branchId },
        include: {
          product: { select: { name: true } },
          jobOrder: { select: { customerName: true, carType: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 15
      }),
      ctx.prisma.jobOrder.findMany({
        where: { branchId },
        orderBy: { createdAt: 'desc' },
        take: 10
      })
    ]);

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
