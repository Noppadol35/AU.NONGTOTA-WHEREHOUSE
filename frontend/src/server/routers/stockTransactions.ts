import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';

export const stockTransactionsRouter = router({
  list: protectedProcedure
    .input(z.object({
      jobOrderId: z.number().optional(),
      type: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const where: any = {};
      if (input.jobOrderId) {
        where.jobOrderId = input.jobOrderId;
      }
      if (input.type && input.type.trim().length > 0) {
        where.type = input.type.trim();
      }

      const transactions = await ctx.prisma.stockTransaction.findMany({
        where,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          productId: true,
          qtyChange: true,
          type: true,
          createdAt: true,
          product: {
            select: {
              name: true,
              sku: true,
              sellPrice: true,
            },
          },
        },
      });

      return { items: transactions };
    }),
});
